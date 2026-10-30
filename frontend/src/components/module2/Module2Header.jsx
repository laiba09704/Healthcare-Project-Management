import React from 'react';
import { SUBS2 } from '../../data/initialData';

export default function Module2Header({ currentSub2, onSelectSub2, onGoHome }) {
  return (
    <>
      <div className="mhead">
        <span className="num">02</span>
        <h2>Scope Management & WBS</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Manage requirements, build the hierarchical WBS, record change requests with their impact, and
        keep unapproved requirements out of the approved scope.
      </p>

      <div className="tabs">
        {SUBS2.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${currentSub2 === key ? 'on' : ''}`}
            onClick={() => onSelectSub2(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
