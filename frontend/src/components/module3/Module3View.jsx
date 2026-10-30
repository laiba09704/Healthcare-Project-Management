import React, { useState } from 'react';
import {
  SUB3,
  money,
  fmt,
  addDays,
  diff,
  downstreamOf,
  peakOf,
  runCpm,
  buildSchedActs,
  nextId
} from '../../data/initialData';

export default function Module3View({
  data,
  calc,
  sub,
  onSelectSub,
  onGoHome,
  onUpdateStatusDate,
  onUpdateActivity,
  onAddActivity,
  onDeleteActivity,
  onUpdateCrProg,
  showToast
}) {
  const team = data.team || [];
  const teamOpts = (selected) =>
    team.map((t) => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
    ));

  const totalDays = Math.max(calc.fc.end, calc.deadline, calc.plan.end) + 4;
  const pos = (d) => `${((d / totalDays) * 100).toFixed(3)}%`;

  // Activity add form state
  const [newAct, setNewAct] = useState({
    name: '',
    owner: 'M2',
    dur: 7,
    deps: '',
    budget: 0
  });

  // Gantt chart view mode: 'split' | 'compact' | 'cpm'
  const [ganttViewMode, setGanttViewMode] = useState('split');

  const handleAddActivity = (e) => {
    e.preventDefault();
    const name = newAct.name.trim();
    if (!name) {
      showToast('Activity name is required.', 'err');
      return;
    }
    const dur = parseInt(newAct.dur, 10);
    if (!(dur >= 1)) {
      showToast('Duration must be at least 1 day.', 'err');
      return;
    }

    const deps = String(newAct.deps || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const bad = deps.filter((d) => !data.acts.some((a) => a.id === d));
    if (bad.length) {
      showToast(`Unknown predecessor: ${bad.join(', ')}`, 'err');
      return;
    }

    const id = nextId('A', data.acts);
    const candidate = {
      id,
      name,
      owner: newAct.owner,
      dur,
      deps,
      budget: parseFloat(newAct.budget) || 0,
      pct: 0,
      ac: 0,
      slip: 0
    };

    // Cycle check
    const simulatedActs = buildSchedActs({
      ...data,
      acts: [...data.acts, candidate]
    });
    if (runCpm(simulatedActs, false).cycle) {
      showToast('That dependency creates a circular chain.', 'err');
      return;
    }

    onAddActivity(candidate);
    setNewAct({ name: '', owner: 'M2', dur: 7, deps: '', budget: 0 });
    showToast(`${id} added to the schedule.`);
  };

  const handleDeleteActivity = (id) => {
    if (data.defects && data.defects.some((d) => d.act === id)) {
      showToast('Activity has linked defects. Relink or close them first.', 'err');
      return;
    }
    onDeleteActivity(id);
    showToast('Removed.');
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

  const margin = calc.deadline - calc.fc.end;

  return (
    <>
      <div className="mhead">
        <span className="num">03</span>
        <h2>Schedule & Resource Management</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Define activities, assign owners, estimate durations and dependencies. The forward pass
        computes start and finish dates; delays push dependents and the final deadline.
      </p>

      <div className="tabs">
        {SUB3.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${sub === key ? 'on' : ''}`}
            onClick={() => onSelectSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3.1 Activities & Schedule */}
      {sub === 'sched' && (
        <>
          {statusDateBar}
          <div className="kpi-row">
            <div className="stat">
              <small>Baseline finish</small>
              <b>Day {calc.plan.end}</b>
              <span>{fmt(addDays(data.charter.start, calc.plan.end))}</span>
            </div>
            <div className={`stat ${calc.fc.end > calc.deadline ? 'bad' : ''}`}>
              <small>Forecast finish</small>
              <b>Day {calc.fc.end}</b>
              <span>{fmt(addDays(data.charter.start, calc.fc.end))}</span>
            </div>
            <div className={`stat ${calc.fc.end > calc.deadline ? 'bad' : ''}`}>
              <small>Effective deadline</small>
              <b>Day {calc.deadline}</b>
              <span>
                {calc.fc.end > calc.deadline
                  ? `${calc.fc.end - calc.deadline} days late`
                  : 'within deadline'}
              </span>
            </div>
            <div className={`stat ${calc.delayed.length ? 'bad' : ''}`}>
              <small>Delayed activities</small>
              <b>{calc.delayed.length}</b>
              <span>slip or behind plan</span>
            </div>
          </div>

          <section className="card">
            <h3>
              Activities & schedule <span>forward pass · dependencies</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>Owner</th>
                    <th>Duration</th>
                    <th>Predecessors</th>
                    <th>Planned window</th>
                    <th>Forecast finish</th>
                    <th>Slip (d)</th>
                    <th>% complete</th>
                    <th>Status</th>
                    <th>Impact</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((r) => {
                    const isCR = r.isCR;
                    return (
                      <tr key={r.id}>
                        <td className="mono muted">{r.id}</td>
                        <td>
                          {r.name} {isCR && <span className="badge info">change</span>}
                        </td>
                        <td>
                          <select
                            value={r.owner}
                            onChange={(e) => {
                              if (isCR) onUpdateCrProg(r.cr, 'owner', e.target.value);
                              else onUpdateActivity(r.id, 'owner', e.target.value);
                            }}
                          >
                            {teamOpts(r.owner)}
                          </select>
                        </td>
                        <td>
                          {isCR ? (
                            <span className="mono">{r.dur} d</span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={r.dur}
                              onChange={(e) =>
                                onUpdateActivity(r.id, 'dur', parseInt(e.target.value, 10) || 1)
                              }
                              style={{ width: '72px' }}
                            />
                          )}
                        </td>
                        <td className="mono muted" style={{ fontSize: '12px' }}>
                          {r.deps.join(', ') || '—'}
                        </td>
                        <td className="mono" style={{ fontSize: '12px' }}>
                          {fmt(addDays(data.charter.start, r.ES))}
                          <br />
                          <span className="muted">→ {fmt(addDays(data.charter.start, r.EF))}</span>
                        </td>
                        <td className="mono">{fmt(addDays(data.charter.start, r.fEF))}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={r.slip}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              if (isCR) onUpdateCrProg(r.cr, 'slip', val);
                              else onUpdateActivity(r.id, 'slip', val);
                            }}
                            style={{ width: '64px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={r.pct}
                            onChange={(e) => {
                              const val = Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0));
                              if (isCR) onUpdateCrProg(r.cr, 'pct', val);
                              else onUpdateActivity(r.id, 'pct', val);
                            }}
                            style={{ width: '64px' }}
                          />
                        </td>
                        <td>
                          {r.delayed ? (
                            <span className="badge bad">Delayed</span>
                          ) : (
                            <span className="badge ok">On track</span>
                          )}
                        </td>
                        <td className={`mono ${r.impact ? 'bad' : ''}`}>
                          {r.impact ? `+${r.impact} d` : '0 d'}
                        </td>
                        <td>
                          {!isCR && (
                            <button
                              className="x"
                              onClick={() => handleDeleteActivity(r.id)}
                              title="Delete activity"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <form className="inline" onSubmit={handleAddActivity}>
              <label className="f" style={{ flex: 2 }}>
                Activity
                <input
                  value={newAct.name}
                  onChange={(e) => setNewAct({ ...newAct, name: e.target.value })}
                  placeholder="e.g. End-to-end integration tests"
                />
              </label>
              <label className="f">
                Owner
                <select
                  value={newAct.owner}
                  onChange={(e) => setNewAct({ ...newAct, owner: e.target.value })}
                >
                  {teamOpts(newAct.owner)}
                </select>
              </label>
              <label className="f">
                Duration (days)
                <input
                  type="number"
                  min="1"
                  value={newAct.dur}
                  onChange={(e) => setNewAct({ ...newAct, dur: e.target.value })}
                />
              </label>
              <label className="f">
                Predecessors
                <input
                  value={newAct.deps}
                  onChange={(e) => setNewAct({ ...newAct, deps: e.target.value })}
                  placeholder="A9, A10"
                />
              </label>
              <label className="f">
                Budget (PKR)
                <input
                  type="number"
                  min="0"
                  value={newAct.budget}
                  onChange={(e) => setNewAct({ ...newAct, budget: e.target.value })}
                />
              </label>
              <button className="btn" type="submit">
                Add activity
              </button>
            </form>
          </section>
        </>
      )}

      {/* 3.2 Gantt Chart */}
      {sub === 'gantt' && (
        <>
          {statusDateBar}

          {/* Project Schedule Generation & CPM Control Card */}
          <section className="card">
            <h3>
              Project schedule generation{' '}
              <span>start dates · end dates · dependency relationships (FS)</span>
            </h3>

            <div className="schedule-action-bar">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn primary"
                  type="button"
                  onClick={() =>
                    showToast(
                      'Project schedule generated successfully using activity start dates, end dates, and dependency relationships.'
                    )
                  }
                >
                  ⚡ Generate / Recalculate Project Schedule
                </button>
                <span className="badge ok">Automated Schedule Engine</span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className={`btn sm ${ganttViewMode === 'split' ? 'primary' : ''}`}
                  type="button"
                  onClick={() => setGanttViewMode('split')}
                >
                  📊 Split View (Grid + Timeline)
                </button>
                <button
                  className={`btn sm ${ganttViewMode === 'compact' ? 'primary' : ''}`}
                  type="button"
                  onClick={() => setGanttViewMode('compact')}
                >
                  📈 Timeline Only
                </button>
                <button
                  className={`btn sm ${ganttViewMode === 'cpm' ? 'primary' : ''}`}
                  type="button"
                  onClick={() => setGanttViewMode('cpm')}
                >
                  📋 Schedule Table
                </button>
              </div>
            </div>

            <div className="legend">
              <span>
                <i style={{ border: '1px solid var(--teal)' }}></i>Baseline plan
              </span>
              <span>
                <i style={{ background: 'var(--teal)' }}></i>Actual progress
              </span>
              <span>
                <i style={{ background: 'var(--coral)' }}></i>Delayed
              </span>
              <span>
                <i
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, rgba(200,68,55,.55) 0 4px, transparent 4px 8px)'
                  }}
                ></i>
                Forecast shift
              </span>
              <span>
                <i
                  style={{
                    background: 'transparent',
                    borderLeft: '2px dashed var(--coral)',
                    width: '2px',
                    height: '12px'
                  }}
                ></i>
                Contract deadline
              </span>
              <span>
                <i
                  style={{
                    background: 'transparent',
                    borderLeft: '2px solid var(--amber)',
                    width: '2px',
                    height: '12px'
                  }}
                ></i>
                Effective deadline
              </span>
              <span>
                <i
                  style={{
                    background: 'transparent',
                    borderLeft: '2px solid var(--ok)',
                    width: '2px',
                    height: '12px'
                  }}
                ></i>
                Status date
              </span>
              <span>
                <i style={{ background: '#7a5af0', width: '8px', height: '8px' }}></i>
                Milestone
              </span>
            </div>

            {/* Gantt Chart (Split or Compact) */}
            {ganttViewMode !== 'cpm' && (
              <div className={`gantt ${ganttViewMode === 'split' ? 'split' : 'compact'}`}>
                <div className="gwrap">
                  {/* Header Row */}
                  <div className="ghead">
                    {ganttViewMode === 'split' ? (
                      <div className="ghead-grid">
                        <span>ID</span>
                        <span>Activity</span>
                        <span>Start</span>
                        <span>Finish</span>
                        <span>Predecessors</span>
                        <span>Dur</span>
                      </div>
                    ) : (
                      <div className="mini" style={{ paddingLeft: '4px', fontWeight: 600 }}>
                        Activity
                      </div>
                    )}

                    <div className="gscale">
                      {Array.from({ length: Math.ceil(totalDays / 7) }).map((_, w) => (
                        <span key={w} style={{ left: pos(w * 7) }}>
                          W{w + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    {/* Milestones Row */}
                    <div className="grow">
                      <div className="glabel muted" style={{ fontWeight: 600 }}>
                        Milestones
                      </div>
                      <div className="gtrack">
                        {(data.milestones || []).map((m, i) => (
                          <i
                            key={i}
                            className="ms"
                            style={{ left: pos(diff(data.charter.start, m.date)) }}
                            title={`${m.name} · ${fmt(m.date)}`}
                          ></i>
                        ))}
                      </div>
                    </div>

                    {/* Activity Rows */}
                    {calc.rows.map((r) => {
                      const tooltip = `${r.id}: ${r.name}\nStart Date: ${fmt(
                        r.startDate
                      )}\nEnd Date: ${fmt(r.endDate)}\nForecast Finish: ${fmt(
                        r.forecastEndDate
                      )}\nDependencies: ${r.deps.length
                          ? r.deps.map((d) => `${d} (Finish-to-Start)`).join(', ')
                          : 'None (Project Start)'
                        }\nDuration: ${r.dur} days | Progress: ${r.pct}%\nStatus: ${r.delayed ? 'Delayed' : 'On track'
                        }`;

                      return (
                        <div className="grow" key={r.id}>
                          {ganttViewMode === 'split' ? (
                            <div className="grow-grid">
                              <span className="mono muted" style={{ fontWeight: 600 }}>
                                {r.id}
                              </span>
                              <span
                                style={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontWeight: r.isCritical ? 700 : 500,
                                  color: r.isCritical ? 'var(--ink)' : 'inherit'
                                }}
                                title={r.name}
                              >
                                {r.name}
                              </span>
                              <span className="mono" style={{ fontSize: '11px' }}>
                                {fmt(r.startDate)}
                              </span>
                              <span className="mono" style={{ fontSize: '11px' }}>
                                {fmt(r.endDate)}
                              </span>
                              <span className="mono muted" style={{ fontSize: '11px' }}>
                                {r.deps.length ? r.deps.join(', ') : '—'}
                              </span>
                              <span className="mono" style={{ fontSize: '11px' }}>
                                {r.dur}d
                              </span>
                            </div>
                          ) : (
                            <div className="glabel">
                              <span className="mono muted">{r.id}</span> {r.name}
                            </div>
                          )}

                          <div className="gtrack" title={tooltip}>
                            <div
                              className="gb plan"
                              style={{ left: pos(r.ES), width: pos(r.EF - r.ES) }}
                            ></div>
                            <div
                              className={`gb act ${r.delayed ? 'late' : ''}`}
                              style={{
                                left: pos(r.ES),
                                width: pos(((r.EF - r.ES) * r.pct) / 100)
                              }}
                            ></div>
                            {r.fEF !== r.EF && (
                              <div
                                className="gb fc"
                                style={{ left: pos(r.fES), width: pos(r.fEF - r.fES) }}
                              ></div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="gover">
                      <i className="dl" style={{ left: pos(calc.contractDay) }}></i>
                      {calc.deadline !== calc.contractDay && (
                        <i className="dl2" style={{ left: pos(calc.deadline) }}></i>
                      )}
                      <i className="sdl" style={{ left: pos(calc.sd) }}></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Schedule Table */}
            {ganttViewMode === 'cpm' && (
              <div className="tw" style={{ marginTop: '14px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Activity</th>
                      <th>Dependencies (Predecessors)</th>
                      <th>Duration</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Forecast Finish</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calc.rows.map((r) => (
                      <tr key={r.id}>
                        <td className="mono muted">{r.id}</td>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td className="mono" style={{ fontSize: '12px' }}>
                          {r.deps.length
                            ? r.deps.map((d) => `${d} (FS)`).join(', ')
                            : 'None (Project Start)'}
                        </td>
                        <td className="mono">{r.dur} days</td>
                        <td className="mono" style={{ fontSize: '12px' }}>
                          {fmt(r.startDate)}
                        </td>
                        <td className="mono" style={{ fontSize: '12px' }}>
                          {fmt(r.endDate)}
                        </td>
                        <td className="mono" style={{ fontSize: '12px' }}>
                          {fmt(r.forecastEndDate)}
                        </td>
                        <td className="mono">{r.pct}%</td>
                        <td>
                          {r.delayed ? (
                            <span className="badge bad">Delayed</span>
                          ) : (
                            <span className="badge ok">On track</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* 3.3 Delay Impact */}
      {sub === 'delay' && (
        <>
          {statusDateBar}
          <div className="kpi-row">
            <div className="stat">
              <small>Baseline finish</small>
              <b>Day {calc.plan.end}</b>
              <span>without slips</span>
            </div>
            <div className={`stat ${calc.fc.end > calc.plan.end ? 'warn' : ''}`}>
              <small>Forecast finish</small>
              <b>Day {calc.fc.end}</b>
              <span>with current slips</span>
            </div>
            <div className={`stat ${margin < 0 ? 'bad' : margin < 7 ? 'warn' : ''}`}>
              <small>Deadline margin</small>
              <b>{margin} d</b>
              <span>effective deadline day {calc.deadline}</span>
            </div>
            <div className={`stat ${calc.delayed.length ? 'bad' : ''}`}>
              <small>Delayed activities</small>
              <b>{calc.delayed.length}</b>
              <span></span>
            </div>
          </div>

          <section className="card">
            <h3>
              Delayed activities <span>impact on dependents and final deadline</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>Slip</th>
                    <th>Own shift</th>
                    <th>All dependents</th>
                    <th>Shifted dependents</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.delayed.length > 0 ? (
                    calc.delayed.map((r) => {
                      const dn = downstreamOf(r.id, calc.rows);
                      const hit = calc.rows
                        .filter((x) => dn.includes(x.id) && x.impact > 0)
                        .map((x) => x.id);
                      return (
                        <tr key={r.id}>
                          <td className="mono">{r.id}</td>
                          <td>{r.name}</td>
                          <td className="mono">{r.slip} d</td>
                          <td className="mono">+{r.impact} d</td>
                          <td className="mono">{dn.join(', ') || '—'}</td>
                          <td className="mono">{hit.join(', ') || '—'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="muted">
                        No delayed activities at the status date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              className={`alert ${margin < 0 ? 'bad' : margin < 7 ? 'warn' : 'ok'}`}
              style={{ marginTop: '12px' }}
            >
              {margin < 0
                ? `Forecast finish is ${-margin} days beyond the effective deadline. Recovery actions needed.`
                : `Finish margin is ${margin} days against the effective deadline.`}
            </div>
          </section>
        </>
      )}

      {/* 3.4 Resources */}
      {sub === 'res' && (
        <section className="card">
          <h3>
            Resource allocation <span>{team.length} team members</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Assigned activities</th>
                  <th>Planned effort</th>
                  <th>Peak parallel</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((t) => {
                  const mine = calc.rows.filter((r) => r.owner === t.id);
                  const effortDays = mine.reduce((s, r) => s + r.dur, 0);
                  const peak = peakOf(mine, calc.plan.end);
                  return (
                    <tr key={t.id}>
                      <td>
                        <b>{t.name}</b>
                        <div className="muted" style={{ fontSize: '12px' }}>
                          {t.role}
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: '12px' }}>
                        {mine.map((r) => r.id).join(', ') || '—'}
                      </td>
                      <td className="mono">{effortDays} d</td>
                      <td className="mono">{peak}</td>
                      <td>
                        {peak > 1 ? (
                          <span className="badge warn">Overlap · check capacity</span>
                        ) : (
                          <span className="badge ok">Capacity OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ fontSize: '12.5px', margin: '12px 0 0' }}>
            Owners are set in 3.1. Overlap means one member has more than one planned activity on the same day.
          </p>
        </section>
      )}
    </>
  );
}
