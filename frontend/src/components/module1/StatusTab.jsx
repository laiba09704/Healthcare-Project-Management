import React, { useState } from 'react';
import { fmt, todayISO, ragLabel } from '../../data/initialData';

export default function StatusTab({
  data,
  derived,
  onUpdateMilestone,
  onAddStatusLog,
  showToast
}) {
  const [statusForm, setStatusForm] = useState({
    date: todayISO(),
    rag: 'G',
    pct: derived.pct,
    note: ''
  });

  const handlePostUpdate = (e) => {
    e.preventDefault();
    const pct = parseInt(statusForm.pct, 10);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      showToast('% complete must be between 0 and 100.', 'err');
      return;
    }

    onAddStatusLog({
      date: statusForm.date,
      rag: statusForm.rag,
      pct,
      note: statusForm.note.trim() || 'No remarks.'
    });

    setStatusForm((prev) => ({
      ...prev,
      note: '',
      date: todayISO()
    }));
    showToast('Status update posted.');
  };

  const reversedLogs = [...(data.log || [])].reverse();

  return (
    <>
      <div className="two">
        <section className="card">
          <h3>
            Milestones{' '}
            <span>
              {derived.achieved}/{(data.milestones || []).length} achieved
            </span>
          </h3>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.milestones || []).map((m, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        value={m.name}
                        onChange={(e) => onUpdateMilestone(i, 'name', e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={m.date}
                        onChange={(e) => onUpdateMilestone(i, 'date', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={m.status}
                        onChange={(e) => onUpdateMilestone(i, 'status', e.target.value)}
                      >
                        {['Not started', 'In progress', 'Done'].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <h3>
            Post status update <span>RAG reporting</span>
          </h3>
          <form className="grid" onSubmit={handlePostUpdate}>
            <label className="f">
              Status date
              <input
                type="date"
                name="date"
                value={statusForm.date}
                onChange={(e) => setStatusForm({ ...statusForm, date: e.target.value })}
                required
              />
            </label>
            <label className="f">
              RAG
              <select
                name="rag"
                value={statusForm.rag}
                onChange={(e) => setStatusForm({ ...statusForm, rag: e.target.value })}
              >
                <option value="G">Green · on track</option>
                <option value="A">Amber · at risk</option>
                <option value="R">Red · off track</option>
              </select>
            </label>
            <label className="f">
              % complete
              <input
                type="number"
                name="pct"
                min="0"
                max="100"
                value={statusForm.pct}
                onChange={(e) => setStatusForm({ ...statusForm, pct: e.target.value })}
                required
              />
            </label>
            <label className="f full">
              Note
              <textarea
                name="note"
                value={statusForm.note}
                onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                placeholder="What happened this period, blockers, decisions needed"
              />
            </label>
            <div className="full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn primary" type="submit">
                Post update
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="card">
        <h3>
          Status log <span>{(data.log || []).length} entries</span>
        </h3>
        <div className="lst">
          {reversedLogs.length > 0 ? (
            reversedLogs.map((l, i) => (
              <div className="logi" key={i}>
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
    </>
  );
}
