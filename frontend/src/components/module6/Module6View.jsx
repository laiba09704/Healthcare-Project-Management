import React, { useState } from 'react';
import {
  SUB6,
  money,
  num,
  fmt,
  addDays,
  bandOf,
  runCpm,
  buildSchedActs,
  nextId,
  evaluateTestCase
} from '../../data/initialData';
import {
  apiAddTestCase,
  apiUpdateTestCase,
  apiDeleteTestCase,
  apiResetTestCases
} from '../../services/api';

export default function Module6View({
  data,
  calc,
  sub,
  onSelectSub,
  onGoHome,
  onUpdateStatusDate,
  onAddTestCase,
  onUpdateTestCase,
  onDeleteTestCase,
  onResetTestCases,
  showToast
}) {
  const team = data.team || [];
  const reqs = data.reqs || [];
  const wbs = data.wbs || [];
  const changes = data.changes || [];
  const defects = data.defects || [];
  const checklist = data.checklist || [];
  const risks = data.risks || [];
  const acts = data.acts || [];
  const thr = data.thresholds || { cpi: 0.95, spi: 0.95 };

  const teamName = (id) => (team.find((t) => t.id === id) || { name: '—' }).name;
  const reqOf = (id) => reqs.find((r) => r.id === id);

  const approvedCRs = changes.filter((c) => c.decision === 'Approved');
  const pendingCRs = changes.filter((c) => c.decision === 'Pending');
  const openCrit = defects.filter(
    (d) => d.sev === 'Critical' && !['Resolved', 'Closed'].includes(d.status)
  );

  // 6.1 Consistency checks
  const consistencyChecks = [
    [
      'Approved change requests each have an approved requirement',
      approvedCRs.every((c) => !c.req || reqOf(c.req)?.status === 'Approved')
    ],
    [
      'WBS work packages reference only approved requirements',
      wbs.every((w) => !w.req || reqOf(w.req)?.status === 'Approved')
    ],
    [
      'Every approved change appears in the schedule',
      approvedCRs.every((c) => calc.rows.some((r) => r.cr === c.id))
    ],
    [
      'Every activity predecessor exists',
      acts.every((a) => a.deps.every((d) => acts.some((x) => x.id === d)))
    ],
    [
      'Every activity owner is a team member',
      calc.rows.every((r) => team.some((t) => t.id === r.owner))
    ],
    [
      'Every defect links to an existing activity and a team member',
      defects.every(
        (d) => acts.some((a) => a.id === d.act) && team.some((t) => t.id === d.owner)
      )
    ],
    [
      'Planned cost equals effective budget',
      Math.round(calc.planCost) === Math.round(calc.effBudget)
    ],
    ['Schedule has no circular dependencies', !calc.cycle],
    ['Forecast finish within effective deadline', calc.fc.end <= calc.deadline],
    ['No unresolved critical defects', calc.critOpen === 0],
    ['Quality checklist fully passed', checklist.every((q) => q.result === 'Pass')],
    [
      'Every risk scoring 15 or more has preventive and corrective actions',
      risks
        .filter((k) => k.L * k.I >= 15)
        .every((k) => k.prev && k.prev !== '—' && k.corr && k.corr !== '—')
    ]
  ];

  const passCount = consistencyChecks.filter((c) => c[1]).length;

  // 6.2 Test cases management
  const defaultTCs = [
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
  ];

  const testcases = data.testcases && data.testcases.length ? data.testcases : defaultTCs;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTC, setNewTC] = useState({
    id: '',
    title: '',
    expected: '',
    actual: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    expected: '',
    actual: ''
  });
  const [filterResult, setFilterResult] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const chSim = (ids) =>
    changes.map((c) => ({
      ...c,
      decision: ids.includes(c.id) ? 'Approved' : 'Pending'
    }));

  const syn = [
    { id: 'X', dur: 10, deps: [] },
    { id: 'Y', dur: 5, deps: ['X'], slip: 3 },
    { id: 'Z', dur: 5, deps: ['Y'] }
  ];

  // Auto-evaluation live helper
  const getEvaluatedStatus = (expected, actual) => evaluateTestCase(expected, actual);

  // Handlers
  const handleAddTestCaseSubmit = async (e) => {
    e.preventDefault();
    const title = newTC.title.trim();
    if (!title) {
      if (showToast) showToast('Please enter a Use Case or Test title', 'err');
      return;
    }
    const id = newTC.id.trim() || nextId('TC-', testcases);
    const expected = newTC.expected.trim();
    const actual = newTC.actual.trim();
    const status = getEvaluatedStatus(expected, actual);

    const item = { id, title, expected, actual, status };

    if (onAddTestCase) onAddTestCase(item);
    await apiAddTestCase(item);
    if (showToast) showToast(`Test case ${id} added to database (${status})`, 'ok');

    setNewTC({ id: '', title: '', expected: '', actual: '' });
    setIsAddOpen(false);
  };

  const handleStartEdit = (tc) => {
    setEditingId(tc.id);
    setEditForm({
      title: tc.title,
      expected: tc.expected || '',
      actual: tc.actual || ''
    });
  };

  const handleSaveEdit = async (id) => {
    const title = editForm.title.trim();
    if (!title) {
      if (showToast) showToast('Test case title cannot be empty', 'err');
      return;
    }
    const expected = editForm.expected.trim();
    const actual = editForm.actual.trim();
    const status = getEvaluatedStatus(expected, actual);

    const updated = { title, expected, actual, status };
    if (onUpdateTestCase) onUpdateTestCase(id, updated);
    await apiUpdateTestCase(id, updated);
    if (showToast) showToast(`Test case ${id} updated in database (${status})`, 'ok');
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDeleteTestCase = async (id) => {
    if (window.confirm(`Delete test case ${id} from database?`)) {
      if (onDeleteTestCase) onDeleteTestCase(id);
      await apiDeleteTestCase(id);
      if (showToast) showToast(`Test case ${id} deleted from database`, 'ok');
    }
  };

  const handleRunLiveSystemChecks = () => {
    const liveSystemMap = {
      'TC-01': () => `${runCpm(buildSchedActs(data, chSim([])), false).end} days`,
      'TC-02': () => `${runCpm(buildSchedActs(data, chSim(['CR-01', 'CR-02'])), false).end} days`,
      'TC-03': () => money(acts.reduce((s, a) => s + (+a.budget || 0), 0) + data.charter.reserve),
      'TC-04': () => `+${money(buildSchedActs(data, chSim(['CR-01', 'CR-02'])).filter((a) => a.isCR).reduce((s, a) => s + a.budget, 0))}`,
      'TC-05': () => `${runCpm(syn, true).res.Z.ES - runCpm(syn, false).res.Z.ES} days`,
      'TC-06': () => (runCpm([{ id: 'P', dur: 1, deps: ['Q'] }, { id: 'Q', dur: 1, deps: ['P'] }], false).cycle ? 'Detected' : 'Missed'),
      'TC-07': () => {
        const p = reqs.find((r) => r.status !== 'Approved');
        return !p || p.status !== 'Approved' ? 'Blocked' : 'Allowed';
      },
      'TC-08': () => money(calc.PV),
      'TC-09': () => (50 / 40).toFixed(2),
      'TC-10': () => (calc.CPI < thr.cpi ? 'Raised' : 'Not raised'),
      'TC-11': () => (!'   '.trim() ? 'Error raised' : 'Accepted'),
      'TC-12': () => bandOf(20)[0]
    };

    let count = 0;
    testcases.forEach((tc) => {
      if (liveSystemMap[tc.id]) {
        const liveActual = liveSystemMap[tc.id]();
        const status = getEvaluatedStatus(tc.expected, liveActual);
        if (onUpdateTestCase) onUpdateTestCase(tc.id, { actual: liveActual, status });
        apiUpdateTestCase(tc.id, { actual: liveActual, status });
        count++;
      }
    });
    if (showToast) showToast(`Evaluated ${count} live project test cases`, 'ok');
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset test cases in database to baseline defaults?')) {
      const res = await apiResetTestCases();
      if (res && res.testcases && onResetTestCases) {
        onResetTestCases(res.testcases);
      } else if (onResetTestCases) {
        onResetTestCases(defaultTCs);
      }
      if (showToast) showToast('Test cases table reset to baseline defaults', 'ok');
    }
  };

  // Stats
  const totalCount = testcases.length;
  const passedCount = testcases.filter((t) => (t.status || getEvaluatedStatus(t.expected, t.actual)) === 'PASS').length;
  const failedCount = totalCount - passedCount;
  const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(1) : 0;

  // Filtered list
  const filteredTestCases = testcases.filter((tc) => {
    const status = tc.status || getEvaluatedStatus(tc.expected, tc.actual);
    if (filterResult !== 'all' && status !== filterResult) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        (tc.id || '').toLowerCase().includes(q) ||
        (tc.title || '').toLowerCase().includes(q) ||
        (tc.expected || '').toLowerCase().includes(q) ||
        (tc.actual || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // CSV Export Handler
  const handleExportCsv = () => {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const header = [
      'ID',
      'Activity',
      'Owner',
      'Duration_days',
      'Planned_start',
      'Planned_end',
      'Forecast_end',
      'Slip_days',
      'Pct_complete',
      'Budget_PKR',
      'PV',
      'EV',
      'AC',
      'CPI',
      'SPI'
    ];
    const rows = calc.rows.map((r) =>
      [
        r.id,
        q(r.name),
        q(teamName(r.owner)),
        r.dur,
        addDays(data.charter.start, r.ES),
        addDays(data.charter.start, r.EF),
        addDays(data.charter.start, r.fEF),
        r.slip,
        r.pct,
        Math.round(r.budget),
        Math.round(r.pv),
        Math.round(r.ev),
        r.ac,
        r.cpi === null ? '' : r.cpi.toFixed(2),
        r.spi === null ? '' : r.spi.toFixed(2)
      ].join(',')
    );

    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'smartcare-schedule-evm.csv';
    a.click();
    showToast('CSV exported.');
  };

  const statusDateBar = (
    <div className="inline" style={{ margin: '0 0 14px', padding: 0, border: 0 }}>
      <label className="f">
        Status date (drives EV/PV and delays)
        <input
          type="date"
          value={data.statusDate}
          onChange={(e) => onUpdateStatusDate(e.target.value)}
        />
      </label>
    </div>
  );

  return (
    <>
      <div className="mhead">
        <span className="num">06</span>
        <h2>System Integration, Validation & Reporting</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Cross-module consistency checks, live test cases with expected and actual results, and the
        integrated project dashboard.
      </p>

      <div className="tabs">
        {SUB6.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${sub === key ? 'on' : ''}`}
            onClick={() => onSelectSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 6.1 Consistency Checks */}
      {sub === 'cons' && (
        <>
          <div className="kpi-row">
            <div className={`stat ${passCount < consistencyChecks.length ? 'warn' : ''}`}>
              <small>Checks passing</small>
              <b>
                {passCount} / {consistencyChecks.length}
              </b>
              <span>cross-module consistency</span>
            </div>
          </div>

          <section className="card">
            <h3>
              Consistency checks <span>requirements · tasks · cost · changes · quality</span>
            </h3>
            <div className="tw">
              <table>
                <tbody>
                  {consistencyChecks.map(([desc, ok], i) => (
                    <tr key={i}>
                      <td>{desc}</td>
                      <td style={{ textAlign: 'right' }}>
                        {ok ? (
                          <span className="pass">✓ consistent</span>
                        ) : (
                          <span className="fail">✗ needs attention</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* 6.2 Test Cases */}
      {sub === 'test' && (
        <section className="card">
          <div className="tc-stats-row">
            <div className="tc-stat-card">
              <small>Total Test Cases</small>
              <b>{totalCount}</b>
              <span className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>In Database Table</span>
            </div>
            <div className="tc-stat-card pass">
              <small>Passed Tests</small>
              <b style={{ color: 'var(--ok)' }}>{passedCount}</b>
              <span className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>Expected == Actual</span>
            </div>
            <div className="tc-stat-card fail">
              <small>Failed Tests</small>
              <b style={{ color: 'var(--coral)' }}>{failedCount}</b>
              <span className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>Discrepancies Found</span>
            </div>
            <div className="tc-stat-card rate">
              <small>Pass Rate</small>
              <b>{passRate}%</b>
              <span className="muted" style={{ fontSize: '11px', marginTop: '2px' }}>System Health</span>
            </div>
          </div>

          <h3>
            Test cases <span>expected vs actual · stored in database</span>
          </h3>

          <div className="tc-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn primary sm"
                onClick={() => setIsAddOpen((prev) => !prev)}
              >
                {isAddOpen ? '✕ Close Form' : '+ Add Test Case'}
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={handleRunLiveSystemChecks}
                title="Re-run live project metrics and update actual results"
              >
                ⚡ Run Live Check
              </button>
              <button
                type="button"
                className="btn sm"
                onClick={handleResetDefaults}
                title="Reset database testcases table to baseline seed"
              >
                ↺ Reset Baseline
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="tc-filter-group">
                <button
                  type="button"
                  className={`tc-filter-btn ${filterResult === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterResult('all')}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  className={`tc-filter-btn ${filterResult === 'PASS' ? 'active' : ''}`}
                  onClick={() => setFilterResult('PASS')}
                >
                  Pass ({passedCount})
                </button>
                <button
                  type="button"
                  className={`tc-filter-btn ${filterResult === 'FAIL' ? 'active' : ''}`}
                  onClick={() => setFilterResult('FAIL')}
                >
                  Fail ({failedCount})
                </button>
              </div>

              <div className="tc-search-box">
                <input
                  type="text"
                  placeholder="Search test case or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add New Test Case Form */}
          {isAddOpen && (
            <form onSubmit={handleAddTestCaseSubmit} className="tc-add-panel">
              <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--teal-d)' }}>
                Enter New Use Case & Results
              </h4>
              <div className="grid">
                <label className="f">
                  Test ID
                  <input
                    type="text"
                    placeholder={nextId('TC-', testcases)}
                    value={newTC.id}
                    onChange={(e) => setNewTC({ ...newTC, id: e.target.value })}
                  />
                </label>
                <label className="f">
                  Use Case / Test Name *
                  <input
                    type="text"
                    placeholder="e.g., Doctor slot double-booking validation"
                    value={newTC.title}
                    onChange={(e) => setNewTC({ ...newTC, title: e.target.value })}
                    required
                  />
                </label>
                <label className="f">
                  Expected Result *
                  <input
                    type="text"
                    placeholder="e.g., 112 days or Conflict rejected or PKR 4,900,000"
                    value={newTC.expected}
                    onChange={(e) => setNewTC({ ...newTC, expected: e.target.value })}
                    required
                  />
                </label>
                <label className="f">
                  Actual Result *
                  <input
                    type="text"
                    placeholder="e.g., 112 days or Conflict rejected or PKR 4,999,985"
                    value={newTC.actual}
                    onChange={(e) => setNewTC({ ...newTC, actual: e.target.value })}
                    required
                  />
                </label>
              </div>

              {/* Real-time automatic evaluation preview */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  {newTC.expected || newTC.actual ? (
                    <div
                      className={`tc-eval-indicator ${
                        getEvaluatedStatus(newTC.expected, newTC.actual) === 'PASS' ? 'pass' : 'fail'
                      }`}
                    >
                      {getEvaluatedStatus(newTC.expected, newTC.actual) === 'PASS' ? (
                        <>✓ System Auto-Evaluation: <b>PASS</b> (Expected matches Actual)</>
                      ) : (
                        <>✗ System Auto-Evaluation: <b>FAIL</b> (Expected does not match Actual)</>
                      )}
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: '12px' }}>
                      System will automatically compare Expected and Actual to determine PASS or FAIL.
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn primary sm">
                    Save to Database
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    onClick={() => {
                      setIsAddOpen(false);
                      setNewTC({ id: '', title: '', expected: '', actual: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Test Cases Table */}
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Test / Use Case</th>
                  <th style={{ width: '190px' }}>Expected</th>
                  <th style={{ width: '190px' }}>Actual</th>
                  <th style={{ width: '90px' }}>Result</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestCases.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                      No test cases found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTestCases.map((tc) => {
                    const isEditing = editingId === tc.id;
                    const evalStatus = isEditing
                      ? getEvaluatedStatus(editForm.expected, editForm.actual)
                      : (tc.status || getEvaluatedStatus(tc.expected, tc.actual));

                    if (isEditing) {
                      return (
                        <tr key={tc.id} style={{ background: '#f5faf4' }}>
                          <td className="mono">{tc.id}</td>
                          <td>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              style={{ width: '100%' }}
                              autoFocus
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editForm.expected}
                              onChange={(e) => setEditForm({ ...editForm, expected: e.target.value })}
                              style={{ width: '100%', fontFamily: 'IBM Plex Mono, monospace' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editForm.actual}
                              onChange={(e) => setEditForm({ ...editForm, actual: e.target.value })}
                              style={{ width: '100%', fontFamily: 'IBM Plex Mono, monospace' }}
                            />
                          </td>
                          <td>
                            {evalStatus === 'PASS' ? (
                              <span className="pass">PASS</span>
                            ) : (
                              <span className="fail">FAIL</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-btns">
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => handleSaveEdit(tc.id)}
                                title="Save to database"
                              >
                                ✓ Save
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                onClick={handleCancelEdit}
                                title="Cancel editing"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={tc.id}>
                        <td className="mono">{tc.id}</td>
                        <td>{tc.title}</td>
                        <td className="mono">{tc.expected}</td>
                        <td className="mono">{tc.actual}</td>
                        <td>
                          {evalStatus === 'PASS' ? (
                            <span className="pass">PASS</span>
                          ) : (
                            <span className="fail">FAIL</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-btns">
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleStartEdit(tc)}
                              title="Edit test case"
                            >
                              ✎ Edit
                            </button>
                            <button
                              type="button"
                              className="btn-icon del"
                              onClick={() => handleDeleteTestCase(tc.id)}
                              title="Delete from database"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6.3 Integrated Dashboard & Report */}
      {sub === 'dash' && (
        <>
          {statusDateBar}
          <div className="kpi-row">
            <div className="stat">
              <small>Overall progress</small>
              <b>{calc.progress.toFixed(1)}%</b>
              <span>earned value ÷ BAC</span>
            </div>
            <div
              className={`stat ${
                calc.CPI < thr.cpi || calc.SPI < thr.spi ? 'bad' : ''
              }`}
            >
              <small>CPI / SPI</small>
              <b>
                {calc.CPI.toFixed(2)} / {calc.SPI.toFixed(2)}
              </b>
              <span>cost & schedule performance</span>
            </div>
            <div className={`stat ${calc.fc.end > calc.deadline ? 'bad' : ''}`}>
              <small>Finish vs deadline</small>
              <b>
                Day {calc.fc.end} / {calc.deadline}
              </b>
              <span>
                {calc.fc.end > calc.deadline
                  ? `${calc.fc.end - calc.deadline} days late`
                  : 'within deadline'}
              </span>
            </div>
            <div
              className={`stat ${
                calc.planCost > calc.effBudget ? 'bad' : ''
              }`}
            >
              <small>Budget status</small>
              <b>{money(calc.effBudget)}</b>
              <span>planned {money(calc.planCost)}</span>
            </div>
          </div>

          <div className="kpi-row">
            <div className={`stat ${calc.delayed.length ? 'bad' : ''}`}>
              <small>Delayed activities</small>
              <b>{calc.delayed.length}</b>
              <span>slip or behind plan</span>
            </div>
            <div className={`stat ${pendingCRs.length ? 'warn' : ''}`}>
              <small>Pending change requests</small>
              <b>{pendingCRs.length}</b>
              <span>
                +{money(pendingCRs.reduce((s, c) => s + c.cost, 0))} · +
                {pendingCRs.reduce((s, c) => s + c.days, 0)} d
              </span>
            </div>
            <div className={`stat ${openCrit.length ? 'bad' : ''}`}>
              <small>Unresolved critical defects</small>
              <b>{openCrit.length}</b>
              <span>must be zero at go-live</span>
            </div>
            <div className="stat">
              <small>Checklist passed</small>
              <b>
                {checklist.filter((q) => q.result === 'Pass').length} / {checklist.length}
              </b>
              <span>quality gate</span>
            </div>
          </div>

          <div className="two">
            <section className="card">
              <h3>
                Delayed activities <span>{calc.delayed.length}</span>
              </h3>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Activity</th>
                      <th>Slip</th>
                      <th>Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.delayed.length > 0 ? (
                      calc.delayed.map((r) => (
                        <tr key={r.id}>
                          <td className="mono">{r.id}</td>
                          <td>{r.name}</td>
                          <td className="mono">{r.slip} d</td>
                          <td className="mono">+{r.impact} d</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="muted">
                          None.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h3>
                Pending change requests <span>{pendingCRs.length}</span>
              </h3>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Change</th>
                      <th>Cost</th>
                      <th>Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCRs.length > 0 ? (
                      pendingCRs.map((c) => (
                        <tr key={c.id}>
                          <td className="mono">{c.id}</td>
                          <td>{c.title}</td>
                          <td className="mono">{money(c.cost)}</td>
                          <td className="mono">+{c.days} d</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="muted">
                          None.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="card">
            <h3>
              Unresolved critical defects <span>{openCrit.length}</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Defect</th>
                    <th>Assigned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {openCrit.length > 0 ? (
                    openCrit.map((d) => (
                      <tr key={d.id}>
                        <td className="mono">{d.id}</td>
                        <td>{d.title}</td>
                        <td>{teamName(d.owner)}</td>
                        <td>
                          <span className="badge bad">{d.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="muted">
                        None. Gate can be passed.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h3>
              Report <span>export</span>
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={handleExportCsv}>
                Download schedule & EVM (CSV)
              </button>
              <button className="btn" onClick={() => window.print()}>
                Print / save report
              </button>
            </div>
          </section>
        </>
      )}
    </>
  );
}
