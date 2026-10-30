import React from 'react';
import { SUBS } from '../../data/initialData';

export default function Module1Header({ currentSub, onSelectSub, onGoHome }) {
  return (
    <>
      <div className="mhead">
        <span className="num">01</span>
        <h2>Project Initiation & Integration Management</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Create and manage the charter, develop the project management plan, and maintain status,
        milestones, responsibilities and closure records.
      </p>

      <div className="tabs">
        {SUBS.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${currentSub === key ? 'on' : ''}`}
            onClick={() => onSelectSub(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
