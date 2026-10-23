const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('FixSpot/index.html', 'utf8');

// 1. Verify required DOM elements
const requiredIds = [
  'metricTotal', 'metricUnresolved', 'metricHighPriority', 'metricResolved',
  'categoryBarsContainer', 'statusPipelineStrip',
  'filterSearch', 'filterCategory', 'filterStatus', 'filterSeverity', 'sortBy', 'resetFiltersBtn',
  'queueTableBody', 'tableEmptyState',
  'inspectorPanel', 'inspId', 'inspBadges', 'inspTitle', 'inspLocation',
  'inspPhotoWrapper', 'inspPhotoImg', 'inspPriorityTotal', 'inspPriorityBreakdown',
  'inspStaleWarning', 'inspDescription', 'inspAffectedCount', 'inspBoostBtn',
  'inspStatusSelect', 'inspStatusReason', 'inspUpdateStatusBtn', 'inspTimeline',
  'newReportModal', 'newReportForm', 'repTitle', 'repCategory', 'repSeverity', 'repLocation', 'repDescription', 'repPhotoFile',
  'duplicateAlertBox', 'dupAddAffectedBtn', 'dupIgnoreBtn',
  'storageModal', 'exportJsonBtn', 'triggerImportBtn', 'importFileInput', 'loadDefaultDemoBtn', 'clearAllBtn', 'resetDemoBtn'
];

let missing = [];
requiredIds.forEach(id => {
  if (!html.includes('id="' + id + '"')) {
    missing.push(id);
  }
});

if (missing.length > 0) {
  console.error('FAIL: Missing HTML elements:', missing);
  process.exit(1);
} else {
  console.log('PASS: All', requiredIds.length, 'required UI element IDs verified.');
}

// 2. Extract script and evaluate logic
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No script block found');
  process.exit(1);
}

const mockStorage = {};
const sandbox = {
  localStorage: {
    getItem: k => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; },
    removeItem: k => { delete mockStorage[k]; }
  },
  console,
  Date,
  Math,
  Set,
  Array,
  Object,
  JSON,
  document: {
    addEventListener: () => {},
    getElementById: () => ({
      addEventListener: () => {},
      querySelectorAll: () => [],
      style: {},
      classList: { add: () => {}, remove: () => {} },
      children: [ { style: {} }, { style: {} }, { style: {} }, { style: {} } ]
    }),
    querySelectorAll: () => []
  },
  alert: console.log,
  confirm: () => true
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// 3. Test Priority Scoring Formula
const testReportUrgent = {
  id: 'RPT-TEST-1',
  severity: 'Urgent',
  status: 'reported',
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  alsoAffectedCount: 3
};
const prioUrgent = sandbox.calculatePriorityScore(testReportUrgent);
// Severity 40 + age (4 * 2.5 = 10) + corroboration ((3-1)*6 = 12) = 62
console.log('PASS: Priority score calculated:', prioUrgent.total, 'pts | Level:', prioUrgent.levelLabel);
if (prioUrgent.total !== 62) {
  console.error('FAIL: Expected priority score 62, got', prioUrgent.total);
  process.exit(1);
}

// 4. Test Resolved report priority score
const testResolved = {
  id: 'RPT-TEST-2',
  severity: 'Urgent',
  status: 'resolved',
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  alsoAffectedCount: 5
};
const prioResolved = sandbox.calculatePriorityScore(testResolved);
if (prioResolved.total !== 0) {
  console.error('FAIL: Resolved report must have 0 priority score, got', prioResolved.total);
  process.exit(1);
}
console.log('PASS: Resolved report priority score is 0.');

// 5. Test Stale Check (7+ days inactive)
const testStale = {
  status: 'under-review',
  lastUpdatedAt: new Date(Date.now() - 86400000 * 8).toISOString()
};
const testFresh = {
  status: 'under-review',
  lastUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
};
if (!sandbox.isStale(testStale) || sandbox.isStale(testFresh)) {
  console.error('FAIL: Stale check calculation failed');
  process.exit(1);
}
console.log('PASS: Stale check correctly identifies 7+ day inactive unresolved items.');

// 6. Test Location Normalization and Duplicate Detection
const loc1 = sandbox.normalizeLocation('Oak St. and 4th Ave.');
const loc2 = sandbox.normalizeLocation('oak street and 4th avenue');
console.log('Normalized locations:', loc1, '===', loc2);
if (loc1 !== loc2) {
  console.error('FAIL: Normalization mismatch between', loc1, 'and', loc2);
  process.exit(1);
}

const dupMatch = vm.runInContext("reports = CONFIG.defaultDemoReports; findDuplicateCandidate('roads', 'Oak St & 4th Ave', 'Pothole issue');", sandbox);
if (!dupMatch || dupMatch.id !== 'RPT-1001') {
  console.error('FAIL: Duplicate detection failed to find RPT-1001, got', dupMatch);
  process.exit(1);
}
console.log('PASS: Duplicate detection accurately identified candidate', dupMatch.id, 'for Oak St & 4th Ave');

console.log('--- ALL TEST SUITES PASSED CLEANLY ---');
