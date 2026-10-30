import React from 'react';
import { SUB4, money, num, getAlerts } from '../../data/initialData';

export default function Module4View({
  data,
  calc,
  sub,
  onSelectSub,
  onGoHome,
  onUpdateStatusDate,
  onUpdateActivity,
  onUpdateCrProg,
  onUpdateThreshold
}) {
  const alerts = getAlerts(calc, data);
  const T = data.thresholds || { cpi: 0.95, spi: 0.95 };
  const isBudgetOk = Math.round(calc.planCost) === Math.round(calc.effBudget);

  const statusDateBar = (
    <div className="inline" style={{ margin: '0 0 14px', padding: 0, border: 0 }}>
      <label className="f">
        Status date (drives EV/PV and delays)
        <input
          type="date"
          value={data.statusDate}
          onChange={(e) => onUpdateStatusDate(e.target.value)}
        />
      </label>
    </div>
  );

  // SVG S-Curve points calculation
  const renderSCurve = () => {
    const W = 900;
    const H = 220;
    const PL = 52;
    const PB = 28;
    const maxT = Math.max(calc.deadline, calc.fc.end, 1) + 4;

    const scaleX = (d) => PL + (d / maxT) * (W - PL - 16);
    const scaleY = (v) => H - PB - (calc.BAC ? v / calc.BAC : 0) * (H - PB - 16);

    const pts = [];
    for (let d = 0; d <= maxT; d++) {
      let pv = 0;
      calc.rows.forEach((r) => {
        const dur = r.EF - r.ES || 1;
        pv += r.budget * Math.min(1, Math.max(0, (d - r.ES) / dur));
      });
      pts.push(`${scaleX(d).toFixed(1)},${scaleY(pv).toFixed(1)}`);
    }

    const dl = scaleX(calc.deadline);
    const sx = scaleX(calc.sd);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="scurve" role="img" aria-label="PV and EV S-curve">
        <line x1={PL} x2={W - 16} y1={scaleY(0)} y2={scaleY(0)} stroke="var(--line)" />
        <line
          x1={PL}
          x2={W - 16}
          y1={scaleY(calc.BAC)}
          y2={scaleY(calc.BAC)}
          stroke="var(--line)"
          strokeDasharray="4 4"
        />
        <text
          x={PL - 8}
          y={scaleY(calc.BAC) + 4}
          fill="var(--mute)"
          fontSize="10"
          textAnchor="end"
          fontFamily="IBM Plex Mono, monospace"
        >
          BAC
        </text>

        <polyline points={pts.join(' ')} fill="none" stroke="var(--teal)" strokeWidth="2.2" />

        <line
          x1={dl}
          x2={dl}
          y1={10}
          y2={H - PB}
          stroke="var(--coral)"
          strokeDasharray="5 4"
        />
        <line x1={sx} x2={sx} y1={10} y2={H - PB} stroke="var(--ok)" strokeWidth="1.5" />

        <circle cx={sx} cy={scaleY(calc.PV)} r="5" fill="var(--teal)" />
        <circle cx={sx} cy={scaleY(calc.EV)} r="5" fill="var(--ok)" />

        <text
          x={sx + 9}
          y={scaleY(calc.EV) + 4}
          fill="var(--ok)"
          fontSize="11"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          EV {money(calc.EV)}
        </text>
        <text
          x={sx + 9}
          y={scaleY(calc.PV) - 7}
          fill="var(--teal)"
          fontSize="11"
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          PV {money(calc.PV)}
        </text>
        <text
          x={dl - 6}
          y={22}
          fill="var(--coral)"
          fontSize="10"
          textAnchor="end"
          fontFamily="IBM Plex Mono, monospace"
        >
          deadline day {calc.deadline}
        </text>
      </svg>
    );
  };

  return (
    <>
      <div className="mhead">
        <span className="num">04</span>
        <h2>Cost Management & Earned Value</h2>
        <button className="back" onClick={onGoHome}>
          ← Back to dashboard
        </button>
      </div>

      <p className="muted" style={{ margin: '8px 0 0' }}>
        Estimate activity costs, track actual spend and earned value, and read CPI, SPI, EAC and VAC.
        Warnings appear when performance crosses the thresholds.
      </p>

      <div className="tabs">
        {SUB4.map(([key, label]) => (
          <button
            key={key}
            className={`tab ${sub === key ? 'on' : ''}`}
            onClick={() => onSelectSub(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 4.1 Cost Estimates */}
      {sub === 'est' && (
        <div className="two">
          <section className="card">
            <h3>
              Activity cost estimates <span>{money(calc.BAC)} BAC</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>Estimate (PKR)</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td>{r.name}</td>
                      <td>
                        {r.isCR ? (
                          <span className="mono">{num(r.budget)}</span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            value={r.budget}
                            onChange={(e) =>
                              onUpdateActivity(r.id, 'budget', parseFloat(e.target.value) || 0)
                            }
                            style={{ width: '140px' }}
                          />
                        )}
                      </td>
                      <td className="mono">
                        {(calc.BAC ? (r.budget / calc.BAC) * 100 : 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h3>
              Budget reconciliation <span>plan vs baseline</span>
            </h3>
            <div className="kv">
              <b>Activity estimates (BAC)</b>
              <span className="mono">{money(calc.BAC)}</span>
              <b>Management reserve</b>
              <span className="mono">{money(data.charter.reserve)}</span>
              <b>Planned total</b>
              <span className="mono">{money(calc.planCost)}</span>
              <b>Approved baseline</b>
              <span className="mono">{money(data.charter.budget)}</span>
              <b>Approved changes</b>
              <span className="mono">+{money(calc.crCost)}</span>
              <b>Effective budget</b>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--teal)' }}>
                {money(calc.effBudget)}
              </span>
            </div>
            <div
              className={`alert ${isBudgetOk ? 'ok' : 'bad'}`}
              style={{ marginTop: '14px' }}
            >
              {isBudgetOk
                ? 'Planned total reconciles with the effective budget.'
                : `Gap of ${money(calc.planCost - calc.effBudget)} between plan and effective budget.`}
            </div>
          </section>
        </div>
      )}

      {/* 4.2 EVM Indicators */}
      {sub === 'evm' && (
        <>
          {statusDateBar}
          <div className="kpi-row">
            <div className="stat">
              <small>PV · planned value</small>
              <b>{money(calc.PV)}</b>
              <span>budgeted work due</span>
            </div>
            <div className="stat">
              <small>EV · earned value</small>
              <b>{money(calc.EV)}</b>
              <span>budgeted work done</span>
            </div>
            <div className={`stat ${calc.AC > calc.EV ? 'bad' : ''}`}>
              <small>AC · actual cost</small>
              <b>{money(calc.AC)}</b>
              <span>spent so far</span>
            </div>
            <div className={`stat ${calc.CPI < T.cpi ? 'bad' : ''}`}>
              <small>CPI</small>
              <b>{calc.CPI.toFixed(2)}</b>
              <span>EV ÷ AC · threshold {T.cpi}</span>
            </div>
            <div className={`stat ${calc.SPI < T.spi ? 'bad' : ''}`}>
              <small>SPI</small>
              <b>{calc.SPI.toFixed(2)}</b>
              <span>EV ÷ PV · threshold {T.spi}</span>
            </div>
            <div className="stat">
              <small>EAC</small>
              <b>{money(calc.EAC)}</b>
              <span>BAC ÷ CPI</span>
            </div>
            <div className={`stat ${calc.VAC < 0 ? 'bad' : ''}`}>
              <small>VAC</small>
              <b>{money(calc.VAC)}</b>
              <span>BAC − EAC</span>
            </div>
            <div className={`stat ${calc.CV < 0 || calc.SV < 0 ? 'bad' : ''}`}>
              <small>CV / SV</small>
              <b>
                {num(calc.CV)} / {num(calc.SV)}
              </b>
              <span>cost / schedule variance</span>
            </div>
          </div>

          <section className="card">
            <h3>
              Earned value per activity <span>status day {calc.sd}</span>
            </h3>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>BAC</th>
                    <th>PV</th>
                    <th>EV</th>
                    <th>AC (enter)</th>
                    <th>CV</th>
                    <th>SV</th>
                    <th>CPI</th>
                    <th>SPI</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((r) => {
                    const cv = r.ev - r.ac;
                    const sv = r.ev - r.pv;
                    const isOverrun = r.cpi !== null && r.cpi < T.cpi;
                    const isBehind = r.spi !== null && r.spi < T.spi;

                    return (
                      <tr key={r.id}>
                        <td className="mono">{r.id}</td>
                        <td>{r.name}</td>
                        <td className="mono">{num(r.budget)}</td>
                        <td className="mono">{num(r.pv)}</td>
                        <td className="mono">{num(r.ev)}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={r.ac}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              if (r.isCR) onUpdateCrProg(r.cr, 'ac', val);
                              else onUpdateActivity(r.id, 'ac', val);
                            }}
                            style={{ width: '120px' }}
                          />
                        </td>
                        <td className={`mono ${cv < 0 ? 'bad' : ''}`}>{num(cv)}</td>
                        <td className={`mono ${sv < 0 ? 'bad' : ''}`}>{num(sv)}</td>
                        <td className={`mono ${isOverrun ? 'bad' : ''}`}>
                          {r.cpi === null ? '—' : r.cpi.toFixed(2)}
                        </td>
                        <td className={`mono ${isBehind ? 'bad' : ''}`}>
                          {r.spi === null ? '—' : r.spi.toFixed(2)}
                        </td>
                        <td>
                          {isOverrun ? (
                            <span className="badge bad">Cost overrun</span>
                          ) : isBehind ? (
                            <span className="badge warn">Behind plan</span>
                          ) : (
                            <span className="badge ok">Healthy</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ fontWeight: 700 }}>
                    <td></td>
                    <td>Total</td>
                    <td className="mono">{num(calc.BAC)}</td>
                    <td className="mono">{num(calc.PV)}</td>
                    <td className="mono">{num(calc.EV)}</td>
                    <td className="mono">{num(calc.AC)}</td>
                    <td className="mono">{num(calc.CV)}</td>
                    <td className="mono">{num(calc.SV)}</td>
                    <td className="mono">{calc.CPI.toFixed(2)}</td>
                    <td className="mono">{calc.SPI.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* 4.3 Thresholds & Warnings */}
      {sub === 'warn' && (
        <div className="two">
          <section className="card">
            <h3>
              Performance thresholds <span>warnings fire below these</span>
            </h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <label className="f">
                CPI threshold
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={T.cpi}
                  onChange={(e) => onUpdateThreshold('cpi', parseFloat(e.target.value) || 0)}
                />
              </label>
              <label className="f">
                SPI threshold
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={T.spi}
                  onChange={(e) => onUpdateThreshold('spi', parseFloat(e.target.value) || 0)}
                />
              </label>
            </div>

            <div style={{ marginTop: '14px' }}>
              {alerts.length > 0 ? (
                alerts.map(([tone, msg], i) => (
                  <div key={i} className={`alert ${tone}`}>
                    {msg}
                  </div>
                ))
              ) : (
                <div className="alert ok">
                  All cost and schedule indicators are within thresholds.
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <h3>
              PV vs EV <span>S-curve</span>
            </h3>
            {renderSCurve()}
          </section>
        </div>
      )}
    </>
  );
}
