import React, { useState, useEffect } from 'react';
import { money, fmt, diff } from '../../data/initialData';

export default function CharterTab({ data, derived, onUpdateCharter, onAddStakeholder, onUpdateStakeholder, onDeleteStakeholder, showToast }) {
  const C = data.charter;

  // Local form state for charter to allow natural typing before saving
  const [formData, setFormData] = useState({ ...C });

  useEffect(() => {
    setFormData({ ...C });
  }, [C]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCharterSubmit = (e) => {
    e.preventDefault();
    const b = parseFloat(formData.budget);
    const res = parseFloat(formData.reserve) || 0;

    if (!(b > 0)) {
      showToast('Approved budget must be greater than zero.', 'err');
      return;
    }
    if (res < 0 || res >= b) {
      showToast('Reserve must be non-negative and less than the budget.', 'err');
      return;
    }
    if (!(formData.deadline > formData.start)) {
      showToast('Deadline must fall after the start date.', 'err');
      return;
    }

    onUpdateCharter({
      ...formData,
      name: formData.name.trim() || C.name,
      budget: b,
      reserve: res
    });
    showToast('Charter saved. Baseline updated.');
  };

  // State for new stakeholder
  const [newStake, setNewStake] = useState({ name: '', role: '', interest: 'High' });

  const handleAddStake = (e) => {
    e.preventDefault();
    const name = newStake.name.trim();
    if (!name) {
      showToast('Stakeholder name is required.', 'err');
      return;
    }

    onAddStakeholder({
      id: Date.now(),
      name,
      role: newStake.role.trim() || 'Stakeholder',
      interest: newStake.interest
    });
    setNewStake({ name: '', role: '', interest: 'High' });
    showToast('Stakeholder added.');
  };

  const inScopeItems = (C.inScope || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const outScopeItems = (C.outScope || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const durationWeeks = Math.round(diff(C.start, C.deadline) / 7);

  return (
    <>
      <div className="two">
        <section className="card">
          <h3>
            Project charter <span>objectives · scope · budget · deadline</span>
          </h3>
          <form className="grid" onSubmit={handleCharterSubmit}>
            <label className="f full">
              Project name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="f">
              Client
              <input
                name="client"
                value={formData.client}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              Sponsor
              <input
                name="sponsor"
                value={formData.sponsor}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              Project manager
              <input
                name="manager"
                value={formData.manager}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              Status
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {['Initiated', 'Executing', 'Monitoring', 'Closing', 'Closed'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="f full">
              Objectives
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              In-scope boundaries (one per line)
              <textarea
                name="inScope"
                value={formData.inScope}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              Out-of-scope boundaries (one per line)
              <textarea
                name="outScope"
                value={formData.outScope}
                onChange={handleChange}
              />
            </label>
            <label className="f">
              Start date
              <input
                type="date"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required
              />
            </label>
            <label className="f">
              Deadline (contract)
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </label>
            <label className="f">
              Approved budget (PKR)
              <input
                type="number"
                min="1"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </label>
            <label className="f">
              Management reserve (PKR)
              <input
                type="number"
                min="0"
                name="reserve"
                value={formData.reserve}
                onChange={handleChange}
              />
            </label>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" type="submit">
                Save charter
              </button>
            </div>
          </form>
        </section>

        <div>
          <section className="card">
            <h3>
              Budget & deadline baseline <span>live</span>
            </h3>
            <div className="kv">
              <b>Approved budget</b>
              <span className="mono">{money(C.budget)}</span>
              <b>Approved changes</b>
              <span className="mono">+{money(derived.addCost)}</span>
              <b>Effective budget</b>
              <span className="mono" style={{ color: 'var(--teal-d)', fontWeight: 700 }}>
                {money(derived.effBudget)}
              </span>
              <b>Contract deadline</b>
              <span className="mono">{fmt(C.deadline)}</span>
              <b>Effective deadline</b>
              <span className="mono">
                {fmt(derived.effDeadline)} (+{derived.addDays_} d)
              </span>
              <b>Duration</b>
              <span className="mono">{durationWeeks} weeks</span>
            </div>
          </section>

          <section className="card">
            <h3>
              Stakeholders <span>{(data.stakeholders || []).length}</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Interest</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(data.stakeholders || []).map((s, i) => (
                    <tr key={s.id || i}>
                      <td>{s.name}</td>
                      <td className="muted">{s.role}</td>
                      <td>
                        <select
                          value={s.interest}
                          onChange={(e) => onUpdateStakeholder(i, 'interest', e.target.value)}
                        >
                          {['High', 'Medium', 'Low'].map((v) => (
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
                            onDeleteStakeholder(i);
                            showToast('Removed.');
                          }}
                          title="Delete stakeholder"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form className="inline" onSubmit={handleAddStake}>
              <label className="f">
                Name
                <input
                  value={newStake.name}
                  onChange={(e) => setNewStake({ ...newStake, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah"
                />
              </label>
              <label className="f">
                Role
                <input
                  value={newStake.role}
                  onChange={(e) => setNewStake({ ...newStake, role: e.target.value })}
                  placeholder="e.g. Clinical Director"
                />
              </label>
              <label className="f" style={{ flex: '0 0 100px' }}>
                Interest
                <select
                  value={newStake.interest}
                  onChange={(e) => setNewStake({ ...newStake, interest: e.target.value })}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <button className="btn" type="submit">
                Add
              </button>
            </form>
          </section>
        </div>
      </div>

      <section className="card">
        <h3>
          Objectives & boundaries <span>read-out</span>
        </h3>
        <p style={{ margin: '0 0 12px', lineHeight: 1.6 }}>{C.objectives}</p>
        <div className="two">
          <div>
            <b className="mono" style={{ fontSize: '12px', color: 'var(--teal)' }}>
              IN SCOPE
            </b>
            <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
              {inScopeItems.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <b className="mono" style={{ fontSize: '12px', color: 'var(--coral)' }}>
              OUT OF SCOPE
            </b>
            <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
              {outScopeItems.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
