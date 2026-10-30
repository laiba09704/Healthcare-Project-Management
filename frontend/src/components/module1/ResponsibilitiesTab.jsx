import React from 'react';

export default function ResponsibilitiesTab({ data, onUpdateResponsibility }) {
  return (
    <section className="card">
      <h3>
        Responsibility assignment <span>who does what</span>
      </h3>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Assigned to</th>
              <th>Responsibilities</th>
            </tr>
          </thead>
          <tbody>
            {(data.responsibilities || []).map((r, i) => (
              <tr key={i}>
                <td>
                  <b>{r.role}</b>
                </td>
                <td>
                  <input
                    value={r.person}
                    onChange={(e) => onUpdateResponsibility(i, 'person', e.target.value)}
                    style={{ width: '200px' }}
                  />
                </td>
                <td>
                  <input
                    value={r.resp}
                    onChange={(e) => onUpdateResponsibility(i, 'resp', e.target.value)}
                    style={{ width: '100%', minWidth: '320px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: '12.5px', margin: '12px 0 0' }}>
        Edits save automatically. The team roster matches the seven-person structure in the case study.
      </p>
    </section>
  );
}
