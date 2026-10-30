import mongoose from 'mongoose';

// 1. Charter Model (Module 01)
const CharterSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Smart Healthcare Project Management System' },
    client: { type: String, default: 'Five-hospital network' },
    sponsor: { type: String, default: 'Hospital Management Board' },
    manager: { type: String, default: 'Project Manager' },
    start: { type: String, default: '2026-08-03' },
    deadline: { type: String, default: '2026-11-23' },
    budget: { type: Number, default: 5000000 },
    reserve: { type: Number, default: 400000 },
    status: { type: String, default: 'Executing' },
    objectives: { type: String, default: '' },
    inScope: { type: String, default: '' },
    outScope: { type: String, default: '' }
  },
  { timestamps: true }
);

// 2. Stakeholders Model (Module 01)
const StakeholderSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    role: { type: String, default: '' },
    interest: { type: String, default: 'High' }
  },
  { timestamps: true }
);

// 3. Milestones Model (Module 01 / 03)
const MilestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'Not started' }
  },
  { timestamps: true }
);

// 4. Requirements Model (Module 02)
const RequirementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    prio: { type: String, default: 'Must' },
    rank: { type: Number, default: 1 },
    status: { type: String, default: 'Approved' },
    source: { type: String, default: '' },
    ac: { type: String, default: '' },
    approvedOn: { type: String, default: '' },
    approvedBy: { type: String, default: '' }
  },
  { timestamps: true }
);

// 5. Work Breakdown Structure (WBS) Model (Module 02)
const WbsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    parent: { type: String, default: null },
    req: { type: String, default: '' }
  },
  { timestamps: true }
);

// 6. Change Requests Model (Module 02)
const ChangeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    just: { type: String, default: '' },
    requestedBy: { type: String, default: '' },
    submitted: { type: String, default: '' },
    cost: { type: Number, default: 0 },
    days: { type: Number, default: 0 },
    decision: { type: String, default: 'Pending' },
    req: { type: String, default: '' }
  },
  { timestamps: true }
);

// 7. Activities & Schedule Model (Module 03)
const ActivitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    owner: { type: String, default: '' },
    dur: { type: Number, default: 14 },
    deps: { type: [String], default: [] },
    budget: { type: Number, default: 0 },
    pct: { type: Number, default: 0 },
    ac: { type: Number, default: 0 },
    slip: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// 8. Team Resources Model (Module 03)
const TeamSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: '' }
  },
  { timestamps: true }
);

// 9. Quality Defects Model (Module 05)
const DefectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    sev: { type: String, default: 'Major' },
    act: { type: String, default: '' },
    owner: { type: String, default: '' },
    status: { type: String, default: 'Open' }
  },
  { timestamps: true }
);

// 10. Quality Checklist Model (Module 05)
const ChecklistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    item: { type: String, required: true },
    deliv: { type: String, default: '' },
    result: { type: String, default: 'Pending' },
    by: { type: String, default: '' }
  },
  { timestamps: true }
);

// 11. Risks Model (Module 05)
const RiskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    pp: { type: String, default: '' },
    L: { type: Number, default: 3 },
    I: { type: Number, default: 3 },
    prev: { type: String, default: '' },
    corr: { type: String, default: '' }
  },
  { timestamps: true }
);

// 12. Project Metadata Model (Plans, Log, Closure, Thresholds)
const ProjectMetaSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'meta', unique: true },
    plan: { type: Object, default: {} },
    responsibilities: { type: Array, default: [] },
    log: { type: Array, default: [] },
    closure: { type: Array, default: [] },
    closeRec: { type: Object, default: {} },
    statusDate: { type: String, default: '2026-10-02' },
    crProg: { type: Object, default: {} },
    thresholds: { type: Object, default: { cpi: 0.95, spi: 0.95 } }
  },
  { timestamps: true, minimize: false }
);

// 13. Test Cases Model (Module 06)
const TestCaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    expected: { type: String, default: '' },
    actual: { type: String, default: '' },
    status: { type: String, default: 'PASS' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Charter = mongoose.model('Charter', CharterSchema);
export const Stakeholder = mongoose.model('Stakeholder', StakeholderSchema);
export const Milestone = mongoose.model('Milestone', MilestoneSchema);
export const Requirement = mongoose.model('Requirement', RequirementSchema);
export const Wbs = mongoose.model('Wbs', WbsSchema);
export const Change = mongoose.model('Change', ChangeSchema);
export const Activity = mongoose.model('Activity', ActivitySchema);
export const Team = mongoose.model('Team', TeamSchema);
export const Defect = mongoose.model('Defect', DefectSchema);
export const Checklist = mongoose.model('Checklist', ChecklistSchema);
export const Risk = mongoose.model('Risk', RiskSchema);
export const ProjectMeta = mongoose.model('ProjectMeta', ProjectMetaSchema);
export const TestCase = mongoose.model('TestCase', TestCaseSchema);

