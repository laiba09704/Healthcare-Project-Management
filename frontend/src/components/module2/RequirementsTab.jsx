import React, { useState } from 'react';
import { fmt, statusTone, prioTone, nextId } from '../../data/initialData';
import ScopeKpiRow from './ScopeKpiRow';

export default function RequirementsTab({
  data,
  derived,
  onUpdateRequirement,
  onApproveRequirement,
  onSetRequirementStatus,
  onReorderRequirement,
  onAddRequirement,
  onDeleteRequirement,
  showToast
}) {
  const reqs = data.reqs || [];
  const changes = data.changes || [];
  const wbs = data.wbs || [];

  // Sort requirements by rank
  const sortedReqs = [...reqs].sort((a, b) => a.rank - b.rank);
  const approvedCount = reqs.filter((r) => r.status === 'Approved').length;
  const outsideCount = reqs.length - approvedCount;

  // New requirement form state
  const [newReq, setNewReq] = useState({
    title: '',
    desc: '',
    ac: '',
    prio: 'Should',
    source: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const title = newReq.title.trim();
    if (!title) {
      showToast('Requirement title is required.', 'err');
      return;
    }

    const nextRank = Math.max(0, ...reqs.map((r) => r.rank || 0)) + 1;
    const id = nextId('R', reqs);

    onAddRequirement({
      id,
      title,
      desc: newReq.desc.trim() || '—',
      prio: newReq.prio,
      rank: nextRank,
      status: 'Proposed',
      source: newReq.source.trim() || 'Project team',
      ac: newReq.ac.trim(),
      approvedOn: '',
      approvedBy: ''
    });

    setNewReq({
      title: '',
      desc: '',
      ac: '',
      prio: 'Should',
      source: ''
    });
    showToast('Requirement logged as Proposed. Approve it to bring it into the baseline.');
  };

  const handleApprove = (id) => {
    const r = reqs.find((x) => x.id === id);
    if (!r) return;
    const pend = changes.find((c) => c.req === id && c.decision === 'Pending');
    if (pend) {
      showToast(`${id} is tied to ${pend.id}. Decide that change request instead.`, 'err');
      return;
    }
    if (!String(r.ac || '').trim()) {
      showToast(`Add acceptance criteria before approving ${id}.`, 'err');
      return;
    }
    onApproveRequirement(id);
    showToast(`${id} approved into the scope baseline.`);
  };

  const handleDelete = (id) => {
    if (changes.some((c) => c.req === id && c.decision !== 'Rejected')) {
      showToast('Requirement is referenced by a change request. Reject that change first.', 'err');
      return;
    }
    if (wbs.some((w) => w.req === id)) {
      showToast('Requirement is linked to WBS items. Unlink them first.', 'err');
      return;
    }
    onDeleteRequirement(id);
    showToast('Removed.');
  };

  return (
    <>
      <ScopeKpiRow data={data} derived={derived} />

      <section className="card">
        <h3>
          Requirements register{' '}
          <span>
            {approvedCount} approved · {outsideCount} outside baseline
          </span>
        </h3>
        <p className="muted" style={{ margin: '0 0 12px', fontSize: '12.5px' }}>
          Requirements are ranked by priority (use ▲ ▼). A requirement joins the approved scope only
          after acceptance criteria are written and it is approved. Requirements tied to a pending
          change are decided through that change.
        </p>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>ID</th>
                <th>Requirement</th>
                <th>MoSCoW</th>
                <th>Status</th>
                <th>Actions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedReqs.map((r, i) => {
                const pend = changes.find((c) => c.req === r.id && c.decision === 'Pending');
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div className="rk">{i + 1}</div>
                        <button
                          className="x"
                          onClick={() => onReorderRequirement(r.id, -1)}
                          title="Raise priority"
                          disabled={i === 0}
                          style={i === 0 ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                        >
                          ▲
                        </button>
                        <button
                          className="x"
                          onClick={() => onReorderRequirement(r.id, 1)}
                          title="Lower priority"
                          disabled={i === sortedReqs.length - 1}
                          style={
                            i === sortedReqs.length - 1
                              ? { opacity: 0.3, cursor: 'not-allowed' }
                              : {}
                          }
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="mono">{r.id}</td>
                    <td style={{ minWidth: '300px' }}>
                      <input
                        value={r.title}
                        onChange={(e) => onUpdateRequirement(r.id, 'title', e.target.value)}
                        style={{ width: '100%', fontWeight: 600, marginBottom: '4px' }}
                      />
                      <input
                        value={r.desc}
                        onChange={(e) => onUpdateRequirement(r.id, 'desc', e.target.value)}
                        style={{ width: '100%', fontSize: '12px', marginBottom: '4px' }}
                      />
                      <input
                        value={r.ac}
                        onChange={(e) => onUpdateRequirement(r.id, 'ac', e.target.value)}
                        placeholder="Acceptance criteria"
                        style={{ width: '100%', fontSize: '12px' }}
                      />
                    </td>
                    <td>
                      <select
                        value={r.prio}
                        onChange={(e) => onUpdateRequirement(r.id, 'prio', e.target.value)}
                      >
                        {['Must', 'Should', 'Could'].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <div style={{ marginTop: '4px' }}>
                        <span className={`badge ${prioTone[r.prio]}`}>{r.prio}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusTone[r.status]}`}>{r.status}</span>
                      {r.approvedOn && (
                        <div className="muted" style={{ fontSize: '11.5px', marginTop: '4px' }}>
                          {fmt(r.approvedOn)}
                          <br />
                          {r.approvedBy}
                        </div>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {r.status !== 'Approved' && (
                        <>
                          {pend ? (
                            <span className="muted" style={{ fontSize: '12px' }}>
                              Decided via {pend.id}
                            </span>
                          ) : (
                            <button
                              className="btn sm primary"
                              onClick={() => handleApprove(r.id)}
                            >
                              Approve
                            </button>
                          )}{' '}
                        </>
                      )}
                      {r.status === 'Proposed' && !pend && (
                        <>
                          <button
                            className="btn sm"
                            onClick={() => onSetRequirementStatus(r.id, 'Deferred')}
                          >
                            Defer
                          </button>{' '}
                          <button
                            className="btn sm"
                            onClick={() => onSetRequirementStatus(r.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(r.status === 'Deferred' || r.status === 'Rejected') && !pend && (
                        <button
                          className="btn sm"
                          onClick={() => onSetRequirementStatus(r.id, 'Proposed')}
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="x"
                        onClick={() => handleDelete(r.id)}
                        title="Remove requirement"
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

        <form className="inline" onSubmit={handleAddSubmit}>
          <label className="f" style={{ flex: 2 }}>
            Requirement title
            <input
              value={newReq.title}
              onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
              placeholder="e.g. Telemedicine e-prescription"
            />
          </label>
          <label className="f" style={{ flex: 2 }}>
            Description
            <input
              value={newReq.desc}
              onChange={(e) => setNewReq({ ...newReq, desc: e.target.value })}
              placeholder="Summary of requirement"
            />
          </label>
          <label className="f" style={{ flex: 2 }}>
            Acceptance criteria
            <input
              value={newReq.ac}
              onChange={(e) => setNewReq({ ...newReq, ac: e.target.value })}
              placeholder="Conditions for acceptance"
            />
          </label>
          <label className="f">
            Priority
            <select
              value={newReq.prio}
              onChange={(e) => setNewReq({ ...newReq, prio: e.target.value })}
            >
              <option value="Must">Must</option>
              <option value="Should">Should</option>
              <option value="Could">Could</option>
            </select>
          </label>
          <label className="f">
            Source
            <input
              value={newReq.source}
              onChange={(e) => setNewReq({ ...newReq, source: e.target.value })}
              placeholder="e.g. CMO office"
            />
          </label>
          <button className="btn" type="submit">
            Log requirement
          </button>
        </form>
      </section>
    </>
  );
}
