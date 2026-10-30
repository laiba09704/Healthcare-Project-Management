import React, { useState, useEffect } from 'react';
import { todayISO } from '../../data/initialData';

export default function ClosureTab({
  data,
  onToggleClosureItem,
  onUpdateClosureRecord,
  onFormallyCloseProject,
  onReopenProject,
  showToast
}) {
  const isClosed = data.charter.status === 'Closed';
  const doneCount = (data.closure || []).filter((c) => c.done).length;

  const [recordForm, setRecordForm] = useState({
    acceptance: data.closeRec?.acceptance || 'Pending',
    date: data.closeRec?.date || todayISO(),
    lessons: data.closeRec?.lessons || ''
  });

  useEffect(() => {
    setRecordForm({
      acceptance: data.closeRec?.acceptance || 'Pending',
      date: data.closeRec?.date || todayISO(),
      lessons: data.closeRec?.lessons || ''
    });
  }, [data.closeRec]);

  const handleSaveRecord = (e) => {
    e.preventDefault();
    onUpdateClosureRecord(recordForm);
    showToast('Closure record saved.');
  };

  const handleFormallyClose = () => {
    if (isClosed) {
      if (onReopenProject) {
        onReopenProject();
        showToast('Project status set back to Executing.');
      }
      return;
    }

    const blockers = [];
    if ((data.closure || []).some((c) => !c.done)) {
      blockers.push('complete all checklist items');
    }
    if (recordForm.acceptance !== 'Accepted') {
      blockers.push('record acceptance as "Accepted"');
    }

    if (blockers.length > 0) {
      showToast(`Cannot close: ${blockers.join(' and ')}.`, 'err');
      return;
    }

    // Save record first in case changed, then close
    onUpdateClosureRecord(recordForm);
    onFormallyCloseProject();
    showToast('Project formally closed.');
  };

  return (
    <>
      {isClosed && (
        <div
          className="banner"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <span>Project formally closed. Records are read-only in spirit: keep for audit.</span>
          {onReopenProject && (
            <button
              className="btn sm"
              type="button"
              style={{
                background: '#fff',
                borderColor: 'var(--ok)',
                color: 'var(--ok)',
                fontWeight: 600
              }}
              onClick={() => {
                onReopenProject();
                showToast('Project status set back to Executing.');
              }}
            >
              ↺ Re-open project
            </button>
          )}
        </div>
      )}

      <div className="two">
        <section className="card">
          <h3>
            Closure checklist{' '}
            <span>
              {doneCount}/{(data.closure || []).length}
            </span>
          </h3>
          {(data.closure || []).map((c, i) => (
            <label className="chk" key={i}>
              <input
                type="checkbox"
                checked={!!c.done}
                onChange={(e) => onToggleClosureItem(i, e.target.checked)}
              />
              <span>{c.t}</span>
            </label>
          ))}
        </section>

        <section className="card">
          <h3>
            Closure record <span>acceptance & lessons</span>
          </h3>
          <form className="grid" onSubmit={handleSaveRecord}>
            <label className="f">
              Acceptance
              <select
                name="acceptance"
                value={recordForm.acceptance}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, acceptance: e.target.value })
                }
              >
                {['Pending', 'Accepted', 'Conditionally accepted', 'Rejected'].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="f">
              Closure date
              <input
                type="date"
                name="date"
                value={recordForm.date}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, date: e.target.value })
                }
              />
            </label>
            <label className="f full">
              Lessons learned
              <textarea
                name="lessons"
                value={recordForm.lessons}
                onChange={(e) =>
                  setRecordForm({ ...recordForm, lessons: e.target.value })
                }
                placeholder="Key takeaways, stakeholder insights, technical learnings"
              />
            </label>
            <div
              className="full"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <button className="btn" type="submit">
                Save record
              </button>
              {isClosed ? (
                <button
                  className="btn"
                  type="button"
                  style={{
                    background: '#def2dd',
                    borderColor: 'var(--ok)',
                    color: 'var(--ok)',
                    fontWeight: 600
                  }}
                  onClick={() => {
                    if (onReopenProject) {
                      onReopenProject();
                      showToast('Project status set back to Executing.');
                    }
                  }}
                  title="Project is currently closed. Click to re-open."
                >
                  ✓ Project Closed · Click to Re-open
                </button>
              ) : (
                <button
                  className="btn primary"
                  type="button"
                  onClick={handleFormallyClose}
                >
                  Formally close project
                </button>
              )}
            </div>
          </form>
          <p className="muted" style={{ fontSize: '12.5px', margin: '12px 0 0' }}>
            {isClosed
              ? 'Project is formally closed. Click "Re-open project" if you wish to resume execution.'
              : 'Closing requires every checklist item ticked and acceptance recorded as "Accepted".'}
          </p>
        </section>
      </div>
    </>
  );
}
