import React, { useState } from 'react';
import { buildCodeMap, getScopeInfo, nextId } from '../../data/initialData';
import ScopeKpiRow from './ScopeKpiRow';

export default function WbsTab({
  data,
  derived,
  onUpdateWbs,
  onAddWbs,
  onDeleteWbs,
  showToast
}) {
  const wbs = data.wbs || [];
  const reqs = data.reqs || [];
  const codes = buildCodeMap(wbs);

  const inBaselineCount = wbs.filter((w) => getScopeInfo(w.id, wbs, reqs).ok).length;

  const [newWp, setNewWp] = useState({
    name: '',
    parent: '',
    req: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const name = newWp.name.trim();
    if (!name) {
      showToast('Work package name is required.', 'err');
      return;
    }
    const req = newWp.req || '';
    if (req) {
      const r = reqs.find((x) => x.id === req);
      if (!r) {
        showToast('Unknown requirement.', 'err');
        return;
      }
      if (r.status !== 'Approved') {
        showToast(`${req} is ${r.status}. Only approved requirements can be placed in the scope.`, 'err');
        return;
      }
    }

    const id = nextId('W', wbs);
    onAddWbs({
      id,
      name,
      parent: newWp.parent || null,
      req
    });

    setNewWp({ name: '', parent: '', req: '' });
    showToast('Work package added to the WBS.');
  };

  const handleRequirementChange = (id, reqId) => {
    if (reqId) {
      const r = reqs.find((x) => x.id === reqId);
      if (!r || r.status !== 'Approved') {
        showToast(`${r ? r.id : reqId} is not approved. Only approved requirements can be placed in the scope.`, 'err');
        return;
      }
    }
    onUpdateWbs(id, 'req', reqId);
  };

  // Recursive tree renderer
  const renderTree = (parentId = null, depth = 0) => {
    const children = wbs.filter((w) => (w.parent || null) === parentId);
    return children.map((w) => {
      const scope = getScopeInfo(w.id, wbs, reqs);
      return (
        <React.Fragment key={w.id}>
          <div className="wnode" style={{ marginLeft: `${depth * 24}px` }}>
            <span className="code">{codes[w.id]}</span>
            <input
              value={w.name}
              onChange={(e) => onUpdateWbs(w.id, 'name', e.target.value)}
              style={{ flex: 1, minWidth: '180px', fontWeight: 600 }}
            />
            <select
              value={w.req || ''}
              onChange={(e) => handleRequirementChange(w.id, e.target.value)}
              style={{ maxWidth: '300px' }}
            >
              <option value="">— deliverable (no requirement) —</option>
              {reqs.map((r) => {
                const isAllowed = r.status === 'Approved' || r.id === w.req;
                return (
                  <option key={r.id} value={r.id} disabled={!isAllowed}>
                    {r.id} · {r.title} [{r.status}]
                  </option>
                );
              })}
            </select>
            {scope.ok ? (
              <span className="badge ok">In baseline</span>
            ) : (
              <span className="badge bad">Excluded · {scope.reason}</span>
            )}
            <button
              className="x"
              onClick={() => {
                onDeleteWbs(w.id);
                showToast('Removed.');
              }}
              title="Remove work package"
            >
              ×
            </button>
          </div>
          {renderTree(w.id, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <ScopeKpiRow data={data} derived={derived} />

      <div className="two">
        <section className="card">
          <h3>
            Work breakdown structure{' '}
            <span>
              {wbs.length} items · {inBaselineCount} in baseline
            </span>
          </h3>
          <p className="muted" style={{ margin: '0 0 10px', fontSize: '12.5px' }}>
            Each work package can be tied to one requirement. Only approved requirements can be
            selected; the scope gate excludes any item whose requirement is not approved, along with
            its children.
          </p>

          <div style={{ marginTop: '12px' }}>{renderTree(null, 0)}</div>
        </section>

        <section className="card">
          <h3>
            Add work package <span>hierarchy</span>
          </h3>
          <form className="grid" onSubmit={handleAddSubmit}>
            <label className="f full">
              Name
              <input
                value={newWp.name}
                onChange={(e) => setNewWp({ ...newWp, name: e.target.value })}
                placeholder="e.g. Patient notification service"
              />
            </label>
            <label className="f">
              Parent
              <select
                value={newWp.parent}
                onChange={(e) => setNewWp({ ...newWp, parent: e.target.value })}
              >
                <option value="">— root —</option>
                {wbs.map((w) => (
                  <option key={w.id} value={w.id}>
                    {codes[w.id]} · {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="f">
              Requirement (approved only)
              <select
                value={newWp.req}
                onChange={(e) => setNewWp({ ...newWp, req: e.target.value })}
              >
                <option value="">— deliverable (no requirement) —</option>
                {reqs.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.status !== 'Approved'}>
                    {r.id} · {r.title} [{r.status}]
                  </option>
                ))}
              </select>
            </label>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" type="submit">
                Add to WBS
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
