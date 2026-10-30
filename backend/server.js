import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import {
  Charter,
  Stakeholder,
  Milestone,
  Requirement,
  Wbs,
  Change,
  Activity,
  Team,
  Defect,
  Checklist,
  Risk,
  ProjectMeta,
  TestCase
} from './models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'projectData.json');
const SEED_FILE = path.join(DATA_DIR, 'seedData.json');

let isMongoConnected = false;
let memoryData = null;

// Read default seed JSON
function getSeedJSON() {
  try {
    if (fs.existsSync(SEED_FILE)) {
      return JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading seed file:', err);
  }
  return {};
}

// Local file-based fallback
function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } else {
      const seed = getSeedJSON();
      fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf8');
      return seed;
    }
  } catch (err) {
    console.error('Error loading local data:', err);
    return getSeedJSON();
  }
}

function saveLocalData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving local data:', err);
    return false;
  }
}

// Seed all separate collections from seed data
async function seedAllTables() {
  const seed = getSeedJSON();

  await Promise.all([
    Charter.deleteMany({}),
    Stakeholder.deleteMany({}),
    Milestone.deleteMany({}),
    Requirement.deleteMany({}),
    Wbs.deleteMany({}),
    Change.deleteMany({}),
    Activity.deleteMany({}),
    Team.deleteMany({}),
    Defect.deleteMany({}),
    Checklist.deleteMany({}),
    Risk.deleteMany({}),
    TestCase.deleteMany({}),
    ProjectMeta.deleteMany({})
  ]);

  if (seed.charter) await Charter.create(seed.charter);
  if (seed.stakeholders?.length) await Stakeholder.insertMany(seed.stakeholders);
  if (seed.milestones?.length) await Milestone.insertMany(seed.milestones);
  if (seed.reqs?.length) await Requirement.insertMany(seed.reqs);
  if (seed.wbs?.length) await Wbs.insertMany(seed.wbs);
  if (seed.changes?.length) await Change.insertMany(seed.changes);
  if (seed.acts?.length) await Activity.insertMany(seed.acts);
  if (seed.team?.length) await Team.insertMany(seed.team);
  if (seed.defects?.length) await Defect.insertMany(seed.defects);
  if (seed.checklist?.length) await Checklist.insertMany(seed.checklist);
  if (seed.risks?.length) await Risk.insertMany(seed.risks);
  if (seed.testcases?.length) await TestCase.insertMany(seed.testcases);

  await ProjectMeta.create({
    key: 'meta',
    plan: seed.plan || {},
    responsibilities: seed.responsibilities || [],
    log: seed.log || [],
    closure: seed.closure || [],
    closeRec: seed.closeRec || {},
    statusDate: seed.statusDate || '2026-10-02',
    crProg: seed.crProg || {},
    thresholds: seed.thresholds || { cpi: 0.95, spi: 0.95 }
  });

  console.log('✅ All individual entity collections (tables) seeded successfully in MongoDB Atlas!');
}

// Fetch complete project state by querying all tables
async function getFullProjectState() {
  if (isMongoConnected) {
    try {
      const [
        charterDoc,
        stakeholders,
        milestones,
        reqs,
        wbs,
        changes,
        acts,
        team,
        defects,
        checklist,
        risks,
        testcases,
        metaDoc
      ] = await Promise.all([
        Charter.findOne({}).lean(),
        Stakeholder.find({}).lean(),
        Milestone.find({}).lean(),
        Requirement.find({}).lean(),
        Wbs.find({}).lean(),
        Change.find({}).lean(),
        Activity.find({}).lean(),
        Team.find({}).lean(),
        Defect.find({}).lean(),
        Checklist.find({}).lean(),
        Risk.find({}).lean(),
        TestCase.find({}).lean(),
        ProjectMeta.findOne({ key: 'meta' }).lean()
      ]);

      const meta = metaDoc || {};

      return {
        charter: charterDoc || {},
        stakeholders: stakeholders || [],
        plan: meta.plan || {},
        milestones: milestones || [],
        responsibilities: meta.responsibilities || [],
        log: meta.log || [],
        reqs: reqs || [],
        wbs: wbs || [],
        changes: changes || [],
        closure: meta.closure || [],
        closeRec: meta.closeRec || {},
        statusDate: meta.statusDate || '2026-10-02',
        team: team || [],
        acts: acts || [],
        crProg: meta.crProg || {},
        thresholds: meta.thresholds || { cpi: 0.95, spi: 0.95 },
        defects: defects || [],
        checklist: checklist || [],
        risks: risks || [],
        testcases: testcases || []
      };
    } catch (err) {
      console.error('Error fetching tables from MongoDB Atlas:', err.message);
    }
  }

  if (!memoryData) memoryData = loadLocalData();
  return memoryData;
}

// Connect to MongoDB Atlas
if (MONGODB_URI && MONGODB_URI.trim().startsWith('mongodb')) {
  console.log('Connecting to MongoDB Atlas...');
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .then(async () => {
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully!');

      // Check if old single 'projects' collection exists and drop it to keep Atlas clean
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasOldProject = collections.some((c) => c.name === 'projects');
        if (hasOldProject) {
          console.log('Migrating from old monolithic projects collection to entity tables...');
          await mongoose.connection.db.dropCollection('projects');
          console.log('Cleaned up old collection.');
        }
      } catch (e) {
        // ignore if not present
      }

      // Check if activities table has documents; if not, seed all tables
      const actCount = await Activity.countDocuments();
      if (actCount === 0) {
        console.log('Populating individual entity tables in MongoDB Atlas...');
        await seedAllTables();
      } else {
        // Also ensure testcases table has data if new collection
        const tcCount = await TestCase.countDocuments();
        if (tcCount === 0) {
          const seed = getSeedJSON();
          if (seed.testcases?.length) {
            console.log('Populating testcases table in MongoDB Atlas...');
            await TestCase.insertMany(seed.testcases);
          }
        }
      }
    })
    .catch((err) => {
      isMongoConnected = false;
      console.warn('⚠️ Could not connect to MongoDB Atlas:', err.message);
      console.warn('Using local JSON storage fallback.');
    });
} else {
  console.log('ℹ️ No MONGODB_URI found. Using local JSON storage.');
}

// --- REST API ENDPOINTS ---

// Health & Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SmartCare PMS Backend API',
    database: isMongoConnected ? 'MongoDB Atlas (Entity Tables)' : 'Local JSON Storage',
    mongoConnected: isMongoConnected,
    tables: [
      'charters',
      'activities',
      'requirements',
      'wbs',
      'changes',
      'risks',
      'defects',
      'checklists',
      'teams',
      'milestones',
      'stakeholders',
      'projectmetas',
      'testcases'
    ],
    port: PORT
  });
});

// Full Project State
app.get('/api/project', async (req, res) => {
  try {
    const data = await getFullProjectState();
    res.json({ success: true, data, db: isMongoConnected ? 'atlas_tables' : 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to clean document metadata before MongoDB insertion
function cleanDoc(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const clean = { ...doc };
  delete clean._id;
  delete clean.__v;
  delete clean.createdAt;
  delete clean.updatedAt;
  return clean;
}

function cleanArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(cleanDoc);
}

// Full Sync from client
app.post('/api/project/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    if (isMongoConnected) {
      // 1. Charter
      if (payload.charter) {
        await Charter.findOneAndUpdate({}, { $set: cleanDoc(payload.charter) }, { upsert: true });
      }

      // 2. Stakeholders
      if (payload.stakeholders && Array.isArray(payload.stakeholders)) {
        await Stakeholder.deleteMany({});
        if (payload.stakeholders.length) {
          await Stakeholder.insertMany(cleanArray(payload.stakeholders));
        }
      }

      // 3. Team
      if (payload.team && Array.isArray(payload.team)) {
        await Team.deleteMany({});
        if (payload.team.length) {
          await Team.insertMany(cleanArray(payload.team));
        }
      }

      // 4. Activities
      if (payload.acts && Array.isArray(payload.acts)) {
        await Activity.deleteMany({});
        if (payload.acts.length) {
          await Activity.insertMany(cleanArray(payload.acts));
        }
      }

      // 5. Requirements
      if (payload.reqs && Array.isArray(payload.reqs)) {
        await Requirement.deleteMany({});
        if (payload.reqs.length) {
          await Requirement.insertMany(cleanArray(payload.reqs));
        }
      }

      // 6. WBS
      if (payload.wbs && Array.isArray(payload.wbs)) {
        await Wbs.deleteMany({});
        if (payload.wbs.length) {
          await Wbs.insertMany(cleanArray(payload.wbs));
        }
      }

      // 7. Changes
      if (payload.changes && Array.isArray(payload.changes)) {
        await Change.deleteMany({});
        if (payload.changes.length) {
          await Change.insertMany(cleanArray(payload.changes));
        }
      }

      // 8. Risks
      if (payload.risks && Array.isArray(payload.risks)) {
        await Risk.deleteMany({});
        if (payload.risks.length) {
          await Risk.insertMany(cleanArray(payload.risks));
        }
      }

      // 9. Defects
      if (payload.defects && Array.isArray(payload.defects)) {
        await Defect.deleteMany({});
        if (payload.defects.length) {
          await Defect.insertMany(cleanArray(payload.defects));
        }
      }

      // 10. Checklist
      if (payload.checklist && Array.isArray(payload.checklist)) {
        await Checklist.deleteMany({});
        if (payload.checklist.length) {
          await Checklist.insertMany(cleanArray(payload.checklist));
        }
      }

      // 11. Milestones
      if (payload.milestones && Array.isArray(payload.milestones)) {
        await Milestone.deleteMany({});
        if (payload.milestones.length) {
          await Milestone.insertMany(cleanArray(payload.milestones));
        }
      }

      // 12. Testcases
      if (payload.testcases && Array.isArray(payload.testcases)) {
        await TestCase.deleteMany({});
        if (payload.testcases.length) {
          await TestCase.insertMany(cleanArray(payload.testcases));
        }
      }

      // 13. Project Metadata
      await ProjectMeta.findOneAndUpdate(
        { key: 'meta' },
        {
          $set: {
            plan: payload.plan || {},
            responsibilities: payload.responsibilities || [],
            log: payload.log || [],
            closure: payload.closure || [],
            closeRec: payload.closeRec || {},
            statusDate: payload.statusDate || '2026-10-02',
            crProg: payload.crProg || {},
            thresholds: payload.thresholds || {}
          }
        },
        { upsert: true }
      );
    }

    memoryData = payload;
    saveLocalData(payload);
    res.json({ success: true, message: 'All entity tables updated successfully in database' });
  } catch (err) {
    console.error('Error during /api/project/sync:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Project to Baseline Seed
app.post('/api/project/reset', async (req, res) => {
  try {
    if (isMongoConnected) {
      await seedAllTables();
    }
    const seed = getSeedJSON();
    memoryData = seed;
    saveLocalData(seed);
    res.json({ success: true, message: 'All tables reset to baseline', data: seed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 1: Charter ---
app.get('/api/charter', async (req, res) => {
  if (isMongoConnected) {
    const charter = await Charter.findOne({}).lean();
    return res.json({ success: true, charter: charter || {} });
  }
  const data = await getFullProjectState();
  res.json({ success: true, charter: data.charter || {} });
});

app.put('/api/charter', async (req, res) => {
  if (isMongoConnected) {
    const updated = await Charter.findOneAndUpdate({}, { $set: req.body }, { new: true, upsert: true });
    return res.json({ success: true, charter: updated });
  }
  const data = await getFullProjectState();
  data.charter = { ...(data.charter || {}), ...req.body };
  saveLocalData(data);
  res.json({ success: true, charter: data.charter });
});

// --- MODULE 1: Stakeholders Table CRUD ---
app.get('/api/stakeholders', async (req, res) => {
  if (isMongoConnected) {
    const stakeholders = await Stakeholder.find({}).lean();
    return res.json({ success: true, stakeholders });
  }
  const data = await getFullProjectState();
  res.json({ success: true, stakeholders: data.stakeholders || [] });
});

app.post('/api/stakeholders', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.name) {
      return res.status(400).json({ success: false, error: 'Stakeholder name is required' });
    }
    if (!candidate.id) {
      candidate.id = Date.now();
    }
    if (isMongoConnected) {
      const created = await Stakeholder.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, stakeholder: created });
    }
    const data = await getFullProjectState();
    data.stakeholders = [...(data.stakeholders || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, stakeholder: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/stakeholders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clean = cleanDoc(req.body);
    if (isMongoConnected) {
      const updated = await Stakeholder.findOneAndUpdate(
        { $or: [{ id: Number(id) || id }, { id: String(id) }] },
        { $set: clean },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, error: 'Stakeholder not found' });
      return res.json({ success: true, stakeholder: updated });
    }
    const data = await getFullProjectState();
    const list = [...(data.stakeholders || [])];
    const idx = list.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) return res.status(404).json({ success: false, error: 'Stakeholder not found' });
    list[idx] = { ...list[idx], ...clean };
    data.stakeholders = list;
    saveLocalData(data);
    res.json({ success: true, stakeholder: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/stakeholders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Stakeholder.deleteOne({ $or: [{ id: Number(id) || id }, { id: String(id) }] });
      return res.json({ success: true, message: `Stakeholder ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.stakeholders = (data.stakeholders || []).filter((s) => String(s.id) !== String(id));
    saveLocalData(data);
    res.json({ success: true, message: `Stakeholder ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 3: Activities Table CRUD ---
app.get('/api/activities', async (req, res) => {
  if (isMongoConnected) {
    const acts = await Activity.find({}).lean();
    return res.json({ success: true, acts });
  }
  const data = await getFullProjectState();
  res.json({ success: true, acts: data.acts || [] });
});

app.post('/api/activities', async (req, res) => {
  try {
    const newAct = req.body;
    if (!newAct.id) {
      const existing = isMongoConnected ? await Activity.find({}).lean() : (await getFullProjectState()).acts || [];
      const maxNum = existing.reduce((acc, a) => {
        const n = parseInt((a.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      newAct.id = `A${maxNum + 1}`;
    }

    if (isMongoConnected) {
      const created = await Activity.create(cleanDoc(newAct));
      return res.status(201).json({ success: true, act: created });
    }

    const data = await getFullProjectState();
    data.acts = [...(data.acts || []), newAct];
    saveLocalData(data);
    res.status(201).json({ success: true, act: newAct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Activity.findOneAndUpdate({ id }, { $set: cleanDoc(req.body) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Activity not found' });
      return res.json({ success: true, act: updated });
    }
    const data = await getFullProjectState();
    const acts = [...(data.acts || [])];
    const idx = acts.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Activity not found' });
    acts[idx] = { ...acts[idx], ...req.body };
    data.acts = acts;
    saveLocalData(data);
    res.json({ success: true, act: acts[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Activity.deleteOne({ id });
      return res.json({ success: true, message: `Activity ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.acts = (data.acts || []).filter((a) => a.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Activity ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 2: Requirements Table CRUD ---
app.get('/api/requirements', async (req, res) => {
  if (isMongoConnected) {
    const reqs = await Requirement.find({}).lean();
    return res.json({ success: true, reqs });
  }
  const data = await getFullProjectState();
  res.json({ success: true, reqs: data.reqs || [] });
});

app.post('/api/requirements', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.title) {
      return res.status(400).json({ success: false, error: 'Requirement title is required' });
    }
    if (!candidate.id) {
      const existing = isMongoConnected ? await Requirement.find({}).lean() : (await getFullProjectState()).reqs || [];
      const maxNum = existing.reduce((acc, r) => {
        const n = parseInt(String(r.id).replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      candidate.id = `R${maxNum + 1}`;
    }
    if (isMongoConnected) {
      const created = await Requirement.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, req: created });
    }
    const data = await getFullProjectState();
    data.reqs = [...(data.reqs || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, req: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/requirements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Requirement.findOneAndUpdate({ id }, { $set: cleanDoc(req.body) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Requirement not found' });
      return res.json({ success: true, req: updated });
    }
    const data = await getFullProjectState();
    const list = [...(data.reqs || [])];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Requirement not found' });
    list[idx] = { ...list[idx], ...req.body };
    data.reqs = list;
    saveLocalData(data);
    res.json({ success: true, req: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/requirements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Requirement.deleteOne({ id });
      return res.json({ success: true, message: `Requirement ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.reqs = (data.reqs || []).filter((r) => r.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Requirement ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 5: Defects Table CRUD ---
app.get('/api/defects', async (req, res) => {
  if (isMongoConnected) {
    const defects = await Defect.find({}).lean();
    return res.json({ success: true, defects });
  }
  const data = await getFullProjectState();
  res.json({ success: true, defects: data.defects || [] });
});

app.post('/api/defects', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.title) {
      return res.status(400).json({ success: false, error: 'Defect title is required' });
    }
    if (!candidate.id) {
      const existing = isMongoConnected ? await Defect.find({}).lean() : (await getFullProjectState()).defects || [];
      const maxNum = existing.reduce((acc, d) => {
        const n = parseInt(String(d.id).replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      candidate.id = `D${maxNum + 1}`;
    }
    if (isMongoConnected) {
      const created = await Defect.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, defect: created });
    }
    const data = await getFullProjectState();
    data.defects = [...(data.defects || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, defect: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/defects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Defect.findOneAndUpdate({ id }, { $set: cleanDoc(req.body) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Defect not found' });
      return res.json({ success: true, defect: updated });
    }
    const data = await getFullProjectState();
    const list = [...(data.defects || [])];
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Defect not found' });
    list[idx] = { ...list[idx], ...req.body };
    data.defects = list;
    saveLocalData(data);
    res.json({ success: true, defect: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/defects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Defect.deleteOne({ id });
      return res.json({ success: true, message: `Defect ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.defects = (data.defects || []).filter((d) => d.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Defect ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 5: Risks Table CRUD ---
app.get('/api/risks', async (req, res) => {
  if (isMongoConnected) {
    const risks = await Risk.find({}).lean();
    return res.json({ success: true, risks });
  }
  const data = await getFullProjectState();
  res.json({ success: true, risks: data.risks || [] });
});

app.post('/api/risks', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.title) {
      return res.status(400).json({ success: false, error: 'Risk title is required' });
    }
    if (!candidate.id) {
      const existing = isMongoConnected ? await Risk.find({}).lean() : (await getFullProjectState()).risks || [];
      const maxNum = existing.reduce((acc, k) => {
        const n = parseInt(String(k.id).replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      candidate.id = `K${maxNum + 1}`;
    }
    if (isMongoConnected) {
      const created = await Risk.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, risk: created });
    }
    const data = await getFullProjectState();
    data.risks = [...(data.risks || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, risk: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Risk.findOneAndUpdate({ id }, { $set: cleanDoc(req.body) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Risk not found' });
      return res.json({ success: true, risk: updated });
    }
    const data = await getFullProjectState();
    const list = [...(data.risks || [])];
    const idx = list.findIndex((k) => k.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Risk not found' });
    list[idx] = { ...list[idx], ...req.body };
    data.risks = list;
    saveLocalData(data);
    res.json({ success: true, risk: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/risks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Risk.deleteOne({ id });
      return res.json({ success: true, message: `Risk ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.risks = (data.risks || []).filter((k) => k.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Risk ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 5: Checklist Table CRUD ---
app.get('/api/checklist', async (req, res) => {
  if (isMongoConnected) {
    const checklist = await Checklist.find({}).lean();
    return res.json({ success: true, checklist });
  }
  const data = await getFullProjectState();
  res.json({ success: true, checklist: data.checklist || [] });
});

app.post('/api/checklist', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.item) {
      return res.status(400).json({ success: false, error: 'Checklist item is required' });
    }
    if (!candidate.id) {
      const existing = isMongoConnected ? await Checklist.find({}).lean() : (await getFullProjectState()).checklist || [];
      const maxNum = existing.reduce((acc, q) => {
        const n = parseInt(String(q.id).replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      candidate.id = `Q${maxNum + 1}`;
    }
    if (isMongoConnected) {
      const created = await Checklist.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, checklist: created });
    }
    const data = await getFullProjectState();
    data.checklist = [...(data.checklist || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, checklist: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const updated = await Checklist.findOneAndUpdate({ id }, { $set: cleanDoc(req.body) }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Checklist item not found' });
      return res.json({ success: true, checklist: updated });
    }
    const data = await getFullProjectState();
    const list = [...(data.checklist || [])];
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Checklist item not found' });
    list[idx] = { ...list[idx], ...req.body };
    data.checklist = list;
    saveLocalData(data);
    res.json({ success: true, checklist: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/checklist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Checklist.deleteOne({ id });
      return res.json({ success: true, message: `Checklist item ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.checklist = (data.checklist || []).filter((q) => q.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Checklist item ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MODULE 3: Team Table CRUD ---
app.get('/api/team', async (req, res) => {
  if (isMongoConnected) {
    const team = await Team.find({}).lean();
    return res.json({ success: true, team });
  }
  const data = await getFullProjectState();
  res.json({ success: true, team: data.team || [] });
});

app.post('/api/team', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.name) {
      return res.status(400).json({ success: false, error: 'Team member name is required' });
    }
    if (!candidate.id) {
      const existing = isMongoConnected ? await Team.find({}).lean() : (await getFullProjectState()).team || [];
      const maxNum = existing.reduce((acc, m) => {
        const n = parseInt(String(m.id).replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      candidate.id = `M${maxNum + 1}`;
    }
    if (isMongoConnected) {
      const created = await Team.create(cleanDoc(candidate));
      return res.status(201).json({ success: true, member: created });
    }
    const data = await getFullProjectState();
    data.team = [...(data.team || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, member: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await Team.deleteOne({ id });
      return res.json({ success: true, message: `Team member ${id} deleted` });
    }
    const data = await getFullProjectState();
    data.team = (data.team || []).filter((m) => m.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Team member ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper for automatic PASS / FAIL evaluation
function evalTestResult(expected, actual) {
  if (expected === undefined || expected === null || actual === undefined || actual === null) {
    return 'FAIL';
  }
  const expStr = String(expected).trim();
  const actStr = String(actual).trim();
  if (!expStr && !actStr) return 'PASS';
  if (!expStr || !actStr) return 'FAIL';
  if (expStr.toLowerCase() === actStr.toLowerCase()) return 'PASS';

  // Handle inequality operators like "≤ 100", "<= 100", "≥ 50", ">= 50", "< 10", "> 10"
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

  // Strip commas
  const cleanExp = expStr.replace(/,/g, '').toLowerCase();
  const cleanAct = actStr.replace(/,/g, '').toLowerCase();
  if (cleanExp === cleanAct) return 'PASS';

  const expN = parseFloat(cleanExp.replace(/[^\d.-]/g, ''));
  const actN = parseFloat(cleanAct.replace(/[^\d.-]/g, ''));
  if (!isNaN(expN) && !isNaN(actN) && cleanExp.replace(/[\d.-]/g, '').trim() === cleanAct.replace(/[\d.-]/g, '').trim()) {
    return Math.abs(expN - actN) < 0.001 ? 'PASS' : 'FAIL';
  }
  return 'FAIL';
}

// --- MODULE 6: Test Cases Table CRUD ---
app.get('/api/testcases', async (req, res) => {
  try {
    if (isMongoConnected) {
      let testcases = await TestCase.find({}).lean();
      if (!testcases || testcases.length === 0) {
        const seed = getSeedJSON();
        if (seed.testcases?.length) {
          await TestCase.insertMany(seed.testcases);
          testcases = await TestCase.find({}).lean();
        }
      }
      return res.json({ success: true, testcases });
    }
    const data = await getFullProjectState();
    res.json({ success: true, testcases: data.testcases || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/testcases', async (req, res) => {
  try {
    const candidate = req.body;
    if (!candidate || !candidate.title) {
      return res.status(400).json({ success: false, error: 'Test case title/use case is required' });
    }

    const existing = isMongoConnected ? await TestCase.find({}).lean() : (await getFullProjectState()).testcases || [];
    if (!candidate.id) {
      const maxNum = existing.reduce((acc, t) => {
        const n = parseInt((t.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > acc ? n : acc;
      }, 0);
      const nextNum = maxNum + 1;
      candidate.id = `TC-${nextNum < 10 ? '0' + nextNum : nextNum}`;
    }

    // Auto-evaluate status according to expected and actual
    candidate.status = evalTestResult(candidate.expected, candidate.actual);

    if (isMongoConnected) {
      const created = await TestCase.create(candidate);
      return res.status(201).json({ success: true, testcase: created });
    }

    const data = await getFullProjectState();
    data.testcases = [...(data.testcases || []), candidate];
    saveLocalData(data);
    res.status(201).json({ success: true, testcase: candidate });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/testcases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    // Auto-evaluate status if expected or actual changed
    if (update.expected !== undefined || update.actual !== undefined) {
      update.status = evalTestResult(update.expected, update.actual);
    }

    if (isMongoConnected) {
      const updated = await TestCase.findOneAndUpdate({ id }, { $set: update }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Test case not found' });
      return res.json({ success: true, testcase: updated });
    }

    const data = await getFullProjectState();
    const tcs = [...(data.testcases || [])];
    const idx = tcs.findIndex((t) => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Test case not found' });
    tcs[idx] = { ...tcs[idx], ...update };
    data.testcases = tcs;
    saveLocalData(data);
    res.json({ success: true, testcase: tcs[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/testcases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await TestCase.deleteOne({ id });
      return res.json({ success: true, message: `Test case ${id} deleted` });
    }

    const data = await getFullProjectState();
    data.testcases = (data.testcases || []).filter((t) => t.id !== id);
    saveLocalData(data);
    res.json({ success: true, message: `Test case ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/testcases/reset', async (req, res) => {
  try {
    const seed = getSeedJSON();
    const defaultTCs = seed.testcases || [];
    if (isMongoConnected) {
      await TestCase.deleteMany({});
      if (defaultTCs.length) await TestCase.insertMany(defaultTCs);
    }
    const data = await getFullProjectState();
    data.testcases = defaultTCs;
    saveLocalData(data);
    res.json({ success: true, message: 'Test cases reset to baseline defaults', testcases: defaultTCs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Summary Report
app.get('/api/reports/summary', async (req, res) => {
  const data = await getFullProjectState();
  const acts = data.acts || [];
  const totalBudget = acts.reduce((s, a) => s + (Number(a.budget) || 0), 0);
  const totalAC = acts.reduce((s, a) => s + (Number(a.ac) || 0), 0);
  const totalEV = acts.reduce((s, a) => s + ((Number(a.budget) || 0) * (Number(a.pct) || 0)) / 100, 0);

  const cpi = totalAC > 0 ? (totalEV / totalAC).toFixed(2) : '1.00';
  const risks = data.risks || [];
  const highRisks = risks.filter((r) => (Number(r.L) || 0) * (Number(r.I) || 0) >= 15).length;
  const openDefects = (data.defects || []).filter((d) => d.status !== 'Resolved').length;

  res.json({
    success: true,
    summary: {
      charterName: data.charter?.name || 'SmartCare PMS',
      database: isMongoConnected ? 'MongoDB Atlas (Entity Tables)' : 'Local JSON Storage',
      totalActivities: acts.length,
      totalBudget,
      actualCost: totalAC,
      earnedValue: totalEV,
      cpi,
      highRisksCount: highRisks,
      openDefectsCount: openDefects,
      statusDate: data.statusDate || '2026-10-02'
    }
  });
});

app.listen(PORT, () => {
  console.log(`SmartCare PMS Backend server running on http://localhost:${PORT}`);
});
