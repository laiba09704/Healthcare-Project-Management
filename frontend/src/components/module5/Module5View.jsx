import React, { useState } from 'react';
import { SUB5, bandOf, nextId } from '../../data/initialData';

export default function Module5View({
  data,
  sub,
  onSelectSub,
  onGoHome,
  onUpdateDefect,
  onAddDefect,
  onDeleteDefect,
  onUpdateChecklist,
  onAddChecklist,
  onDeleteChecklist,
  onUpdateRisk,
  onAddRisk,
  onDeleteRisk,
  showToast
}) {
  const team = data.team || [];
  const acts = data.acts || [];
  const defects = data.defects || [];
  const checklist = data.checklist || [];
  const risks = data.risks || [];

  const teamOpts = (selected) =>
    team.map((t) => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
    ));

  // Forms states
  const [newDefect, setNewDefect] = useState({
    title: '',
    sev: 'Critical',
    act: acts[0]?.id || 'A4',
    owner: 'M7'
  });

  const [newCheck, setNewCheck] = useState({
    item: '',
    deliv: '',
    by: 'M7'
  });

  const [newRisk, setNewRisk] = useState({
    title: '',
    pp: '',
    L: 3,
    I: 3,
    prev: '',
    corr: ''
  });

  // Handlers
  const handleAddDefectSubmit = (e) => {
    e.preventDefault();
    const title = newDefect.title.trim();
    if (!title) {
      showToast('Defect title is required.', 'err');
      return;
    }
    const id = nextId('D', defects);
    onAddDefect({
      id,
      title,
      sev: newDefect.sev,
      act: newDefect.act,
      owner: newDefect.owner,
      status: 'Open'
    });
    setNewDefect({ title: '', sev: 'Critical', act: acts[0]?.id || 'A4', owner: 'M7' });
    showToast('Defect logged.');
  };

  const handleAddCheckSubmit = (e) => {
    e.preventDefault();
    const item = newCheck.item.trim();
    if (!item) {
      showToast('Check item is required.', 'err');
      return;
    }
    const id = nextId('Q', checklist);
    onAddChecklist({
      id,
      item,
      deliv: newCheck.deliv.trim() || '—',
      result: 'Pending',
      by: newCheck.by
    });
    setNewCheck({ item: '', deliv: '', by: 'M7' });
    showToast('Check added to the checklist.');
  };

  const handleAddRiskSubmit = (e) => {
    e.preventDefault();
    const title = newRisk.title.trim();
    if (!title) {
      showToast('Risk title is required.', 'err');
      return;
    }
    const L = parseInt(newRisk.L, 10);
    const I = parseInt(newRisk.I, 10);
    if (!(L >= 1 && L <= 5 && I >= 1 && I <= 5)) {
      showToast('Likelihood and impact must be between 1 and 5.', 'err');
      return;
    }
    const id = nextId('K', risks);
    onAddRisk({
      id,
      title,
      pp: newRisk.pp.trim() || '—',
      L,
      I,
      prev: newRisk.prev.trim() || '—',
      corr: newRisk.corr.trim() || '—'
    });
    setNewRisk({ title: '', pp: '', L: 3, I: 3, prev: '', corr: '' });
    showToast('Risk added to the register.');
  };

  // 5.1 Defect stats
  const countOpen = (sev) =>
    defects.filter((d) => d.sev === sev && !['Resolved', 'Closed'].includes(d.status)).length;

  // 5.2 Checklist stats
  const checkPassed = checklist.filter((q) => q.result === 'Pass').length;
  const checkFailed = checklist.filter((q) => q.result === 'Fail').length;

  // 5.3 Risk Matrix render
  const rankedRisks = [...risks].sort((a, b) => b.L * b.I - a.L * a.I || b.I - a.I);

  const renderRiskMatrix = () => {
    const rows = [];
    for (let L = 5; L >= 1; L--) {
      const cells = [];
      cells.push(
        <div key={`y-${L}`} className="ylab">
          {L}
        </div>
      );
      for (let I = 1; I <= 5; I++) {
        const [, tone] = bandOf(L * I);
        const cls = tone === 'bad' ? 'hi' : tone === 'warn' ? 'mid' : 'lo';
        const inCell = risks.filter((k) => k.L === L && k.I === I);
        cells.push(
          <div key={`c-${L}-${I}`} className={`cell ${cls}`}>
            {inCell.map((k) => (
              <b key={k.id} title={k.title}>
                {k.id}
              </b>
            ))}
          </div>
        );
      }
      rows.push(cells);
    }

    return (
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="axis" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          Likelihood
        </div>
        <div style={{ flex: 1, maxWidth: '560px' }}>
          <div className="matrix">
            {rows.flat()}
            <div></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`x-${i}`} className="xlab">
                {i}
              </div>
            ))}
          </div>
          <div className="axis" style={{ textAlign: 'center' }}>
            Impact
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="mhead">
        <span className="num">05</span>
        <h2>Quality Management & Risk Control</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Record defects with severity and owner, run the deliverable checklist, rank risks on the
        prioritisation matrix, and plan responses on the PDPC chart.
      </p>

      <div className="tabs">
        {SUB5.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${sub === key ? 'on' : ''}`}
            onClick={() => onSelectSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 5.1 Defect Tracker */}
      {sub === 'def' && (
        <>
          <div className="kpi-row">
            {['Critical', 'Major', 'Minor'].map((sev) => {
              const open = countOpen(sev);
              const total = defects.filter((d) => d.sev === sev).length;
              return (
                <div key={sev} className={`stat ${sev === 'Critical' && open > 0 ? 'bad' : ''}`}>
                  <small>{sev} open</small>
                  <b>{open}</b>
                  <span>of {total} logged</span>
                </div>
              );
            })}
          </div>

          <section className="card">
            <h3>
              Defect log <span>{defects.length} defects</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Defect</th>
                    <th>Severity</th>
                    <th>Activity</th>
                    <th>Assigned</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {defects.map((d) => (
                    <tr key={d.id}>
                      <td className="mono">{d.id}</td>
                      <td>{d.title}</td>
                      <td>
                        <select
                          value={d.sev}
                          onChange={(e) => onUpdateDefect(d.id, 'sev', e.target.value)}
                        >
                          {['Critical', 'Major', 'Minor'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={d.act}
                          onChange={(e) => onUpdateDefect(d.id, 'act', e.target.value)}
                        >
                          {acts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.id}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={d.owner}
                          onChange={(e) => onUpdateDefect(d.id, 'owner', e.target.value)}
                        >
                          {teamOpts(d.owner)}
                        </select>
                      </td>
                      <td>
                        <select
                          value={d.status}
                          onChange={(e) => onUpdateDefect(d.id, 'status', e.target.value)}
                        >
                          {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="x"
                          onClick={() => {
                            onDeleteDefect(d.id);
                            showToast('Removed.');
                          }}
                          title="Delete defect"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form className="inline" onSubmit={handleAddDefectSubmit}>
              <label className="f" style={{ flex: 2 }}>
                Defect title
                <input
                  value={newDefect.title}
                  onChange={(e) => setNewDefect({ ...newDefect, title: e.target.value })}
                  placeholder="e.g. Broken doctor appointment calendar slot"
                />
              </label>
              <label className="f">
                Severity
                <select
                  value={newDefect.sev}
                  onChange={(e) => setNewDefect({ ...newDefect, sev: e.target.value })}
                >
                  <option>Critical</option>
                  <option>Major</option>
                  <option>Minor</option>
                </select>
              </label>
              <label className="f">
                Activity
                <select
                  value={newDefect.act}
                  onChange={(e) => setNewDefect({ ...newDefect, act: e.target.value })}
                >
                  {acts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="f">
                Assigned
                <select
                  value={newDefect.owner}
                  onChange={(e) => setNewDefect({ ...newDefect, owner: e.target.value })}
                >
                  {teamOpts(newDefect.owner)}
                </select>
              </label>
              <button className="btn" type="submit">
                Log defect
              </button>
            </form>
          </section>
        </>
      )}

      {/* 5.2 Quality Checklist */}
      {sub === 'chk' && (
        <>
          <div className="kpi-row">
            <div className={`stat ${checkPassed < checklist.length ? 'warn' : ''}`}>
              <small>Checks passed</small>
              <b>
                {checkPassed} / {checklist.length}
              </b>
              <span>inspection & testing results</span>
            </div>
            <div className={`stat ${checkFailed > 0 ? 'bad' : ''}`}>
              <small>Failed</small>
              <b>{checkFailed}</b>
              <span>must be fixed before go-live</span>
            </div>
          </div>

          <section className="card">
            <h3>
              Quality checklist <span>deliverables</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Check</th>
                    <th>Result</th>
                    <th>Inspector</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {checklist.map((q) => (
                    <tr key={q.id}>
                      <td className="mono">{q.id}</td>
                      <td>
                        {q.item}
                        <div className="muted" style={{ fontSize: '12px' }}>
                          {q.deliv}
                        </div>
                      </td>
                      <td>
                        <select
                          value={q.result}
                          onChange={(e) => onUpdateChecklist(q.id, 'result', e.target.value)}
                        >
                          {['Pass', 'Fail', 'Pending'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={q.by}
                          onChange={(e) => onUpdateChecklist(q.id, 'by', e.target.value)}
                        >
                          {teamOpts(q.by)}
                        </select>
                      </td>
                      <td>
                        <button
                          className="x"
                          onClick={() => {
                            onDeleteChecklist(q.id);
                            showToast('Removed.');
                          }}
                          title="Delete check"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form className="inline" onSubmit={handleAddCheckSubmit}>
              <label className="f" style={{ flex: 2 }}>
                Check item
                <input
                  value={newCheck.item}
                  onChange={(e) => setNewCheck({ ...newCheck, item: e.target.value })}
                  placeholder="e.g. HL7/FHIR hospital API integration verified"
                />
              </label>
              <label className="f">
                Deliverable
                <input
                  value={newCheck.deliv}
                  onChange={(e) => setNewCheck({ ...newCheck, deliv: e.target.value })}
                  placeholder="e.g. HIS Gateway"
                />
              </label>
              <label className="f">
                Inspector
                <select
                  value={newCheck.by}
                  onChange={(e) => setNewCheck({ ...newCheck, by: e.target.value })}
                >
                  {teamOpts(newCheck.by)}
                </select>
              </label>
              <button className="btn" type="submit">
                Add check
              </button>
            </form>
          </section>
        </>
      )}

      {/* 5.3 Prioritisation Matrix */}
      {sub === 'mat' && (
        <div className="two">
          <section className="card">
            <h3>
              Prioritisation matrix <span>likelihood × impact</span>
            </h3>
            {renderRiskMatrix()}
            <div className="legend" style={{ marginTop: '16px' }}>
              <span>
                <i style={{ background: '#def2dd' }}></i>Low (1–7)
              </span>
              <span>
                <i style={{ background: '#fcf1db' }}></i>Moderate (8–14)
              </span>
              <span>
                <i style={{ background: '#fde8e5' }}></i>Critical (15–25)
              </span>
            </div>
          </section>

          <section className="card">
            <h3>
              Risk register <span>ranked by score</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Risk</th>
                    <th>L</th>
                    <th>I</th>
                    <th>Score</th>
                    <th>Band</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rankedRisks.map((k, i) => {
                    const score = k.L * k.I;
                    const [lbl, tone] = bandOf(score);
                    return (
                      <tr key={k.id}>
                        <td className="mono">{i + 1}</td>
                        <td className="mono">{k.id}</td>
                        <td>{k.title}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={k.L}
                            onChange={(e) =>
                              onUpdateRisk(
                                k.id,
                                'L',
                                Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 1))
                              )
                            }
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={k.I}
                            onChange={(e) =>
                              onUpdateRisk(
                                k.id,
                                'I',
                                Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 1))
                              )
                            }
                            style={{ width: '60px' }}
                          />
                        </td>
                        <td className="mono">
                          <b>{score}</b>
                        </td>
                        <td>
                          <span className={`badge ${tone}`}>{lbl}</span>
                        </td>
                        <td>
                          <button
                            className="x"
                            onClick={() => {
                              onDeleteRisk(k.id);
                              showToast('Removed.');
                            }}
                            title="Delete risk"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <form
              className="grid"
              onSubmit={handleAddRiskSubmit}
              style={{
                marginTop: '14px',
                paddingTop: '14px',
                borderTop: '1px dashed var(--line)'
              }}
            >
              <label className="f full">
                Risk
                <input
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  placeholder="e.g. HIS Gateway network latency"
                />
              </label>
              <label className="f full">
                Potential problem
                <input
                  value={newRisk.pp}
                  onChange={(e) => setNewRisk({ ...newRisk, pp: e.target.value })}
                  placeholder="Consequence if risk occurs"
                />
              </label>
              <label className="f">
                Likelihood (1–5)
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRisk.L}
                  onChange={(e) => setNewRisk({ ...newRisk, L: e.target.value })}
                />
              </label>
              <label className="f">
                Impact (1–5)
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRisk.I}
                  onChange={(e) => setNewRisk({ ...newRisk, I: e.target.value })}
                />
              </label>
              <label className="f">
                Preventive action
                <input
                  value={newRisk.prev}
                  onChange={(e) => setNewRisk({ ...newRisk, prev: e.target.value })}
                />
              </label>
              <label className="f">
                Corrective action
                <input
                  value={newRisk.corr}
                  onChange={(e) => setNewRisk({ ...newRisk, corr: e.target.value })}
                />
              </label>
              <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn primary" type="submit">
                  Add risk
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* 5.4 PDPC Risk Response */}
      {sub === 'pdpc' && (
        <section className="card">
          <h3>
            PDPC · structured risk response <span>problem → preventive → corrective</span>
          </h3>
          {rankedRisks.map((k) => {
            const [lbl, tone] = bandOf(k.L * k.I);
            return (
              <div className="pdpc" key={k.id}>
                <div className="pnode root">
                  <h6>
                    Potential problem · {k.id} · <span className={`badge ${tone}`}>{lbl}</span>
                  </h6>
                  <b>{k.title}</b>
                  <br />
                  <span className="muted">{k.pp}</span>
                </div>
                <div className="arr">⟶</div>
                <div className="pnode pre">
                  <h6>Preventive action</h6>
                  {k.prev}
                </div>
                <div className="arr">⟶</div>
                <div className="pnode cor">
                  <h6>Corrective action (if it occurs)</h6>
                  {k.corr}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
