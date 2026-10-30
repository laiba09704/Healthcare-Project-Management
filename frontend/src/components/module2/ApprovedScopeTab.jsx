import React from 'react';
import { fmt, statusTone, prioTone, buildCodeMap, getScopeInfo } from '../../data/initialData';
import ScopeKpiRow from './ScopeKpiRow';

export default function ApprovedScopeTab({ data, derived }) {
  const reqs = data.reqs || [];
  const wbs = data.wbs || [];
  const changes = data.changes || [];
  const codes = buildCodeMap(wbs);

  // Sorted by rank
  const sortedReqs = [...reqs].sort((a, b) => a.rank - b.rank);
  const approvedReqs = sortedReqs.filter((r) => r.status === 'Approved');
  const outsideReqs = sortedReqs.filter((r) => r.status !== 'Approved');

  const linkedWpList = wbs.filter((w) => w.req);

  return (
    <>
      <ScopeKpiRow data={data} derived={derived} />

      <div className="two">
        <section className="card">
          <h3>
            Approved scope baseline <span>{approvedReqs.length} requirements</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>ID</th>
                  <th>Requirement</th>
                  <th>MoSCoW</th>
                  <th>WBS</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {approvedReqs.map((r) => {
                  const wpCount = wbs.filter((w) => w.req === r.id).length;
                  return (
                    <tr key={r.id}>
                      <td className="mono">{r.rank}</td>
                      <td className="mono">{r.id}</td>
                      <td>{r.title}</td>
                      <td>
                        <span className={`badge ${prioTone[r.prio]}`}>{r.prio}</span>
                      </td>
                      <td className="mono">{wpCount} WP</td>
                      <td className="muted" style={{ fontSize: '12px' }}>
                        {fmt(r.approvedOn)}
                        <br />
                        {r.approvedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h3>
            Outside baseline <span>{outsideReqs.length} requirements</span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Requirement</th>
                  <th>Status</th>
                  <th>Next step</th>
                </tr>
              </thead>
              <tbody>
                {outsideReqs.length > 0 ? (
                  outsideReqs.map((r) => {
                    const pend = changes.find(
                      (c) => c.req === r.id && c.decision === 'Pending'
                    );
                    const nextStep = pend
                      ? `Awaiting ${pend.id} decision`
                      : r.ac
                      ? 'Ready for approval'
                      : 'Missing acceptance criteria';

                    return (
                      <tr key={r.id}>
                        <td className="mono">{r.id}</td>
                        <td>{r.title}</td>
                        <td>
                          <span className={`badge ${statusTone[r.status]}`}>{r.status}</span>
                        </td>
                        <td className="muted" style={{ fontSize: '12.5px' }}>
                          {nextStep}
                        </td>
                      </tr>
                    );
                  })
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
          Scope gate check <span>work packages linked to requirements</span>
        </h3>
        {linkedWpList.length > 0 ? (
          linkedWpList.map((w) => {
            const scope = getScopeInfo(w.id, wbs, reqs);
            return (
              <div className="gate" key={w.id}>
                <div>
                  <span className="code">{codes[w.id]}</span> &nbsp;
                  <b>{w.name}</b>{' '}
                  <span className="muted mono" style={{ fontSize: '12px' }}>
                    → {w.req}
                  </span>
                </div>
                {scope.ok ? (
                  <span className="badge ok">PASS · in baseline</span>
                ) : (
                  <span className="badge bad">BLOCKED · {scope.reason}</span>
                )}
              </div>
            );
          })
        ) : (
          <span className="muted">No linked work packages.</span>
        )}
      </section>
    </>
  );
}
