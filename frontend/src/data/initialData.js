export const KEY = 'smartcare-m1m2-v1';
export const OLD_KEY = 'smartcare-m1-v1';
export const DAY = 864e5;

export const MODS = [
  { n: '01', t: 'Project Initiation & Integration', s: 'Charter, plan, status, closure', k: 'm1', live: true },
  { n: '02', t: 'Scope Management & WBS', s: 'Requirements, WBS, change requests, scope gate', k: 'm2', live: true },
  { n: '03', t: 'Schedule & Resource Management', s: 'Activities, Gantt, critical path', k: 'm3', live: true },
  { n: '04', t: 'Cost Management & EVM', s: 'Budget, PV, EV, AC, CPI, SPI', k: 'm4', live: true },
  { n: '05', t: 'Quality Management & Risk Control', s: 'Defects, checklists, PDPC', k: 'm5', live: true },
  { n: '06', t: 'Integration, Validation & Reporting', s: 'Consistency checks, dashboards', k: 'm6', live: true }
];

export const SUBS1 = [
  ['charter', '1.1 Charter'],
  ['plan', '1.2 Management plan'],
  ['status', '1.3 Status & milestones'],
  ['resp', '1.4 Responsibilities'],
  ['close', '1.5 Closure records']
];
export const SUBS = SUBS1;

export const SUBS2 = [
  ['req', '2.1 Requirements'],
  ['wbs', '2.2 WBS'],
  ['cr', '2.3 Change requests'],
  ['base', '2.4 Approved scope']
];

export const SUB3 = [
  ['sched', '3.1 Activities & schedule'],
  ['gantt', '3.2 Gantt chart'],
  ['delay', '3.3 Delay impact'],
  ['res', '3.4 Resources']
];

export const SUB4 = [
  ['est', '4.1 Cost estimates'],
  ['evm', '4.2 EVM indicators'],
  ['warn', '4.3 Thresholds & warnings']
];

export const SUB5 = [
  ['def', '5.1 Defect tracker'],
  ['chk', '5.2 Quality checklist'],
  ['mat', '5.3 Prioritisation matrix'],
  ['pdpc', '5.4 PDPC risk response']
];

export const SUB6 = [
  ['cons', '6.1 Consistency checks'],
  ['test', '6.2 Test cases'],
  ['dash', '6.3 Dashboard & report']
];

export const ragLabel = { G: 'On track', A: 'At risk', R: 'Off track' };
export const ragTone = { G: 'ok', A: 'warn', R: 'bad' };

export const statusTone = {
  Approved: 'ok',
  Proposed: 'warn',
  Deferred: 'info',
  Rejected: 'bad'
};

export const prioTone = {
  Must: 'bad',
  Should: 'warn',
  Could: 'info'
};

export const pad = (n) => String(n).padStart(2, '0');
export const ymd = (t) => `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
export const todayISO = () => ymd(new Date());

export const money = (n) => 'PKR ' + Math.round(+n || 0).toLocaleString('en-US');
export const num = (n) => Math.round(+n || 0).toLocaleString('en-US');

export const addDays = (iso, d) => {
  if (!iso) return '—';
  const t = new Date(iso + 'T00:00:00');
  t.setDate(t.getDate() + Math.round(d));
  return ymd(t);
};

export const diff = (a, b) => {
  if (!a || !b) return 0;
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / DAY);
};

export const fmt = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return iso;
  }
};

export const bandOf = (sc) => (sc >= 15 ? ['Critical', 'bad'] : sc >= 8 ? ['Moderate', 'warn'] : ['Low', 'ok']);

export function getSeedData() {
  return {
    charter: {
      name: 'Smart Healthcare Project Management System',
      client: 'Five-hospital network',
      sponsor: 'Hospital Management Board',
      manager: 'Project Manager',
      start: '2026-08-03',
      deadline: '2026-11-23',
      budget: 5000000,
      reserve: 400000,
      status: 'Executing',
      objectives:
        'Deliver appointments, lab reports, doctor schedules, online consultations and hospital billing across five hospitals, with patient records integrated end to end.',
      inScope:
        'Patient appointments\nLaboratory reports\nDoctor schedules\nOnline consultations\nHospital billing\nPatient records',
      outScope: 'Hardware procurement\nLegacy data migration older than 2 years'
    },
    stakeholders: [
      { id: 1, name: 'Hospital Management Board', role: 'Sponsor', interest: 'High' },
      { id: 2, name: 'Chief Medical Officer', role: 'Clinical approver', interest: 'High' },
      { id: 3, name: 'Hospital IT Heads (x5)', role: 'Primary users', interest: 'High' },
      { id: 4, name: 'Doctors & patients', role: 'End users', interest: 'Medium' }
    ],
    plan: {
      scope:
        'Five functional modules plus integration with five hospital networks. AI preliminary diagnosis and mobile app are not in the baseline and enter only through change control.',
      phases: [
        { name: 'Initiation & planning', start: '2026-08-03', end: '2026-08-16' },
        { name: 'Architecture & design', start: '2026-08-17', end: '2026-08-30' },
        { name: 'Database build', start: '2026-08-31', end: '2026-09-13' },
        { name: 'Module development', start: '2026-09-14', end: '2026-10-12' },
        { name: 'Integration & QA', start: '2026-10-13', end: '2026-11-02' },
        { name: 'UAT & sign-off', start: '2026-11-03', end: '2026-11-16' },
        { name: 'Deployment & handover', start: '2026-11-17', end: '2026-11-23' }
      ],
      costs: [
        { name: 'Analysis & design', amount: 650000 },
        { name: 'Database build', amount: 500000 },
        { name: 'Module development (4 modules)', amount: 2850000 },
        { name: 'Integration & QA', amount: 350000 },
        { name: 'UAT & sign-off support', amount: 150000 },
        { name: 'Deployment & handover', amount: 100000 }
      ],
      quality: [
        { id: 1, criterion: 'Backend unit test coverage', target: '≥ 80%', owner: 'QA Engineer' },
        { id: 2, criterion: 'Critical defects open at go-live', target: '0', owner: 'QA Engineer' },
        { id: 3, criterion: 'Patient data encrypted at rest and in transit', target: '100%', owner: 'Database Developer' },
        { id: 4, criterion: 'Appointment booking response time', target: '< 2 s', owner: 'Backend Developer 1' },
        { id: 5, criterion: 'UAT sign-off from all five hospitals', target: '5 / 5', owner: 'Project Manager' }
      ]
    },
    milestones: [
      { name: 'Charter & plan approved', date: '2026-08-16', status: 'Done' },
      { name: 'Design freeze', date: '2026-08-30', status: 'Done' },
      { name: 'Core modules complete', date: '2026-10-12', status: 'In progress' },
      { name: 'QA sign-off', date: '2026-11-02', status: 'Not started' },
      { name: 'Go-live', date: '2026-11-23', status: 'Not started' }
    ],
    responsibilities: [
      { role: 'Project Manager', person: 'Project Manager', resp: 'Overall delivery, stakeholder comms, change control, UAT coordination' },
      { role: 'Backend Developers (2)', person: 'Backend Dev 1 & 2', resp: 'Scheduling, lab and billing APIs, business rules' },
      { role: 'Frontend Developers (2)', person: 'Frontend Dev 1 & 2', resp: 'Dashboards, doctor schedule UI, patient portal' },
      { role: 'Database Developer', person: 'Database Developer', resp: 'Schema, patient record store, merge logic, backups' },
      { role: 'QA Engineer', person: 'QA Engineer', resp: 'Test plans, defect tracking, quality gate' }
    ],
    log: [
      { date: '2026-08-16', rag: 'G', pct: 12, note: 'Charter approved by sponsor. Team of seven onboarded.' },
      { date: '2026-08-30', rag: 'G', pct: 20, note: 'Design freeze met on schedule.' },
      { date: '2026-10-02', rag: 'A', pct: 55, note: 'Appointments module at 55%. Lab integration slipping 7 days due to HIS API delays.' }
    ],
    reqs: [
      { id: 'R1', title: 'Patient appointment management', desc: 'Book, reschedule and cancel appointments with conflict-free slots per doctor.', prio: 'Must', rank: 1, status: 'Approved', source: 'Hospital IT heads', ac: 'No double-booking possible; reschedule in 2 clicks or fewer', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R2', title: 'Laboratory report management', desc: 'Upload, store and view lab reports linked to each patient file.', prio: 'Must', rank: 2, status: 'Approved', source: 'Hospital lab heads', ac: 'PDF reports attach to the patient file in 5 s or less', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R3', title: 'Doctor schedule management', desc: 'Doctors set availability, leave and on-call shifts.', prio: 'Must', rank: 3, status: 'Approved', source: 'CMO office', ac: 'Schedule changes visible to the booking engine within 1 minute', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R4', title: 'Online consultations', desc: 'Text and video consultations booked from the patient portal.', prio: 'Must', rank: 4, status: 'Approved', source: 'Hospital IT heads', ac: 'Consultation booked and joined end to end in test hospital', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R5', title: 'Hospital billing', desc: 'Generate itemised invoices per visit, including lab and consultation charges.', prio: 'Must', rank: 5, status: 'Approved', source: 'Finance office', ac: 'Invoice totals match visit charges with zero rounding error', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R6', title: 'Patient record management', desc: 'One record per patient across the five hospitals, with safe duplicate merge.', prio: 'Must', rank: 6, status: 'Approved', source: 'Hospital records office', ac: 'Duplicate merge keeps full history and passes audit log review', approvedOn: '2026-08-16', approvedBy: 'Hospital Management Board' },
      { id: 'R7', title: 'AI-based preliminary diagnosis', desc: 'Symptom-based decision support for triage. Advisory only.', prio: 'Should', rank: 7, status: 'Proposed', source: 'Hospital management (CR-01)', ac: 'Advisory output only; clinician sign-off recorded on every case', approvedOn: '', approvedBy: '' },
      { id: 'R8', title: 'Mobile application', desc: 'Android and iOS app for doctors and patients: schedules and reports.', prio: 'Should', rank: 8, status: 'Proposed', source: 'Hospital management (CR-02)', ac: 'Core flows usable offline for 24 hours', approvedOn: '', approvedBy: '' }
    ],
    wbs: [
      { id: 'W1', name: 'Smart Healthcare PMS', parent: null, req: '' },
      { id: 'W2', name: 'Appointments', parent: 'W1', req: 'R1' },
      { id: 'W3', name: 'Scheduling engine', parent: 'W2', req: '' },
      { id: 'W4', name: 'Conflict checks', parent: 'W2', req: '' },
      { id: 'W5', name: 'Laboratory reports', parent: 'W1', req: 'R2' },
      { id: 'W6', name: 'Doctor schedules', parent: 'W1', req: 'R3' },
      { id: 'W7', name: 'Online consultation', parent: 'W1', req: 'R4' },
      { id: 'W8', name: 'Hospital billing', parent: 'W1', req: 'R5' },
      { id: 'W9', name: 'Patient records', parent: 'W1', req: 'R6' },
      { id: 'W10', name: 'Duplicate-merge logic', parent: 'W9', req: '' },
      { id: 'W11', name: 'AI diagnosis engine', parent: 'W1', req: 'R7' },
      { id: 'W12', name: 'Mobile application', parent: 'W1', req: 'R8' },
      { id: 'W13', name: 'Integration & QA', parent: 'W1', req: '' },
      { id: 'W14', name: 'Deployment & handover', parent: 'W1', req: '' }
    ],
    changes: [
      { id: 'CR-01', title: 'AI-based preliminary diagnosis module', just: 'Hospital management requested decision support during triage.', requestedBy: 'Hospital management', submitted: '2026-09-20', cost: 500000, days: 14, decision: 'Pending', req: 'R7' },
      { id: 'CR-02', title: 'Mobile application', just: 'Doctors and patients need on-the-go access to schedules and reports.', requestedBy: 'Hospital management', submitted: '2026-09-20', cost: 300000, days: 7, decision: 'Pending', req: 'R8' },
      { id: 'CR-03', title: 'SMS appointment reminders', just: 'Reduce no-shows at the five hospitals.', requestedBy: 'Hospital IT heads', submitted: '2026-10-05', cost: 60000, days: 3, decision: 'Pending', req: '' }
    ],
    closure: [
      { t: 'Final acceptance signed by sponsor', done: false },
      { t: 'All approved change requests closed', done: false },
      { t: 'Lessons learned recorded', done: false },
      { t: 'Team resources released', done: false },
      { t: 'Handover documents delivered to hospital IT', done: false }
    ],
    closeRec: { lessons: '', acceptance: 'Pending', date: '' },
    statusDate: '2026-10-02',
    team: [
      { id: 'M1', name: 'Project Manager', role: 'PM' },
      { id: 'M2', name: 'Backend Developer 1', role: 'Backend' },
      { id: 'M3', name: 'Backend Developer 2', role: 'Backend' },
      { id: 'M4', name: 'Frontend Developer 1', role: 'Frontend' },
      { id: 'M5', name: 'Frontend Developer 2', role: 'Frontend' },
      { id: 'M6', name: 'Database Developer', role: 'Database' },
      { id: 'M7', name: 'QA Engineer', role: 'QA' }
    ],
    acts: [
      { id: 'A1', name: 'Charter, requirements & planning', owner: 'M1', dur: 14, deps: [], budget: 250000, pct: 100, ac: 240000, slip: 0 },
      { id: 'A2', name: 'Architecture & UI/UX design', owner: 'M2', dur: 14, deps: ['A1'], budget: 400000, pct: 100, ac: 415000, slip: 0 },
      { id: 'A3', name: 'Database schema & patient record store', owner: 'M6', dur: 14, deps: ['A2'], budget: 500000, pct: 100, ac: 505000, slip: 0 },
      { id: 'A4', name: 'Appointment & scheduling module', owner: 'M2', dur: 28, deps: ['A3'], budget: 800000, pct: 55, ac: 500000, slip: 0 },
      { id: 'A5', name: 'Lab reports & billing module', owner: 'M3', dur: 28, deps: ['A3'], budget: 700000, pct: 40, ac: 330000, slip: 7 },
      { id: 'A6', name: 'Doctor schedules & dashboards', owner: 'M4', dur: 28, deps: ['A3'], budget: 650000, pct: 70, ac: 470000, slip: 0 },
      { id: 'A7', name: 'Online consultation & patient portal', owner: 'M5', dur: 28, deps: ['A3'], budget: 700000, pct: 30, ac: 240000, slip: 0 },
      { id: 'A8', name: 'Integration, QA & defect fixing', owner: 'M7', dur: 21, deps: ['A4', 'A5', 'A6', 'A7'], budget: 350000, pct: 0, ac: 0, slip: 0 },
      { id: 'A9', name: 'Hospital UAT & sign-off', owner: 'M1', dur: 14, deps: ['A8'], budget: 150000, pct: 0, ac: 0, slip: 0 },
      { id: 'A10', name: 'Deployment & handover', owner: 'M1', dur: 7, deps: ['A9'], budget: 100000, pct: 0, ac: 0, slip: 0 }
    ],
    crProg: {},
    thresholds: { cpi: 0.95, spi: 0.95 },
    defects: [
      { id: 'D1', title: 'Double-booking allowed for the same doctor slot', sev: 'Critical', act: 'A4', owner: 'M2', status: 'Open' },
      { id: 'D2', title: 'Duplicate patient record created on merge', sev: 'Critical', act: 'A3', owner: 'M6', status: 'In Progress' },
      { id: 'D3', title: 'Lab PDF not attached to patient file', sev: 'Major', act: 'A5', owner: 'M3', status: 'Open' },
      { id: 'D4', title: 'Rounding error on multi-test invoices', sev: 'Minor', act: 'A5', owner: 'M3', status: 'Resolved' }
    ],
    checklist: [
      { id: 'Q1', item: 'SRS signed off by hospital IT heads', deliv: 'Requirements specification', result: 'Pass', by: 'M7' },
      { id: 'Q2', item: 'Database schema reviewed and normalised', deliv: 'DB schema', result: 'Pass', by: 'M7' },
      { id: 'Q3', item: 'Backend unit test coverage at least 80%', deliv: 'Backend build', result: 'Fail', by: 'M7' },
      { id: 'Q4', item: 'Patient data encrypted at rest', deliv: 'Security review', result: 'Pending', by: 'M7' },
      { id: 'Q5', item: 'Appointment conflict test cases passed', deliv: 'Appointments module', result: 'Fail', by: 'M7' },
      { id: 'Q6', item: 'User manual reviewed', deliv: 'Documentation', result: 'Pending', by: 'M1' }
    ],
    risks: [
      { id: 'K1', title: 'Scope creep from AI and mobile requests', pp: 'Unbudgeted modules extend cost and deadline', L: 4, I: 5, prev: 'Formal change control; scope freeze at design freeze', corr: 'Re-baseline via approved change request' },
      { id: 'K2', title: 'Key backend developer absence', pp: 'Backend critical path stalls', L: 3, I: 4, prev: 'Pair programming; shared code ownership', corr: 'Reassign PM/QA support; accept slip days' },
      { id: 'K3', title: 'Patient data privacy breach', pp: 'Unauthorised access to patient records', L: 2, I: 5, prev: 'Role-based access, encryption, audit logs', corr: 'Activate incident plan; notify hospital data officer' },
      { id: 'K4', title: 'Late hospital HIS integration', pp: 'Lab and billing data unavailable at UAT', L: 4, I: 3, prev: 'Agree API contracts with hospital IT early', corr: 'Mock service layer; phased rollout' },
      { id: 'K5', title: 'AI module cost overrun', pp: 'Budget exceeded for diagnosis module', L: 3, I: 4, prev: 'Fixed-scope vendor sprint for the model', corr: 'Replace model with a rules-based engine' },
      { id: 'K6', title: 'Scheduling defects found late', pp: 'Double-booking reaches go-live', L: 4, I: 4, prev: 'Automated conflict tests every sprint', corr: 'Dedicated fix sprint before UAT' }
    ],
    testcases: [
      { id: 'TC-01', title: 'Baseline finish with no approved changes', expected: '112 days', actual: '112 days', status: 'PASS' },
      { id: 'TC-02', title: 'Approving CR-01 and CR-02 extends finish by 21 days', expected: '133 days', actual: '133 days', status: 'PASS' },
      { id: 'TC-03', title: 'Activity estimates + reserve equal approved budget', expected: 'PKR 4,900,000', actual: 'PKR 4,999,985', status: 'FAIL' },
      { id: 'TC-04', title: 'Approving both changes adds their cost', expected: '+PKR 800,000', actual: '+PKR 800,000', status: 'PASS' },
      { id: 'TC-05', title: 'Slip on a predecessor shifts its successor in the forecast', expected: '3 days', actual: '3 days', status: 'PASS' },
      { id: 'TC-06', title: 'Circular dependency is detected', expected: 'Detected', actual: 'Detected', status: 'PASS' },
      { id: 'TC-07', title: 'Unapproved requirement is blocked from WBS', expected: 'Blocked', actual: 'Blocked', status: 'PASS' },
      { id: 'TC-08', title: 'Planned value never exceeds BAC', expected: '≤ PKR 4,599,985', actual: 'PKR 2,982,128', status: 'PASS' },
      { id: 'TC-09', title: 'CPI equals EV ÷ AC', expected: '1.25', actual: '1.25', status: 'PASS' },
      { id: 'TC-10', title: 'Cost overrun warning raised exactly when CPI is below threshold', expected: 'Raised', actual: 'Raised', status: 'PASS' },
      { id: 'TC-11', title: 'Empty requirement title is rejected', expected: 'Error raised', actual: 'Error raised', status: 'PASS' },
      { id: 'TC-12', title: 'Risk score 4×5 falls in the Critical band', expected: 'Critical', actual: 'Critical', status: 'PASS' }
    ]
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.charter && s.plan) {
        const sd = getSeedData();
        if (!s.reqs) s.reqs = sd.reqs;
        if (!s.wbs) s.wbs = sd.wbs;
        if (!s.acts) s.acts = sd.acts;
        if (!s.team) s.team = sd.team;
        if (!s.defects) s.defects = sd.defects;
        if (!s.checklist) s.checklist = sd.checklist;
        if (!s.risks) s.risks = sd.risks;
        if (!s.testcases || !s.testcases.length) s.testcases = sd.testcases;
        if (!s.thresholds) s.thresholds = sd.thresholds;
        if (!s.crProg) s.crProg = sd.crProg;
        if (!s.statusDate) s.statusDate = sd.statusDate;
        s.changes = (s.changes || []).map((c) => ({
          ...(sd.changes.find((d) => d.id === c.id) || {}),
          ...c
        }));
        sd.changes.forEach((d) => {
          if (!s.changes.find((c) => c.id === d.id)) s.changes.push(d);
        });
        return s;
      }
    }
  } catch (e) {
    console.error('Error loading data from localStorage', e);
  }
  return getSeedData();
}

export function buildCodeMap(wbs) {
  const m = {};
  const walk = (parent, prefix) => {
    (wbs || [])
      .filter((w) => (w.parent || null) === parent)
      .forEach((w, i) => {
        const c = prefix ? `${prefix}.${i + 1}` : String(i + 1);
        m[w.id] = c;
        walk(w.id, c);
      });
  };
  walk(null, '');
  return m;
}

export function getScopeInfo(id, wbs, reqs) {
  const w = (wbs || []).find((x) => x.id === id);
  if (!w) return { ok: false, reason: 'missing' };
  if (w.req) {
    const r = (reqs || []).find((x) => x.id === w.req);
    if (!r) return { ok: false, reason: 'unknown requirement' };
    if (r.status !== 'Approved') return { ok: false, reason: `${w.req} ${r.status.toLowerCase()}` };
  }
  if (w.parent) {
    const p = getScopeInfo(w.parent, wbs, reqs);
    if (!p.ok) return { ok: false, reason: 'parent excluded' };
  }
  return { ok: true, reason: '' };
}

export function nextId(p, arr) {
  const max = Math.max(0, ...(arr || []).map((x) => parseInt(String(x.id).replace(/\D/g, ''), 10) || 0));
  const nextNum = max + 1;
  if (p === 'TC-' && nextNum < 10) {
    return `${p}0${nextNum}`;
  }
  return p + nextNum;
}

/**
 * Automatically determine PASS or FAIL based on expected and actual values
 */
export function evaluateTestCase(expected, actual) {
  if (expected === undefined || expected === null || actual === undefined || actual === null) {
    return 'FAIL';
  }
  const expStr = String(expected).trim();
  const actStr = String(actual).trim();

  if (!expStr && !actStr) return 'PASS';
  if (!expStr || !actStr) return 'FAIL';

  // Direct case-insensitive string equality
  if (expStr.toLowerCase() === actStr.toLowerCase()) {
    return 'PASS';
  }

  // Handle inequality operators in expected like "<= 100", "≤ 100", ">= 50", "≥ 50", "< 10", "> 10"
  const ineqMatch = expStr.match(/^([≤<≥>]=?|<=|>=)\s*(.+)$/);
  if (ineqMatch) {
    const op = ineqMatch[1];
    const numExp = parseFloat(ineqMatch[2].replace(/[^\d.-]/g, ''));
    const numAct = parseFloat(actStr.replace(/[^\d.-]/g, ''));
    if (!isNaN(numExp) && !isNaN(numAct)) {
      if ((op === '≤' || op === '<=') && numAct <= numExp + 0.0001) return 'PASS';
      if ((op === '≥' || op === '>=') && numAct >= numExp - 0.0001) return 'PASS';
      if (op === '<' && numAct < numExp) return 'PASS';
      if (op === '>' && numAct > numExp) return 'PASS';
      return 'FAIL';
    }
  }

  // Strip thousands commas and compare
  const cleanExp = expStr.replace(/,/g, '').toLowerCase();
  const cleanAct = actStr.replace(/,/g, '').toLowerCase();
  if (cleanExp === cleanAct) {
    return 'PASS';
  }

  // Compare numeric component if non-numeric parts match
  const expN = parseFloat(cleanExp.replace(/[^\d.-]/g, ''));
  const actN = parseFloat(cleanAct.replace(/[^\d.-]/g, ''));
  if (!isNaN(expN) && !isNaN(actN) && cleanExp.replace(/[\d.-]/g, '').trim() === cleanAct.replace(/[\d.-]/g, '').trim()) {
    return Math.abs(expN - actN) < 0.001 ? 'PASS' : 'FAIL';
  }

  return 'FAIL';
}

/* ==================== SCHEDULING & CPM ENGINE ==================== */
export function buildSchedActs(data, customChanges = null) {
  const changes = customChanges || data.changes || [];
  const approvedCRs = changes.filter((c) => c.decision === 'Approved');
  const base = (data.acts || []).map((a) => ({ ...a, deps: [...a.deps], isCR: false }));
  let prev = null;
  const crIds = [];

  approvedCRs.forEach((c) => {
    const p = (data.crProg && data.crProg[c.id]) || {};
    base.push({
      id: c.id,
      cr: c.id,
      name: `CR ${c.id}: ${c.title}`,
      owner: p.owner || 'M1',
      dur: +c.days,
      deps: prev ? [prev] : ['A4', 'A5', 'A6', 'A7'],
      budget: +c.cost,
      pct: +p.pct || 0,
      ac: +p.ac || 0,
      slip: +p.slip || 0,
      isCR: true
    });
    crIds.push(c.id);
    prev = c.id;
  });

  base.forEach((a) => {
    if (a.id === 'A8') {
      a.deps = ['A4', 'A5', 'A6', 'A7', ...crIds];
    }
  });

  return base;
}

export function runCpm(acts, isForecast = false) {
  const map = Object.fromEntries(acts.map((a) => [a.id, a]));
  const res = {};
  const seen = new Set();
  let cycle = false;

  const getDur = (a) => (isForecast ? a.dur + (+a.slip || 0) : a.dur);

  // 1. Forward Pass (Early Start & Early Finish)
  const forward = (id) => {
    if (res[id]) return res[id];
    if (seen.has(id)) {
      cycle = true;
      return { ES: 0, EF: 0, dur: 0, LS: 0, LF: 0, TF: 0, isCritical: false };
    }
    seen.add(id);
    const a = map[id];
    let ES = 0;
    (a.deps || []).forEach((d) => {
      if (map[d]) ES = Math.max(ES, forward(d).EF);
    });
    seen.delete(id);
    const dur = getDur(a);
    res[id] = { ES, EF: ES + dur, dur };
    return res[id];
  };

  acts.forEach((a) => forward(a.id));
  const projectEnd = Math.max(0, ...Object.values(res).map((r) => r.EF));

  // 2. Build Successors map for Backward Pass
  const succMap = {};
  acts.forEach((a) => {
    succMap[a.id] = [];
  });
  acts.forEach((a) => {
    (a.deps || []).forEach((d) => {
      if (succMap[d]) succMap[d].push(a.id);
    });
  });

  // 3. Backward Pass (Late Finish & Late Start)
  const backwardSeen = new Set();
  const backward = (id) => {
    if (res[id].LF !== undefined) return res[id];
    if (backwardSeen.has(id)) return res[id];
    backwardSeen.add(id);

    const succs = succMap[id] || [];
    let LF = projectEnd;
    if (succs.length > 0) {
      LF = Math.min(...succs.map((sId) => backward(sId).LS));
    }
    backwardSeen.delete(id);

    const LS = LF - res[id].dur;
    const TF = LS - res[id].ES; // Total Float / Slack
    res[id].LF = LF;
    res[id].LS = LS;
    res[id].TF = TF;
    res[id].isCritical = TF <= 0;
    return res[id];
  };

  acts.forEach((a) => backward(a.id));

  // 4. Critical Path chain
  const criticalActs = acts
    .filter((a) => res[a.id]?.isCritical)
    .sort((a, b) => res[a.id].ES - res[b.id].ES);

  return {
    res,
    end: projectEnd,
    cycle,
    criticalActs
  };
}

export function calculateScheduleAndEvm(data) {
  const C = data.charter;
  const statusDate = data.statusDate || '2026-10-02';
  const sd = diff(C.start, statusDate);
  const contractDay = diff(C.start, C.deadline);

  const apprCR = (data.changes || []).filter((c) => c.decision === 'Approved');
  const acts = buildSchedActs(data);
  const plan = runCpm(acts, false);
  const fc = runCpm(acts, true);

  const rows = acts.map((a) => {
    const p = plan.res[a.id] || { ES: 0, EF: 0, dur: 0, LS: 0, LF: 0, TF: 0, isCritical: false };
    const f = fc.res[a.id] || { ES: 0, EF: 0, dur: 0, LS: 0, LF: 0, TF: 0, isCritical: false };
    const pct = +a.pct || 0;
    const budget = +a.budget || 0;
    const ac = +a.ac || 0;
    const slip = +a.slip || 0;

    const pp = Math.min(1, Math.max(0, (sd - p.ES) / (p.dur || 1)));
    const pv = budget * pp;
    const ev = (budget * pct) / 100;

    const startDate = addDays(C.start, p.ES);
    const endDate = addDays(C.start, p.EF);
    const forecastStartDate = addDays(C.start, f.ES);
    const forecastEndDate = addDays(C.start, f.EF);
    const lsDate = addDays(C.start, p.LS);
    const lfDate = addDays(C.start, p.LF);

    return {
      ...a,
      pct,
      budget,
      ac,
      slip,
      ES: p.ES,
      EF: p.EF,
      LS: p.LS,
      LF: p.LF,
      totalFloat: p.TF,
      isCritical: p.isCritical,
      startDate,
      endDate,
      forecastStartDate,
      forecastEndDate,
      lsDate,
      lfDate,
      fES: f.ES,
      fEF: f.EF,
      dur: +a.dur,
      pv,
      ev,
      pp,
      cpi: ac ? ev / ac : null,
      spi: pv ? ev / pv : null,
      delayed: slip > 0 || (pct < 100 && p.EF < sd),
      impact: f.EF - p.EF
    };
  });

  const sum = (k) => rows.reduce((s, r) => s + (+r[k] || 0), 0);
  const BAC = sum('budget');
  const PV = sum('pv');
  const EV = sum('ev');
  const AC = sum('ac');
  const CPI = AC ? EV / AC : 1;
  const SPI = PV ? EV / PV : 1;
  const EAC = CPI ? BAC / CPI : BAC;

  const crCost = apprCR.reduce((s, c) => s + +c.cost, 0);
  const crDays = apprCR.reduce((s, c) => s + +c.days, 0);
  const effBudget = +C.budget + crCost;
  const deadline = contractDay + crDays;
  const planCost = BAC + C.reserve;
  const progress = BAC ? (EV / BAC) * 100 : 0;
  const delayed = rows.filter((r) => r.delayed);
  const cycle = plan.cycle || fc.cycle;

  const critOpen = (data.defects || []).filter(
    (d) => d.sev === 'Critical' && !['Resolved', 'Closed'].includes(d.status)
  ).length;

  return {
    sd,
    contractDay,
    rows,
    plan,
    fc,
    BAC,
    PV,
    EV,
    AC,
    CPI,
    SPI,
    EAC,
    VAC: BAC - EAC,
    CV: EV - AC,
    SV: EV - PV,
    crCost,
    crDays,
    effBudget,
    deadline,
    planCost,
    progress,
    delayed,
    cycle,
    critOpen,
    criticalActs: plan.criticalActs || [],
    criticalPathIds: (plan.criticalActs || []).map((a) => a.id)
  };
}

export function calculateDerived(data) {
  const approved = (data.changes || []).filter((c) => c.decision === 'Approved');
  const addCost = approved.reduce((s, c) => s + +c.cost, 0);
  const addDays_ = approved.reduce((s, c) => s + +c.days, 0);
  const effBudget = +data.charter.budget + addCost;
  const effDeadline = addDays(data.charter.deadline, addDays_);
  const daysLeft = diff(todayISO(), effDeadline);
  const achieved = (data.milestones || []).filter((m) => m.status === 'Done').length;
  const costTotal = (data.plan.costs || []).reduce((s, c) => s + +c.amount, 0);
  const pct = data.log.length ? data.log[data.log.length - 1].pct : 0;
  const rag = data.log.length ? data.log[data.log.length - 1].rag : 'G';
  const reqDone = (data.reqs || []).filter((r) => r.status === 'Approved').length;

  return {
    approved,
    addCost,
    addDays_,
    effBudget,
    effDeadline,
    daysLeft,
    achieved,
    costTotal,
    pct,
    rag,
    reqDone
  };
}

export function downstreamOf(id, rows) {
  const out = new Set();
  const frontier = [id];
  while (frontier.length) {
    const cur = frontier.pop();
    rows.forEach((r) => {
      if (r.deps && r.deps.includes(cur) && !out.has(r.id)) {
        out.add(r.id);
        frontier.push(r.id);
      }
    });
  }
  return [...out];
}

export function peakOf(list, end) {
  let m = 0;
  for (let d = 0; d <= end; d++) {
    m = Math.max(m, list.filter((r) => r.ES <= d && d < r.EF).length);
  }
  return m;
}

export function getAlerts(X, data) {
  const T = data.thresholds || { cpi: 0.95, spi: 0.95 };
  const A = [];
  if (X.cycle) A.push(['bad', 'Circular dependency detected in the schedule.']);
  if (X.fc.end > X.deadline) {
    A.push([
      'bad',
      `Forecast finish is day ${X.fc.end} (${fmt(addDays(data.charter.start, X.fc.end))}), ${
        X.fc.end - X.deadline
      } days past the effective deadline.`
    ]);
  }
  if (Math.round(X.planCost) > Math.round(X.effBudget)) {
    A.push([
      'bad',
      `Planned cost ${money(X.planCost)} exceeds the effective budget ${money(X.effBudget)}.`
    ]);
  }
  if (X.CPI < T.cpi) {
    A.push([
      'warn',
      `Cost overrun: CPI ${X.CPI.toFixed(2)} is below the ${T.cpi} threshold. Estimate at completion ${money(
        X.EAC
      )}.`
    ]);
  }
  if (X.SPI < T.spi) {
    A.push([
      'warn',
      `Schedule deviation: SPI ${X.SPI.toFixed(2)} is below the ${T.spi} threshold.`
    ]);
  }
  X.delayed.forEach((r) => {
    A.push([
      'warn',
      `${r.id} ${r.name} is delayed${r.slip ? ` by ${r.slip} day(s)` : ''}; forecast shift +${r.impact} day(s).`
    ]);
  });
  if (X.critOpen) {
    A.push(['bad', `${X.critOpen} critical defect(s) unresolved.`]);
  }
  return A;
}
