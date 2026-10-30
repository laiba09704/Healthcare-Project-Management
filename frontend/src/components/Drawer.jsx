import React, { useEffect } from 'react';
import { MODS } from '../data/initialData';

export default function Drawer({ isOpen, onClose, currentView, onSelectModule }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <aside className={`drawer ${isOpen ? 'open' : ''}`} id="drawer">
        <div className="dh">Project modules · 6</div>
        <nav className="dnav" id="dnav">
          {MODS.map((m) => {
            const isCurrent = m.k && currentView === m.k;
            return (
              <button
                key={m.n}
                onClick={() => {
                  onSelectModule(m);
                  onClose();
                }}
                className={isCurrent ? 'cur' : ''}
              >
                <span className="num">{m.n}</span>
                <div className="t">{m.t}</div>
              </button>
            );
          })}
        </nav>
        <div className="dfoot">Smart Healthcare Project Management System</div>
      </aside>

      <div
        className={`scrim ${isOpen ? 'show' : ''}`}
        id="scrim"
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  );
}
