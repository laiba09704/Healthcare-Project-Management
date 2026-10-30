import React, { useState, useEffect } from 'react';
import { money, diff } from '../../data/initialData';

export default function PlanTab({
  data,
  onUpdatePlanScope,
  onUpdatePhase,
  onUpdateCost,
  onAddQuality,
  onUpdateQuality,
  onDeleteQuality,
  showToast
}) {
  const P = data.plan;
  const C = data.charter;

  const [scopeText, setScopeText] = useState(P.scope || '');

  useEffect(() => {
    setScopeText(P.scope || '');
  }, [P.scope]);

  const handleScopeSubmit = (e) => {
    e.preventDefault();
    onUpdatePlanScope(scopeText);
    showToast('Scope baseline saved.');
  };

  const totalCost = (P.costs || []).reduce((s, c) => s + +c.amount, 0);
  const bal = C.budget - C.reserve;
  const costGap = totalCost - bal;
  const isReconciled = Math.abs(costGap) < 1;

  const totalProjectDays = diff(C.start, C.deadline) + 1;
  const contractWeeks = Math.round(diff(C.start, C.deadline) / 7);

  // New Quality form state
  const [newQuality, setNewQuality] = useState({
    criterion: '',
    target: '100%',
    owner: 'Project Manager'
  });

  const handleAddQualitySubmit = (e) => {
    e.preventDefault();
    const criterion = newQuality.criterion.trim();
    if (!criterion) {
      showToast('Criterion is required.', 'err');
      return;
    }

    onAddQuality({
      id: Date.now(),
      criterion,
      target: newQuality.target.trim() || '—',
      owner: newQuality.owner
    });
    setNewQuality({ criterion: '', target: '100%', owner: 'Project Manager' });
    showToast('Quality criterion added.');
  };

  const handlePhaseChange = (index, field, value) => {
    const phase = P.phases[index];
    if (field === 'end' && value < phase.start) {
      showToast('Phase end cannot be before its start.', 'err');
      return;
    }
    if (field === 'start' && value > phase.end) {
      showToast('Phase start cannot be after its end.', 'err');
      return;
    }
    onUpdatePhase(index, field, value);
  };

  const handleCostChange = (index, value) => {
    const num = parseFloat(value);
    if (!isFinite(num) || num < 0) {
      showToast('Enter a valid non-negative number.', 'err');
      return;
    }
    onUpdateCost(index, num);
  };

  return (
    <>
      <section className="card">
        <h3>
          Scope baseline <span>project scope</span>
        </h3>
        <form onSubmit={handleScopeSubmit}>
          <textarea
            name="scope"
            value={scopeText}
            onChange={(e) => setScopeText(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn primary" type="submit">
              Save scope
            </button>
          </div>
        </form>
      </section>

      <div className="two">
        <section className="card">
          <h3>
            Schedule <span>{(P.phases || []).length} phases</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {(P.phases || []).map((p, i) => {
                  const phaseDays = diff(p.start, p.end) + 1;
                  return (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="date"
                          value={p.start}
                          onChange={(e) => handlePhaseChange(i, 'start', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={p.end}
                          onChange={(e) => handlePhaseChange(i, 'end', e.target.value)}
                        />
                      </td>
                      <td className="mono">{phaseDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ fontSize: '12.5px', margin: '10px 0 0' }}>
            Total duration {totalProjectDays} days against the {contractWeeks}-week contract.
          </p>
        </section>

        <section className="card">
          <h3>
            Cost plan <span>{money(totalCost)} planned</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Cost line</th>
                  <th>Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {(P.costs || []).map((c, i) => (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={c.amount}
                        onChange={(e) => handleCostChange(i, e.target.value)}
                        style={{ width: '150px' }}
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <b>Total activity cost</b>
                  </td>
                  <td className="mono">
                    <b>{money(totalCost)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Management reserve</td>
                  <td className="mono">{money(C.reserve)}</td>
                </tr>
                <tr>
                  <td>
                    <b>Planned total vs budget</b>
                  </td>
                  <td className={`mono ${isReconciled ? '' : 'bad'}`}>
                    <b>{money(totalCost + C.reserve)}</b>{' '}
                    {isReconciled ? (
                      <span className="badge ok">Reconciled</span>
                    ) : (
                      <span className="badge bad">Gap {money(costGap)}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card">
        <h3>
          Quality plan <span>standards & acceptance criteria</span>
        </h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Target</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(P.quality || []).map((q, i) => (
                <tr key={q.id || i}>
                  <td>{q.criterion}</td>
                  <td>
                    <input
                      value={q.target}
                      onChange={(e) => onUpdateQuality(i, 'target', e.target.value)}
                      style={{ width: '110px' }}
                    />
                  </td>
                  <td>
                    <select
                      value={q.owner}
                      onChange={(e) => onUpdateQuality(i, 'owner', e.target.value)}
                    >
                      {[
                        'Project Manager',
                        'Backend Developer 1',
                        'Database Developer',
                        'QA Engineer'
                      ].map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="x"
                      onClick={() => {
                        onDeleteQuality(i);
                        showToast('Removed.');
                      }}
                      title="Delete criterion"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="inline" onSubmit={handleAddQualitySubmit}>
          <label className="f" style={{ flex: 2 }}>
            Criterion
            <input
              value={newQuality.criterion}
              onChange={(e) => setNewQuality({ ...newQuality, criterion: e.target.value })}
              placeholder="e.g. Automated UI test coverage"
            />
          </label>
          <label className="f">
            Target
            <input
              value={newQuality.target}
              onChange={(e) => setNewQuality({ ...newQuality, target: e.target.value })}
            />
          </label>
          <label className="f">
            Owner
            <select
              value={newQuality.owner}
              onChange={(e) => setNewQuality({ ...newQuality, owner: e.target.value })}
            >
              <option>Project Manager</option>
              <option>Backend Developer 1</option>
              <option>Database Developer</option>
              <option>QA Engineer</option>
            </select>
          </label>
          <button className="btn" type="submit">
            Add criterion
          </button>
        </form>
      </section>
    </>
  );
}
