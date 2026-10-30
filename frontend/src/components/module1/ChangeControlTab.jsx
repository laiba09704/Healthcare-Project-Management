import React, { useState } from 'react';
import { money, fmt } from '../../data/initialData';

export default function ChangeControlTab({
  data,
  derived,
  onAddChange,
  onUpdateChangeDecision,
  onDeleteChange,
  showToast,
  onGoToModule2CR
}) {
  const [newCR, setNewCR] = useState({
    title: '',
    cost: 0,
    days: 0,
    just: ''
  });

  const handleAddCRSubmit = (e) => {
    e.preventDefault();
    const title = newCR.title.trim();
    if (!title) {
      showToast('Change title is required.', 'err');
      return;
    }
    const cost = parseFloat(newCR.cost);
    const days = parseInt(newCR.days, 10);
    if (isNaN(cost) || cost < 0 || isNaN(days) || days < 0) {
      showToast('Cost and days must be zero or more.', 'err');
      return;
    }

    const nextId = 'CR-' + String((data.changes || []).length + 1).padStart(2, '0');
    onAddChange({
      id: nextId,
      title,
      just: newCR.just.trim() || '—',
      cost,
      days,
      decision: 'Pending'
    });

    setNewCR({ title: '', cost: 0, days: 0, just: '' });
    showToast('Change logged as Pending.');
  };

  return (
    <div className="two">
      <section className="card">
        <h3>
          Integrated change requests <span>{(data.changes || []).length} logged</span>
        </h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Change</th>
                <th>Cost</th>
                <th>Days</th>
                <th>Decision</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data.changes || []).map((c, i) => (
                <tr key={c.id || i}>
                  <td className="mono">{c.id}</td>
                  <td>
                    {c.title}
                    <div className="muted" style={{ fontSize: '12px' }}>
                      {c.just}
                    </div>
                  </td>
                  <td className="mono">{money(c.cost)}</td>
                  <td className="mono">+{c.days}</td>
                  <td>
                    <select
                      value={c.decision}
                      onChange={(e) => onUpdateChangeDecision(i, e.target.value)}
                    >
                      {['Pending', 'Approved', 'Rejected'].map((v) => (
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
                        onDeleteChange(i);
                        showToast('Removed.');
                      }}
                      title="Delete change request"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {onGoToModule2CR && (
          <div style={{ marginTop: '14px' }}>
            <button className="btn primary" onClick={onGoToModule2CR}>
              Manage change requests in Module 02 →
            </button>
          </div>
        )}

        <form className="inline" onSubmit={handleAddCRSubmit}>
          <label className="f" style={{ flex: 2 }}>
            Change title
            <input
              value={newCR.title}
              onChange={(e) => setNewCR({ ...newCR, title: e.target.value })}
              placeholder="e.g. Patient portal biometric login"
            />
          </label>
          <label className="f">
            Cost (PKR)
            <input
              type="number"
              min="0"
              value={newCR.cost}
              onChange={(e) => setNewCR({ ...newCR, cost: e.target.value })}
            />
          </label>
          <label className="f">
            Days
            <input
              type="number"
              min="0"
              value={newCR.days}
              onChange={(e) => setNewCR({ ...newCR, days: e.target.value })}
            />
          </label>
          <label className="f" style={{ flex: 2 }}>
            Justification
            <input
              value={newCR.just}
              onChange={(e) => setNewCR({ ...newCR, just: e.target.value })}
              placeholder="e.g. Clinical security mandate"
            />
          </label>
          <button className="btn" type="submit">
            Log change
          </button>
        </form>
      </section>

      <section className="card">
        <h3>
          Integration impact <span>approved changes only</span>
        </h3>
        <div className="kv">
          <b>Baseline budget</b>
          <span className="mono">{money(data.charter.budget)}</span>
          <b>Approved change cost</b>
          <span className="mono">+{money(derived.addCost)}</span>
          <b>Effective budget</b>
          <span className="mono" style={{ fontWeight: 700, color: 'var(--teal-d)' }}>
            {money(derived.effBudget)}
          </span>
          <b>Baseline deadline</b>
          <span className="mono">{fmt(data.charter.deadline)}</span>
          <b>Effective deadline</b>
          <span className="mono">
            {fmt(derived.effDeadline)} (+{derived.addDays_} d)
          </span>
        </div>
        <p className="muted" style={{ fontSize: '12.5px', margin: '14px 0 0' }}>
          Approving a change updates the effective budget and deadline everywhere in the system.
          Pending requests are not yet in the baseline.
        </p>
      </section>
    </div>
  );
}
