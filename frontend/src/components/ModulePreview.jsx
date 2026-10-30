import React from 'react';
import { MODS } from '../data/initialData';

export default function ModulePreview({ moduleNum, onGoHome }) {
  const m = MODS.find((x) => x.n === moduleNum) || {
    n: moduleNum,
    t: 'Project Module',
    s: 'Module details will appear here.'
  };

  return (
    <section className="card ph">
      <div className="big">{m.n}</div>
      <h2 style={{ marginTop: '8px' }}>{m.t}</h2>
      <p className="muted" style={{ maxWidth: '520px', margin: '10px auto 18px' }}>
        {m.s}. This module is planned for the next phase of the project. Module 01 is fully implemented.
      </p>
      <button className="btn primary" onClick={onGoHome}>
        Back to dashboard
      </button>
    </section>
  );
}
