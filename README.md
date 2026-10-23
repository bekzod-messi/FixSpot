# FixSpot — Hackathon-Quality Community Maintenance Triage Console

> Built for **Neighborhood Hacks** &bull; Local-First, Zero-Dependency Civic Operations & Triage MVP.

FixSpot is a duplicate-aware community maintenance reporting and triage application. It solves the fragmentation of neighborhood maintenance reports—where duplicate complaints pile up, real urgency is obscured, and progress is untracked—by providing smart duplicate detection, transparent priority scoring, full lifecycle status management, and dynamic category analytics.

---

## 1. Problem Statement

In many neighborhoods, street maintenance issues (potholes, flickering or broken streetlights, damaged sidewalk panels, overflowing waste bins, and clogged storm drains) suffer from three key operational failures:
1. **Redundant & Fragmented Reporting:** Multiple residents independently report the exact same defect, creating ticket noise and dividing public attention.
2. **Opaque Prioritization:** Urgency is either subjective or hidden; residents cannot tell why one repair takes precedence over another.
3. **Black-Hole Status Tracking:** Once an issue is reported, nobody knows whether an inspection occurred, who is working on it, or if it has been verified fixed.

*Note: FixSpot demonstrates an operational triage model; no claims are made regarding official municipal deployment in any specific jurisdiction.*

---

## 2. Key Features

### A. Comprehensive Reporting
- **Multi-Field Issue Log:** Title, category, street/block location, physical description, severity assessment (Urgent, High, Medium, Low), and optional photo upload.
- **Client-Side Photo Processing:** Uploads images directly from the device, automatically scaling them via HTML5 canvas to maintain lightweight browser `localStorage` footprint without external image CDNs.
- **Form Validation & Friendly Feedback:** Highlights required fields with accessible error messages.
- **Recognized Categories:** Roads & Pavement, Street Lighting, Waste & Sanitation, Sidewalks & Curbs, and Other Maintenance.

### B. Intelligent Duplicate Triage & Corroboration
- **Location Normalization Engine:** Strips punctuation, collapses whitespace, and standardizes common street suffixes (`St` &rarr; `Street`, `Ave` &rarr; `Avenue`, `Blvd` &rarr; `Boulevard`, etc.).
- **Title Similarity Analysis:** Evaluates token overlap to detect matching complaints even if phrased slightly differently.
- **Proactive Duplicate Warning:** Displays an inline amber alert before submission showing the existing active ticket.
- **"Also Affected" Community Corroboration:** Lets residents register a +1 confirmation count on an existing issue rather than creating duplicate ticket clutter.

### C. Transparent Priority Scoring
- **Clear Mathematical Formula (0–100 pts):**
  - **Severity Base:** Urgent (40 pts) &bull; High (30 pts) &bull; Medium (20 pts) &bull; Low (10 pts)
  - **Inactivity / Age Weight:** +2.5 points per day unresolved (capped at 30 pts)
  - **Community Corroboration:** +6 points per affected neighbor beyond reporter (capped at 30 pts)
  - **Resolved Issues:** Scaled to 0 pts.
- **Dossier Breakdown:** Every issue clearly displays its mathematical factor breakdown in the inspector panel.
- **Disclaimer:** Explicitly clarified as a community triage aid, not an official government work order dispatch ranking.

### D. Complete Lifecycle Management
- **Four Standard States:** `Reported` &rarr; `Under review` &rarr; `In progress` &rarr; `Resolved`.
- **Reason-Logged Status Updates:** Transitioning status prompts for an update reason/field note (e.g. "Work crew observed on site", "Repairs verified complete").
- **Audit Timeline:** Displays chronological event history for all updates, status changes, and community corroborations.
- **Stale Ticket Detection:** Unresolved tickets with no activity for 7+ days automatically receive a **STALE** badge and advisory warning (clarified as a prompt to re-verify, not proof of neglect).

### E. Overview Metrics & Dynamic Visualization
- **Real-Time Stat Counters:** Total Reports, Unresolved Issues, High Priority Issues (&ge; 50 pts), and Resolved Reports.
- **Interactive Category Distribution Bar Chart:** Visualizes distribution across categories; clicking any bar automatically filters the queue.
- **Lifecycle Pipeline Strip:** CSS progress meter reflecting the real-time ratio of Reported, Under Review, In Progress, and Resolved tickets.

### F. Data Reliability & Backup
- **Local Persistence:** Data persists across browser refreshes in `localStorage` (`fixspot_reports_v2`).
- **Graceful Error Handling:** Invalid or corrupted records fall back cleanly to default records without crashing.
- **JSON Backup:** One-click JSON export and validated file import for data portability.
- **Demo vs. User Distinction:** Sample records are stamped with a prominent `[DEMO]` badge. User-created records omit this badge.

---

## 3. Technology & Architecture

- **Format:** Single self-contained file in [FixSpot/index.html](file:///c:/Users/bekam/Documents/NHProjects/FixSpot/index.html).
- **Languages:** Semantic HTML5, Vanilla CSS with custom properties (CSS variables), and modern Vanilla JavaScript (ES6+).
- **Design Tokens:**
  - Background: Warm-neutral canvas (`#f7f6f2`)
  - Typography: Charcoal palette (`#141517`, `#222427`, `#4f535c`) + monospaced data fields
  - Accents: Signal-orange priority cues (`#ea580c`, `#fff7ed`, `#fdba74`)
- **Zero External Dependencies:** No npm packages, frameworks (`React`, `Vue`), build steps (`webpack`, `vite`), remote CDNs, or external tracking.

---

## 4. Setup & Running Locally

1. **Direct Browser Launch:**
   - Double-click or open [FixSpot/index.html](file:///c:/Users/bekam/Documents/NHProjects/FixSpot/index.html) in Google Chrome, Microsoft Edge, Firefox, or Safari.
2. **Local Static Server (Optional):**
   ```powershell
   python -m http.server 8080
   ```
   Open `http://localhost:8080/FixSpot/index.html`.

---

## 5. Verification & Acceptance Testing

A dedicated unit test runner is included at [FixSpot/test-runner.js](file:///c:/Users/bekam/Documents/NHProjects/FixSpot/test-runner.js). Run:
```powershell
node FixSpot/test-runner.js
```

### Manual Test Checklist:
1. **Create Valid Report:** Click `➕ Report Maintenance Issue`, fill in all required fields, and submit. Verify it appears at the top of the queue with priority score and no demo tag.
2. **Form Validation:** Try submitting an empty form. Confirm field errors appear and the form is rejected.
3. **Duplicate Detection:** In the report modal, type Category `Roads & Pavement` and Location `Oak St & 4th Ave`. Verify the amber warning box appears with `#RPT-1001`. Click `Corroborate Existing Report` &rarr; verify affected count increases and ticket is focused.
4. **Filter & Search:**
   - Click the "Roads & Pavement" bar in the chart &rarr; table filters to road issues.
   - Filter by `Status: Stale (7+ days inactive)` &rarr; verify `#RPT-1003` is isolated.
   - Type `Pine` in search &rarr; streetlight report appears.
   - Click `Reset` to restore full queue.
5. **Status Transition:**
   - Select an issue in the queue.
   - Change status to `In progress`, type update reason `Crew assigned with cold patch asphalt`, and click `Apply Status Update`.
   - Confirm status badge updates in table and new entry is added to timeline.
6. **Refresh Persistence:** Press `F5` / reload browser. Verify all edits, corroborations, and new reports persist.
7. **JSON Backup & Reset:**
   - Click `💾 Data & Backup` &rarr; click `Export JSON Backup` &rarr; verify file downloads.
   - Click `Reload Standard Demo Records` &rarr; verify clean demo state is restored.

---

## 6. Known Limitations & Future Improvements

- **Local Scope:** Data is saved strictly in the user's browser `localStorage` on the current device. It does not sync to an external server or public municipal portal.
- **Future Improvements:**
  - Client-side GPS geolocation auto-fill for coordinates.
  - Offline ServiceWorker PWA caching for disconnected field inspections.
  - Multi-photo attachment gallery.
