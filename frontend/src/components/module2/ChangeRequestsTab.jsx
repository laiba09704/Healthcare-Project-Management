import React, { useState } from 'react';
import { money, fmt, statusTone, addDays, todayISO, nextId } from '../../data/initialData';
import ScopeKpiRow from './ScopeKpiRow';

export default function ChangeRequestsTab({
  data,
  derived,
  onDecideChange,
  onAddChange,
  onDeleteChange,
  showToast
}) {
  const changes = data.changes || [];
  const reqs = data.reqs || [];

  const approvedChanges = changes.filter((c) => c.decision === 'Approved');
  const pendingChanges = changes.filter((c) => c.decision === 'Pending');

  const pendCost = pendingChanges.reduce((s, c) => s + +c.cost, 0);
  const pendDays = pendingChanges.reduce((s, c) => s + +c.days, 0);

  const approvedCost = approvedChanges.reduce((s, c) => s + +c.cost, 0);
  const approvedDays = approvedChanges.reduce((s, c) => s + +c.days, 0);
  const approvedReqsList = approvedChanges
    .filter((c) => c.req)
    .map((c) => c.req)
    .join(', ');

  // Form state
  const [form, setForm] = useState({
    title: '',
    just: '',
    by: '',
    req: '',
    cost: 0,
    days: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      showToast('Change title is required.', 'err');
      return;
    }
    const just = form.just.trim();
    if (!just) {
      showToast('Justification is required.', 'err');
      return;
    }
    const cost = parseFloat(form.cost);
    const days = parseInt(form.days, 10);
    if (isNaN(cost) || cost < 0) {
      showToast('Cost impact must be zero or more.', 'err');
      return;
    }
    if (isNaN(days) || days < 0) {
      showToast('Schedule impact must be zero or more days.', 'err');
      return;
    }

    const id = nextId('CR-', changes.map((c) => ({ id: c.id.replace('CR-', 'C') }))).replace('C', 'CR-');

    onAddChange({
      id,
      title,
      just,
      requestedBy: form.by.trim() || 'Project team',
      submitted: todayISO(),
      cost,
      days,
      decision: 'Pending',
      req: form.req || ''
    });

    setForm({
      title: '',
      just: '',
      by: '',
      req: '',
      cost: 0,
      days: 0
    });
    showToast('Change request submitted as Pending.');
  };

  const handleDecide = (id, dec) => {
    const c = changes.find((x) => x.id === id);
    if (!c) return;
    if (dec === 'Approved') {
      if (!String(c.just || '').trim()) {
        showToast('Justification is required before approval.', 'err');
        return;
      }
      if (!(c.cost >= 0) || !(c.days >= 0)) {
        showToast('Cost and schedule impact must be recorded.', 'err');
        return;
      }
      if (c.req) {
        const r = reqs.find((x) => x.id === c.req);
        if (r && !String(r.ac || '').trim()) {
          showToast(`Requirement ${r.id} needs acceptance criteria before the change can be approved.`, 'err');
          return;
        }
      }
    }
    onDecideChange(id, dec);
    showToast(`${c.id} ${dec.toLowerCase()}.`);
  };

  const handleDelete = (id) => {
    const c = changes.find((x) => x.id === id);
    if (c && c.decision === 'Approved') {
      showToast('Revert the approval before deleting this change.', 'err');
      return;
    }
    onDeleteChange(id);
    showToast('Removed.');
  };

  return (
    <>
      <ScopeKpiRow data={data} derived={derived} />

      <div className="two">
        <section className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>
            Change requests <span>scope · schedule · budget</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Proposed change</th>
                  <th>Requirement</th>
                  <th>Cost impact</th>
                  <th>Schedule impact</th>
                  <th>Approval</th>
                  <th>Decision</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => {
                  const r = c.req ? reqs.find((x) => x.id === c.req) : null;
                  return (
                    <tr key={c.id}>
                      <td className="mono">{c.id}</td>
                      <td style={{ minWidth: '260px' }}>
                        <b>{c.title}</b>
                        <div className="muted" style={{ fontSize: '12px' }}>
                          {c.just}
                        </div>
                        <div className="muted" style={{ fontSize: '11.5px' }}>
                          By {c.requestedBy || '—'} · {fmt(c.submitted)}
                        </div>
                      </td>
                      <td>
                        {r ? (
                          <>
                            <span className="mono">{r.id}</span>{' '}
                            <span className={`badge ${statusTone[r.status]}`}>{r.status}</span>
                          </>
                        ) : (
                          <span className="muted">none</span>
                        )}
                      </td>
                      <td className="mono">{money(c.cost)}</td>
                      <td className="mono">+{c.days} d</td>
                      <td>
                        <span
                          className={`badge ${
                            c.decision === 'Approved'
                              ? 'ok'
                              : c.decision === 'Rejected'
                              ? 'bad'
                              : 'warn'
                          }`}
                        >
                          {c.decision}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {c.decision === 'Pending' && (
                          <>
                            <button
                              className="btn sm primary"
                              onClick={() => handleDecide(c.id, 'Approved')}
                            >
                              Approve
                            </button>{' '}
                            <button
                              className="btn sm"
                              onClick={() => handleDecide(c.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {c.decision === 'Approved' && (
                          <button
                            className="btn sm"
                            onClick={() => handleDecide(c.id, 'Pending')}
                          >
                            Revert
                          </button>
                        )}
                        {c.decision === 'Rejected' && (
                          <button
                            className="btn sm"
                            onClick={() => handleDecide(c.id, 'Pending')}
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="x"
                          onClick={() => handleDelete(c.id)}
                          title="Delete change request"
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
            onSubmit={handleSubmit}
            style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px dashed var(--line)'
            }}
          >
            <label className="f full">
              Change title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Automated SMS notification service"
              />
            </label>
            <label className="f full">
              Justification
              <textarea
                value={form.just}
                onChange={(e) => setForm({ ...form, just: e.target.value })}
                placeholder="Why is this change needed and what does it solve?"
              />
            </label>
            <label className="f">
              Requested by
              <input
                value={form.by}
                onChange={(e) => setForm({ ...form, by: e.target.value })}
                placeholder="e.g. Hospital IT heads"
              />
            </label>
            <label className="f">
              Requirement affected
              <select
                value={form.req}
                onChange={(e) => setForm({ ...form, req: e.target.value })}
              >
                <option value="">— none —</option>
                {reqs
                  .filter((r) => r.status !== 'Approved')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.title}
                    </option>
                  ))}
              </select>
            </label>
            <label className="f">
              Cost impact (PKR)
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </label>
            <label className="f">
              Schedule impact (days)
              <input
                type="number"
                min="0"
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
              />
            </label>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" type="submit">
                Submit change request
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h3>
            Approved changes <span>{approvedChanges.length} in baseline</span>
          </h3>
          <div className="kv">
            <b>Cost added</b>
            <span className="mono">+{money(approvedCost)}</span>
            <b>Schedule added</b>
            <span className="mono">+{approvedDays} days</span>
            <b>Requirements added</b>
            <span>{approvedReqsList || 'none'}</span>
          </div>
          <p className="muted" style={{ fontSize: '12.5px', margin: '12px 0 0' }}>
            Approved changes flow into Module 01: effective budget and deadline update automatically.
          </p>
        </section>

        <section className="card">
          <h3>
            If all pending changes are approved <span>what-if</span>
          </h3>
          <div className="kv">
            <b>Pending cost</b>
            <span className="mono">+{money(pendCost)}</span>
            <b>Pending schedule</b>
            <span className="mono">+{pendDays} days</span>
            <b>Effective budget</b>
            <span className="mono">{money(derived.effBudget + pendCost)}</span>
            <b>Effective deadline</b>
            <span className="mono">
              {fmt(addDays(data.charter.deadline, derived.addDays_ + pendDays))}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
