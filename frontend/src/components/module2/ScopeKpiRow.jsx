import React from 'react';
import { money, getScopeInfo } from '../../data/initialData';

export default function ScopeKpiRow({ data, derived }) {
  const reqs = data.reqs || [];
  const wbs = data.wbs || [];
  const changes = data.changes || [];

  const appr = reqs.filter((r) => r.status === 'Approved').length;
  const inS = wbs.filter((w) => getScopeInfo(w.id, wbs, reqs).ok).length;
  const ex = wbs.length - inS;
  const pend = changes.filter((c) => c.decision === 'Pending').length;

  return (
    <div className="kpi-row">
      <div className="stat">
        <small>Approved requirements</small>
        <b>
          {appr} / {reqs.length}
        </b>
        <span>in approved scope</span>
      </div>

      <div className={`stat ${ex > 0 ? 'warn' : ''}`}>
        <small>WBS items in baseline</small>
        <b>
          {inS} / {wbs.length}
        </b>
        <span>{ex > 0 ? `${ex} excluded by the scope gate` : 'all items in baseline'}</span>
      </div>

      <div className={`stat ${pend > 0 ? 'warn' : ''}`}>
        <small>Pending change requests</small>
        <b>{pend}</b>
        <span>not yet in baseline</span>
      </div>

      <div className="stat">
        <small>Approved change impact</small>
        <b>+{money(derived.addCost)}</b>
        <span>+{derived.addDays_} days schedule</span>
      </div>
    </div>
  );
}
