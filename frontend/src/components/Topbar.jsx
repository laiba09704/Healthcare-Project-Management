import React from 'react';

export default function Topbar({ onToggleDrawer, crumbText, onGoHome }) {
  return (
    <header className="topbar">
      <button
        className="toggle"
        id="tog"
        onClick={onToggleDrawer}
        aria-label="Open modules"
        title="Toggle modules menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="brand" onClick={onGoHome} role="button" tabIndex={0}>
        <span className="cross">+</span>
        <span>SmartCare PMS</span>
      </div>

      <div className="crumb" id="crumb">
        {crumbText}
      </div>
    </header>
  );
}

