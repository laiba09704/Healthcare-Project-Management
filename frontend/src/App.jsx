import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  KEY,
  SUBS1,
  SUBS2,
  SUB3,
  SUB4,
  SUB5,
  SUB6,
  todayISO,
  loadData,
  calculateDerived,
  calculateScheduleAndEvm,
  evaluateTestCase
} from './data/initialData';

import Topbar from './components/Topbar';
import Drawer from './components/Drawer';
import ToastContainer from './components/ToastContainer';
import HomeView from './components/HomeView';
import ModulePreview from './components/ModulePreview';

// Module 01 Components
import Module1Header from './components/module1/Module1Header';
import CharterTab from './components/module1/CharterTab';
import PlanTab from './components/module1/PlanTab';
import StatusTab from './components/module1/StatusTab';
import ResponsibilitiesTab from './components/module1/ResponsibilitiesTab';
import ClosureTab from './components/module1/ClosureTab';

// Module 02 Components
import Module2Header from './components/module2/Module2Header';
import RequirementsTab from './components/module2/RequirementsTab';
import WbsTab from './components/module2/WbsTab';
import ChangeRequestsTab from './components/module2/ChangeRequestsTab';
import ApprovedScopeTab from './components/module2/ApprovedScopeTab';

// Modules 03–06 Components
import Module3View from './components/module3/Module3View';
import Module4View from './components/module4/Module4View';
import Module5View from './components/module5/Module5View';
import Module6View from './components/module6/Module6View';
import {
  fetchProjectData,
  syncProjectData,
  apiAddStakeholder,
  apiDeleteStakeholder,
  apiAddTestCase,
  apiUpdateTestCase,
  apiDeleteTestCase,
  apiAddActivity,
  apiDeleteActivity,
  apiAddRequirement,
  apiDeleteRequirement
} from './services/api';

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [view, setView] = useState('home'); // 'home' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'ph'
  const [sub, setSub] = useState('charter'); // Module 01 sub-tab
  const [sub2, setSub2] = useState('req'); // Module 02 sub-tab
  const [sub3, setSub3] = useState('sched'); // Module 03 sub-tab
  const [sub4, setSub4] = useState('est'); // Module 04 sub-tab
  const [sub5, setSub5] = useState('def'); // Module 05 sub-tab
  const [sub6, setSub6] = useState('cons'); // Module 06 sub-tab
  const [phModule, setPhModule] = useState('03');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [syncStatus, setSyncStatus] = useState('connected'); // 'connected' | 'syncing' | 'saved' | 'error'
  const isInitialMount = useRef(true);

  // Load from backend on initial mount if available
  useEffect(() => {
    let mounted = true;
    fetchProjectData()
      .then((backendData) => {
        if (!mounted) return;
        if (backendData && backendData.charter) {
          setData((prev) => ({
            ...prev,
            ...backendData,
            testcases: backendData.testcases?.length ? backendData.testcases : prev.testcases,
            stakeholders: backendData.stakeholders?.length ? backendData.stakeholders : prev.stakeholders,
            team: backendData.team?.length ? backendData.team : prev.team
          }));
        }
        setTimeout(() => {
          if (mounted) isInitialMount.current = false;
        }, 350);
      })
      .catch((err) => {
        console.warn('Backend load failed:', err);
        if (mounted) isInitialMount.current = false;
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist state to localStorage and debounced sync to MongoDB Atlas backend
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    if (isInitialMount.current) {
      return;
    }

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        const res = await syncProjectData(data);
        if (res && res.success) {
          setSyncStatus('saved');
        } else {
          setSyncStatus('connected');
        }
      } catch (e) {
        setSyncStatus('error');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [data]);


  // Derived metrics
  const derived = calculateDerived(data);
  const scheduleAndEvm = useMemo(() => calculateScheduleAndEvm(data), [data]);

  // Toast helper
  const showToast = (message, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  // Navigation handlers
  const handleGoHome = () => {
    setView('home');
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModule = (modKey) => {
    setView(modKey);
    if (modKey === 'm1' && sub === 'change') {
      setSub('charter');
    }
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviewModule = (num) => {
    setView('ph');
    setPhModule(num);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectModuleFromDrawer = (m) => {
    if (m.k) {
      handleOpenModule(m.k);
    } else {
      handlePreviewModule(m.n);
    }
  };

  const handleGoToModule2CR = () => {
    setView('m2');
    setSub2('cr');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Breadcrumb text calculation
  let crumbText = 'Dashboard';
  if (view === 'ph') {
    crumbText = `Module ${phModule}`;
  } else if (view === 'm1') {
    const subObj = SUBS1.find((s) => s[0] === sub);
    crumbText = `Module 01 · ${subObj ? subObj[1] : '1.1 Charter'}`;
  } else if (view === 'm2') {
    const subObj = SUBS2.find((s) => s[0] === sub2);
    crumbText = `Module 02 · ${subObj ? subObj[1] : '2.1 Requirements'}`;
  } else if (view === 'm3') {
    const subObj = SUB3.find((s) => s[0] === sub3);
    crumbText = `Module 03 · ${subObj ? subObj[1] : '3.1 Schedule'}`;
  } else if (view === 'm4') {
    const subObj = SUB4.find((s) => s[0] === sub4);
    crumbText = `Module 04 · ${subObj ? subObj[1] : '4.1 Cost'}`;
  } else if (view === 'm5') {
    const subObj = SUB5.find((s) => s[0] === sub5);
    crumbText = `Module 05 · ${subObj ? subObj[1] : '5.1 Defects'}`;
  } else if (view === 'm6') {
    const subObj = SUB6.find((s) => s[0] === sub6);
    crumbText = `Module 06 · ${subObj ? subObj[1] : '6.1 Integration'}`;
  }

  // --- Module 01 Mutations ---
  const updateCharter = (newCharter) => {
    setData((prev) => ({
      ...prev,
      charter: { ...prev.charter, ...newCharter }
    }));
  };

  const addStakeholder = (newStakeholder) => {
    const item = {
      ...newStakeholder,
      id: newStakeholder.id || Date.now()
    };
    setData((prev) => ({
      ...prev,
      stakeholders: [...(prev.stakeholders || []), item]
    }));
    apiAddStakeholder(item).catch((err) => console.error('Stakeholder DB insert error:', err));
  };

  const updateStakeholder = (index, field, value) => {
    setData((prev) => {
      const next = [...(prev.stakeholders || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, stakeholders: next };
    });
  };

  const deleteStakeholder = (index) => {
    const target = (data.stakeholders || [])[index];
    setData((prev) => {
      const next = [...(prev.stakeholders || [])];
      next.splice(index, 1);
      return { ...prev, stakeholders: next };
    });
    if (target && target.id) {
      apiDeleteStakeholder(target.id).catch((err) => console.error('Stakeholder DB delete error:', err));
    }
  };


  const updatePlanScope = (scope) => {
    setData((prev) => ({
      ...prev,
      plan: { ...prev.plan, scope }
    }));
  };

  const updatePhase = (index, field, value) => {
    setData((prev) => {
      const phases = [...(prev.plan.phases || [])];
      phases[index] = { ...phases[index], [field]: value };
      return {
        ...prev,
        plan: { ...prev.plan, phases }
      };
    });
  };

  const updateCost = (index, amount) => {
    setData((prev) => {
      const costs = [...(prev.plan.costs || [])];
      costs[index] = { ...costs[index], amount };
      return {
        ...prev,
        plan: { ...prev.plan, costs }
      };
    });
  };

  const addQuality = (newQuality) => {
    setData((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        quality: [...(prev.plan.quality || []), newQuality]
      }
    }));
  };

  const updateQuality = (index, field, value) => {
    setData((prev) => {
      const quality = [...(prev.plan.quality || [])];
      quality[index] = { ...quality[index], [field]: value };
      return {
        ...prev,
        plan: { ...prev.plan, quality }
      };
    });
  };

  const deleteQuality = (index) => {
    setData((prev) => {
      const quality = [...(prev.plan.quality || [])];
      quality.splice(index, 1);
      return {
        ...prev,
        plan: { ...prev.plan, quality }
      };
    });
  };

  const updateMilestone = (index, field, value) => {
    setData((prev) => {
      const milestones = [...(prev.milestones || [])];
      milestones[index] = { ...milestones[index], [field]: value };
      return { ...prev, milestones };
    });
  };

  const addStatusLog = (newLog) => {
    setData((prev) => ({
      ...prev,
      log: [...(prev.log || []), newLog]
    }));
  };

  const updateResponsibility = (index, field, value) => {
    setData((prev) => {
      const responsibilities = [...(prev.responsibilities || [])];
      responsibilities[index] = { ...responsibilities[index], [field]: value };
      return { ...prev, responsibilities };
    });
  };

  const toggleClosureItem = (index, done) => {
    setData((prev) => {
      const closure = [...(prev.closure || [])];
      closure[index] = { ...closure[index], done };
      return { ...prev, closure };
    });
  };

  const updateClosureRecord = (record) => {
    setData((prev) => ({
      ...prev,
      closeRec: { ...prev.closeRec, ...record }
    }));
  };

  const formallyCloseProject = () => {
    setData((prev) => ({
      ...prev,
      charter: {
        ...prev.charter,
        status: 'Closed'
      }
    }));
  };

  const reopenProject = () => {
    setData((prev) => ({
      ...prev,
      charter: {
        ...prev.charter,
        status: 'Executing'
      }
    }));
  };


  // --- Module 02 Mutations ---
  const updateRequirement = (id, field, value) => {
    setData((prev) => {
      const reqs = (prev.reqs || []).map((r) => (r.id === id ? { ...r, [field]: value } : r));
      return { ...prev, reqs };
    });
  };

  const approveRequirement = (id) => {
    setData((prev) => {
      const reqs = (prev.reqs || []).map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Approved',
              approvedOn: todayISO(),
              approvedBy: 'Sponsor'
            }
          : r
      );
      return { ...prev, reqs };
    });
  };

  const setRequirementStatus = (id, status) => {
    setData((prev) => {
      const reqs = (prev.reqs || []).map((r) => (r.id === id ? { ...r, status } : r));
      return { ...prev, reqs };
    });
  };

  const reorderRequirement = (id, dir) => {
    setData((prev) => {
      const list = [...(prev.reqs || [])].sort((a, b) => a.rank - b.rank);
      const i = list.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return prev;
      const rankA = list[i].rank;
      list[i].rank = list[j].rank;
      list[j].rank = rankA;
      return { ...prev, reqs: [...list] };
    });
  };

  const addRequirement = (newReq) => {
    setData((prev) => ({
      ...prev,
      reqs: [...(prev.reqs || []), newReq]
    }));
    apiAddRequirement(newReq).catch((err) => console.error('Requirement DB insert error:', err));
  };

  const deleteRequirement = (id) => {
    setData((prev) => ({
      ...prev,
      reqs: (prev.reqs || []).filter((r) => r.id !== id)
    }));
    apiDeleteRequirement(id).catch((err) => console.error('Requirement DB delete error:', err));
  };


  const updateWbs = (id, field, value) => {
    setData((prev) => {
      const wbs = (prev.wbs || []).map((w) => (w.id === id ? { ...w, [field]: value } : w));
      return { ...prev, wbs };
    });
  };

  const addWbs = (newWp) => {
    setData((prev) => ({
      ...prev,
      wbs: [...(prev.wbs || []), newWp]
    }));
  };

  const deleteWbs = (id) => {
    setData((prev) => {
      const target = (prev.wbs || []).find((x) => x.id === id);
      if (!target) return prev;
      const wbs = (prev.wbs || [])
        .filter((x) => x.id !== id)
        .map((x) => (x.parent === id ? { ...x, parent: target.parent } : x));
      return { ...prev, wbs };
    });
  };

  // Change request actions & sync with requirements
  const decideChange = (id, decision) => {
    setData((prev) => {
      const target = (prev.changes || []).find((x) => x.id === id);
      if (!target) return prev;

      const changes = (prev.changes || []).map((c) =>
        c.id === id ? { ...c, decision } : c
      );

      let reqs = [...(prev.reqs || [])];
      if (target.req) {
        reqs = reqs.map((r) => {
          if (r.id !== target.req) return r;
          if (decision === 'Approved') {
            return {
              ...r,
              status: 'Approved',
              approvedOn: todayISO(),
              approvedBy: `Change ${target.id}`
            };
          } else if (decision === 'Rejected') {
            return r.status !== 'Approved' ? { ...r, status: 'Rejected' } : r;
          } else if (r.approvedBy === `Change ${target.id}`) {
            return {
              ...r,
              status: 'Proposed',
              approvedOn: '',
              approvedBy: ''
            };
          }
          return r;
        });
      }

      return { ...prev, changes, reqs };
    });
  };

  const addChange = (newChange) => {
    setData((prev) => ({
      ...prev,
      changes: [...(prev.changes || []), newChange]
    }));
  };

  const deleteChange = (idOrIndex) => {
    setData((prev) => {
      let changes = [...(prev.changes || [])];
      if (typeof idOrIndex === 'number') {
        changes.splice(idOrIndex, 1);
      } else {
        changes = changes.filter((c) => c.id !== idOrIndex);
      }
      return { ...prev, changes };
    });
  };

  // --- Modules 03–06 Mutations ---
  const updateStatusDate = (statusDate) => {
    setData((prev) => ({ ...prev, statusDate }));
  };

  const updateActivity = (id, field, value) => {
    setData((prev) => {
      const acts = (prev.acts || []).map((a) => (a.id === id ? { ...a, [field]: value } : a));
      return { ...prev, acts };
    });
  };

  const addActivity = (candidate) => {
    setData((prev) => ({
      ...prev,
      acts: [...(prev.acts || []), candidate]
    }));
    apiAddActivity(candidate).catch((err) => console.error('Activity DB insert error:', err));
  };

  const deleteActivity = (id) => {
    setData((prev) => {
      const acts = (prev.acts || [])
        .filter((a) => a.id !== id)
        .map((a) => ({
          ...a,
          deps: (a.deps || []).filter((d) => d !== id)
        }));
      return { ...prev, acts };
    });
    apiDeleteActivity(id).catch((err) => console.error('Activity DB delete error:', err));
  };


  const updateCrProg = (crId, field, value) => {
    setData((prev) => {
      const crProg = { ...(prev.crProg || {}) };
      crProg[crId] = { ...(crProg[crId] || { pct: 0, ac: 0, slip: 0, owner: 'M1' }), [field]: value };
      return { ...prev, crProg };
    });
  };

  const updateThreshold = (field, value) => {
    setData((prev) => ({
      ...prev,
      thresholds: { ...(prev.thresholds || { cpi: 0.95, spi: 0.95 }), [field]: value }
    }));
  };

  const updateDefect = (id, field, value) => {
    setData((prev) => {
      const defects = (prev.defects || []).map((d) => (d.id === id ? { ...d, [field]: value } : d));
      return { ...prev, defects };
    });
  };

  const addDefect = (candidate) => {
    setData((prev) => ({
      ...prev,
      defects: [...(prev.defects || []), candidate]
    }));
  };

  const deleteDefect = (id) => {
    setData((prev) => ({
      ...prev,
      defects: (prev.defects || []).filter((d) => d.id !== id)
    }));
  };

  const updateChecklist = (id, field, value) => {
    setData((prev) => {
      const checklist = (prev.checklist || []).map((q) =>
        q.id === id ? { ...q, [field]: value } : q
      );
      return { ...prev, checklist };
    });
  };

  const addChecklist = (candidate) => {
    setData((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), candidate]
    }));
  };

  const deleteChecklist = (id) => {
    setData((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((q) => q.id !== id)
    }));
  };

  const updateRisk = (id, field, value) => {
    setData((prev) => {
      const risks = (prev.risks || []).map((k) => (k.id === id ? { ...k, [field]: value } : k));
      return { ...prev, risks };
    });
  };

  const addRisk = (candidate) => {
    setData((prev) => ({
      ...prev,
      risks: [...(prev.risks || []), candidate]
    }));
  };

  const deleteRisk = (id) => {
    setData((prev) => ({
      ...prev,
      risks: (prev.risks || []).filter((k) => k.id !== id)
    }));
  };

  // --- Module 06 Test Cases Mutations ---
  const updateTestCase = (id, updatedFields) => {
    let evaluatedStatus = null;
    setData((prev) => {
      const testcases = (prev.testcases || []).map((t) => {
        if (t.id === id) {
          const next = { ...t, ...updatedFields };
          if (updatedFields.expected !== undefined || updatedFields.actual !== undefined) {
            next.status = evaluateTestCase(next.expected, next.actual);
          }
          evaluatedStatus = next.status;
          return next;
        }
        return t;
      });
      return { ...prev, testcases };
    });
    apiUpdateTestCase(id, { ...updatedFields, ...(evaluatedStatus ? { status: evaluatedStatus } : {}) })
      .catch((err) => console.error('TestCase update error:', err));
  };

  const addTestCase = (candidate) => {
    const status = evaluateTestCase(candidate.expected, candidate.actual);
    const newTc = { ...candidate, status };
    setData((prev) => ({
      ...prev,
      testcases: [...(prev.testcases || []), newTc]
    }));
    apiAddTestCase(newTc).catch((err) => console.error('TestCase DB insert error:', err));
  };

  const deleteTestCase = (id) => {
    setData((prev) => ({
      ...prev,
      testcases: (prev.testcases || []).filter((t) => t.id !== id)
    }));
    apiDeleteTestCase(id).catch((err) => console.error('TestCase DB delete error:', err));
  };

  const resetTestCases = (defaultTCs) => {
    setData((prev) => ({
      ...prev,
      testcases: defaultTCs
    }));
  };

  return (
    <>
      <Topbar
        onToggleDrawer={() => setDrawerOpen((prev) => !prev)}
        crumbText={crumbText}
        onGoHome={handleGoHome}
      />



      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentView={view}
        onSelectModule={handleSelectModuleFromDrawer}
      />

      <main id="app">
        {view === 'home' && (
          <HomeView
            data={data}
            derived={derived}
            onOpenModule={handleOpenModule}
            onPreviewModule={handlePreviewModule}
          />
        )}

        {view === 'ph' && (
          <ModulePreview
            moduleNum={phModule}
            onGoHome={handleGoHome}
          />
        )}

        {view === 'm1' && (
          <>
            <Module1Header
              currentSub={sub}
              onSelectSub={setSub}
              onGoHome={handleGoHome}
            />

            {sub === 'charter' && (
              <CharterTab
                data={data}
                derived={derived}
                onUpdateCharter={updateCharter}
                onAddStakeholder={addStakeholder}
                onUpdateStakeholder={updateStakeholder}
                onDeleteStakeholder={deleteStakeholder}
                showToast={showToast}
              />
            )}

            {sub === 'plan' && (
              <PlanTab
                data={data}
                onUpdatePlanScope={updatePlanScope}
                onUpdatePhase={updatePhase}
                onUpdateCost={updateCost}
                onAddQuality={addQuality}
                onUpdateQuality={updateQuality}
                onDeleteQuality={deleteQuality}
                showToast={showToast}
              />
            )}

            {sub === 'status' && (
              <StatusTab
                data={data}
                derived={derived}
                onUpdateMilestone={updateMilestone}
                onAddStatusLog={addStatusLog}
                showToast={showToast}
              />
            )}

            {sub === 'resp' && (
              <ResponsibilitiesTab
                data={data}
                onUpdateResponsibility={updateResponsibility}
              />
            )}

            {sub === 'close' && (
              <ClosureTab
                data={data}
                onToggleClosureItem={toggleClosureItem}
                onUpdateClosureRecord={updateClosureRecord}
                onFormallyCloseProject={formallyCloseProject}
                onReopenProject={reopenProject}
                showToast={showToast}
              />
            )}
          </>
        )}

        {view === 'm2' && (
          <>
            <Module2Header
              currentSub2={sub2}
              onSelectSub2={setSub2}
              onGoHome={handleGoHome}
            />

            {sub2 === 'req' && (
              <RequirementsTab
                data={data}
                derived={derived}
                onUpdateRequirement={updateRequirement}
                onApproveRequirement={approveRequirement}
                onSetRequirementStatus={setRequirementStatus}
                onReorderRequirement={reorderRequirement}
                onAddRequirement={addRequirement}
                onDeleteRequirement={deleteRequirement}
                showToast={showToast}
              />
            )}

            {sub2 === 'wbs' && (
              <WbsTab
                data={data}
                derived={derived}
                onUpdateWbs={updateWbs}
                onAddWbs={addWbs}
                onDeleteWbs={deleteWbs}
                showToast={showToast}
              />
            )}

            {sub2 === 'cr' && (
              <ChangeRequestsTab
                data={data}
                derived={derived}
                onDecideChange={decideChange}
                onAddChange={addChange}
                onDeleteChange={deleteChange}
                showToast={showToast}
              />
            )}

            {sub2 === 'base' && (
              <ApprovedScopeTab
                data={data}
                derived={derived}
              />
            )}
          </>
        )}

        {view === 'm3' && (
          <Module3View
            data={data}
            calc={scheduleAndEvm}
            sub={sub3}
            onSelectSub={setSub3}
            onGoHome={handleGoHome}
            onUpdateStatusDate={updateStatusDate}
            onUpdateActivity={updateActivity}
            onAddActivity={addActivity}
            onDeleteActivity={deleteActivity}
            onUpdateCrProg={updateCrProg}
            showToast={showToast}
          />
        )}

        {view === 'm4' && (
          <Module4View
            data={data}
            calc={scheduleAndEvm}
            sub={sub4}
            onSelectSub={setSub4}
            onGoHome={handleGoHome}
            onUpdateStatusDate={updateStatusDate}
            onUpdateActivity={updateActivity}
            onUpdateCrProg={updateCrProg}
            onUpdateThreshold={updateThreshold}
          />
        )}

        {view === 'm5' && (
          <Module5View
            data={data}
            sub={sub5}
            onSelectSub={setSub5}
            onGoHome={handleGoHome}
            onUpdateDefect={updateDefect}
            onAddDefect={addDefect}
            onDeleteDefect={deleteDefect}
            onUpdateChecklist={updateChecklist}
            onAddChecklist={addChecklist}
            onDeleteChecklist={deleteChecklist}
            onUpdateRisk={updateRisk}
            onAddRisk={addRisk}
            onDeleteRisk={deleteRisk}
            showToast={showToast}
          />
        )}

        {view === 'm6' && (
          <Module6View
            data={data}
            calc={scheduleAndEvm}
            sub={sub6}
            onSelectSub={setSub6}
            onGoHome={handleGoHome}
            onUpdateStatusDate={updateStatusDate}
            onAddTestCase={addTestCase}
            onUpdateTestCase={updateTestCase}
            onDeleteTestCase={deleteTestCase}
            onResetTestCases={resetTestCases}
            showToast={showToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </>
  );
}
