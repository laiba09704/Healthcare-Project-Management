import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      default: 'smartcare-main'
    },
    charter: {
      type: Object,
      default: {}
    },
    stakeholders: {
      type: Array,
      default: []
    },
    plan: {
      type: Object,
      default: {}
    },
    milestones: {
      type: Array,
      default: []
    },
    responsibilities: {
      type: Array,
      default: []
    },
    log: {
      type: Array,
      default: []
    },
    reqs: {
      type: Array,
      default: []
    },
    wbs: {
      type: Array,
      default: []
    },
    changes: {
      type: Array,
      default: []
    },
    closure: {
      type: Array,
      default: []
    },
    closeRec: {
      type: Object,
      default: {}
    },
    statusDate: {
      type: String,
      default: '2026-10-02'
    },
    team: {
      type: Array,
      default: []
    },
    acts: {
      type: Array,
      default: []
    },
    crProg: {
      type: Object,
      default: {}
    },
    thresholds: {
      type: Object,
      default: { cpi: 0.95, spi: 0.95 }
    },
    defects: {
      type: Array,
      default: []
    },
    checklist: {
      type: Array,
      default: []
    },
    risks: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    minimize: false
  }
);

const Project = mongoose.model('Project', ProjectSchema);
export default Project;
