import React from 'react';
import { MODS, fmt, money, ragLabel } from '../data/initialData';

export default function HomeView({ data, derived, onOpenModule, onPreviewModule }) {
  const pendingCount = (data.changes || []).filter((c) => c.decision === 'Pending').length;
  const last3Logs = [...(data.log || [])].slice(-3).reverse();

  return (
    <>
      <section className="hero">
        <div className="eyebrow">Software Project Management System</div>
        <h1>{data.charter.name}</h1>
        <p>
          {data.charter.client} · Sponsor: {data.charter.sponsor}. Delivering five hospital modules inside 16 weeks.
        </p>
        <div style={{ height: '32px', marginTop: '14px' }} aria-hidden="true" />
        <svg viewBox="0 0 600 90" preserveAspectRatio="none">
          <path
            d="M0 50 H160 l14 -22 l12 44 l12 -36 l10 14 H330 l14 -22 l12 44 l12 -36 l10 14 H600"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
          />
        </svg>
      </section>

      <div className="stats">
        <div className={`stat ${derived.addCost ? 'warn' : ''}`}>
          <small>Effective budget</small>
          <b>{money(derived.effBudget)}</b>
          <span>
            {derived.addCost ? `incl. ${money(derived.addCost)} approved changes` : 'approved baseline'}
          </span>
        </div>

        <div className={`stat ${derived.daysLeft < 0 ? 'bad' : ''}`}>
          <small>Deadline</small>
          <b>{fmt(derived.effDeadline)}</b>
          <span>
            {derived.daysLeft >= 0
              ? `${derived.daysLeft} days remaining`
              : `Overdue by ${Math.abs(derived.daysLeft)} days`}
          </span>
        </div>

        <div className="stat">
          <small>Requirements approved</small>
          <b>
            {derived.reqDone} / {(data.reqs || []).length}
          </b>
          <span>scope baseline</span>
        </div>

        <div className={`stat ${pendingCount > 0 ? 'warn' : ''}`}>
          <small>Pending change requests</small>
          <b>{pendingCount}</b>
          <span>awaiting sponsor decision</span>
        </div>
      </div>

      <div className="sec">Project modules</div>

      <div className="mgrid">
        {MODS.map((m) => (
          <div key={m.n} className={`mcard ${m.live ? 'live' : 'off'}`}>
            <div className="top">
              <span className="num">{m.n}</span>
              {m.live ? (
                <span className="badge ok">Live</span>
              ) : (
                <span className="badge">Next phase</span>
              )}
            </div>
            <h4>{m.t}</h4>
            <span className="muted" style={{ fontSize: '13px' }}>
              {m.s}
            </span>
            {m.k ? (
              <button
                className="btn primary"
                onClick={() => onOpenModule(m.k)}
              >
                Open module →
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => onPreviewModule(m.n)}
              >
                Preview
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="two" style={{ marginTop: '18px' }}>
        <section className="card">
          <h3>
            Upcoming milestones <span>{(data.milestones || []).length}</span>
          </h3>
          <div className="lst">
            {(data.milestones || []).map((m, idx) => {
              const statusClass =
                m.status === 'Done' ? 'ok' : m.status === 'In progress' ? 'warn' : '';
              return (
                <div className="logi" key={idx}>
                  <b>{m.name}</b>
                  <br />
                  <small>{fmt(m.date)}</small>{' '}
                  <span className={`badge ${statusClass}`}>{m.status}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h3>
            Latest status updates <span>log</span>
          </h3>
          <div className="lst">
            {last3Logs.length > 0 ? (
              last3Logs.map((l, idx) => (
                <div className="logi" key={idx}>
                  <small>
                    {fmt(l.date)} ·{' '}
                    <span
                      className={`rag-${l.rag}`}
                      style={{ padding: '1px 6px', borderRadius: '6px' }}
                    >
                      {ragLabel[l.rag] || l.rag}
                    </span>{' '}
                    · {l.pct}% complete
                  </small>
                  <br />
                  {l.note}
                </div>
              ))
            ) : (
              <span className="muted">No updates yet.</span>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
