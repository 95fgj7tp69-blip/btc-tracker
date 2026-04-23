import { useState, useEffect, useCallback, useRef } from "react";

const FALLBACK_PRICES_CHF = [
  ["2023-01", 21800], ["2023-02", 24200], ["2023-03", 27300], ["2023-04", 28100],
  ["2023-05", 26400], ["2023-06", 27900], ["2023-07", 29100], ["2023-08", 25800],
  ["2023-09", 24600], ["2023-10", 28900], ["2023-11", 35200], ["2023-12", 41800],
  ["2024-01", 39500], ["2024-02", 49200], ["2024-03", 64800], ["2024-04", 57900],
  ["2024-05", 61300], ["2024-06", 59800], ["2024-07", 62400], ["2024-08", 56700],
  ["2024-09", 58200], ["2024-10", 64100], ["2024-11", 87300], ["2024-12", 93200],
  ["2025-01", 98500], ["2025-02", 82400], ["2025-03", 74600], ["2025-04", 61258],
];

const fmt    = (n, d = 2) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtBtc = (n) => { const s = n.toFixed(6); return parseFloat(s).toString(); };

const TYPE_META = {
  buy:      { label: "Kauf",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: "↓" },
  sell:     { label: "Verkauf",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: "↑" },
  transfer: { label: "Transfer", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "⇄" },
};

const api = {
  getAll: ()   => fetch("/api/transactions").then(r => r.json()),
  create: (tx) => fetch("/api/transactions", { method: "POST",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(tx) }).then(r => r.json()),
  update: (tx) => fetch(`/api/transactions/${tx.id}`, { method: "PUT",    headers: { "Content-Type": "application/json" }, body: JSON.stringify(tx) }).then(r => r.json()),
  remove: (id) => fetch(`/api/transactions/${id}`,   { method: "DELETE" }).then(r => r.json()),
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#111", border: "1px solid #222",
  color: "#fff", padding: "11px 12px", borderRadius: 10, fontSize: 16,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none",
};

function PriceChart({ avgChf, currentChf, transactions, chartData }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const data = chartData?.length ? chartData : FALLBACK_PRICES_CHF;
  const prices = data.map(d => d[1]);
  const minP = Math.min(...prices) * 0.92;
  const maxP = Math.max(...prices) * 1.06;
  const W = 340, H = 160, PAD_L = 46, PAD_R = 12, PAD_T = 12, PAD_B = 24;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const xScale = (i) => PAD_L + (i / (data.length - 1)) * cw;
  const yScale = (v) => PAD_T + ch - ((v - minP) / (maxP - minP)) * ch;
  const linePoints = data.map((d, i) => `${xScale(i)},${yScale(d[1])}`).join(" ");
  const areaPoints = [`${xScale(0)},${PAD_T + ch}`, ...data.map((d, i) => `${xScale(i)},${yScale(d[1])}`), `${xScale(data.length - 1)},${PAD_T + ch}`].join(" ");
  const buyMarkers = transactions.filter(t => t.type === "buy").map(t => { const idx = data.findIndex(d => d[0] === t.date.slice(0, 7)); if (idx < 0) return null; return { x: xScale(idx), y: yScale(data[idx][1]) }; }).filter(Boolean);
  const isAbove = currentChf >= avgChf;
  const avgY = yScale(avgChf);
  const yTicks = [minP, (minP + maxP) / 2, maxP].map(v => ({ v, y: yScale(v), label: v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v) }));
  const xTicks = data.map((d, i) => ({ i, label: d[0] })).filter((_, i) => i % 6 === 0 || i === data.length - 1);
  const updateTooltip = useCallback((clientX) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = (clientX - rect.left) * (W / rect.width) - PAD_L;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx / cw) * (data.length - 1))));
    setTooltip({ x: xScale(idx), y: yScale(data[idx][1]), label: data[idx][0], price: data[idx][1] });
  }, [data]);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.1em" }}>KURSVERLAUF VS. EINSTAND</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#f59e0b", borderRadius: 1 }} /><span style={{ color: "#555", fontSize: 11 }}>Einstand</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} /><span style={{ color: "#555", fontSize: 11 }}>Kauf</span></div>
        </div>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible", touchAction: "none", userSelect: "none" }}
        onMouseMove={e => updateTooltip(e.clientX)} onMouseLeave={() => setTooltip(null)}
        onTouchStart={e => { e.preventDefault(); updateTooltip(e.touches[0].clientX); }}
        onTouchMove={e => { e.preventDefault(); updateTooltip(e.touches[0].clientX); }}
        onTouchEnd={() => setTooltip(null)}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isAbove ? "#22c55e" : "#ef4444"} stopOpacity="0.18" />
            <stop offset="100%" stopColor={isAbove ? "#22c55e" : "#ef4444"} stopOpacity="0.01" />
          </linearGradient>
          <clipPath id="chartClip"><rect x={PAD_L} y={PAD_T} width={cw} height={ch} /></clipPath>
        </defs>
        {yTicks.map(t => (<g key={t.v}><line x1={PAD_L} y1={t.y} x2={PAD_L + cw} y2={t.y} stroke="#161616" strokeWidth="1" /><text x={PAD_L - 6} y={t.y + 4} fill="#333" fontSize="9" textAnchor="end">{t.label}</text></g>))}
        {xTicks.map(t => (<text key={t.i} x={xScale(t.i)} y={H - 4} fill="#2a2a2a" fontSize="8" textAnchor="middle">{t.label.slice(2)}</text>))}
        <polygon points={areaPoints} fill="url(#areaGrad)" clipPath="url(#chartClip)" />
        <polyline points={linePoints} fill="none" stroke={isAbove ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinejoin="round" clipPath="url(#chartClip)" opacity="0.9" />
        {avgChf >= minP && avgChf <= maxP && (<g><line x1={PAD_L} y1={avgY} x2={PAD_L + cw} y2={avgY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" /><text x={PAD_L + cw + 2} y={avgY + 4} fill="#f59e0b" fontSize="8">{Math.round(avgChf / 1000)}k</text></g>)}
        {buyMarkers.map((m, i) => (<g key={i}><circle cx={m.x} cy={m.y} r="4" fill="#22c55e" opacity="0.85" /><circle cx={m.x} cy={m.y} r="7" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" /></g>))}
        {tooltip && (<g><line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + ch} stroke="#444" strokeWidth="1" strokeDasharray="3 3" /><circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#fff" opacity="0.95" /><circle cx={tooltip.x} cy={tooltip.y} r="8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.2" /></g>)}
      </svg>
      <div style={{ marginTop: 10, padding: "9px 12px", background: "#111", borderRadius: 8, border: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 38 }}>
        {tooltip ? (<><span style={{ color: "#555", fontSize: 12 }}>{tooltip.label}</span><span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>CHF {fmt(tooltip.price, 0)}</span></>) : (<><span style={{ color: "#333", fontSize: 12 }}>Finger ziehen zum Ablesen</span><span style={{ color: "#555", fontSize: 12 }}>CHF {fmt(currentChf, 0)}</span></>)}
      </div>
    </div>
  );
}

function BreakEvenCard({ avgChf, currentChf }) {
  const diff = currentChf - avgChf;
  const diffPct = avgChf > 0 ? (diff / avgChf) * 100 : 0;
  const isAbove = diff >= 0;
  const toBreakEvenPct = avgChf > 0 ? ((avgChf - currentChf) / currentChf) * 100 : 0;
  const ratio = Math.max(-1, Math.min(1, diff / (avgChf * 0.8)));
  const R = 54, cx = 80, cy = 72;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPath = (s, e, r) => { const sr = toRad(s - 90), er = toRad(e - 90); const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr), x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er); return `M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
  const nRad = toRad(-90 + (ratio + 1) * 90 - 90);
  const nx = cx + (R - 6) * Math.cos(nRad), ny = cy + (R - 6) * Math.sin(nRad);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.1em", marginBottom: 16 }}>BREAK-EVEN ANALYSE</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg viewBox="0 0 160 88" style={{ width: 160, flexShrink: 0 }}>
          <path d={arcPath(-90, 0, R)} fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="10" strokeLinecap="round" />
          <path d={arcPath(0, 90, R)} fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="10" strokeLinecap="round" />
          {isAbove ? <path d={arcPath(0, Math.max(0.1, Math.min(90, ratio * 90)), R)} fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" opacity="0.85" /> : <path d={arcPath(Math.max(-90, Math.min(-0.1, ratio * 90)), 0, R)} fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" opacity="0.85" />}
          <line x1={cx} y1={cy - R + 5} x2={cx} y2={cy - R + 14} stroke="#2a2a2a" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <circle cx={cx} cy={cy} r="4" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
          <text x={cx - R - 2} y={cy + 10} fill="#333" fontSize="8" textAnchor="middle">-80%</text>
          <text x={cx + R + 2} y={cy + 10} fill="#333" fontSize="8" textAnchor="middle">+80%</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#555", fontSize: 11, letterSpacing: "0.08em", marginBottom: 4 }}>AKTUELL VS. EINSTAND</div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 20, fontWeight: 300 }}>{isAbove ? "+" : ""}{fmt(diff, 0)}<span style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}>CHF</span></div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 12, opacity: 0.7, marginTop: 2 }}>{isAbove ? "+" : ""}{diffPct.toFixed(1)}%</div>
          </div>
          <div style={{ background: isAbove ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${isAbove ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`, borderRadius: 10, padding: "10px 12px" }}>
            {isAbove ? (<><div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>IM GEWINN SEIT</div><div style={{ color: "#22c55e", fontSize: 16 }}>CHF {fmt(avgChf, 0)}</div></>) : (<><div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>BTC MUSS STEIGEN UM</div><div style={{ color: "#ef4444", fontSize: 16 }}>+{toBreakEvenPct.toFixed(1)}%</div><div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>auf CHF {fmt(avgChf, 0)}</div></>)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#333", fontSize: 11 }}>Einstand CHF {fmt(avgChf, 0)}</span><span style={{ color: "#333", fontSize: 11 }}>Aktuell CHF {fmt(currentChf, 0)}</span></div>
        <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, Math.max(2, (currentChf / (avgChf * 1.5)) * 100))}%`, background: isAbove ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#991b1b,#ef4444)", borderRadius: 2, transition: "width 0.6s ease" }} /></div>
      </div>
    </div>
  );
}

function DcaCalculator({ totalBtc, totalInvested, avgChf, currentChf, usdChf }) {
  const [input, setInput] = useState("");
  const [feeInput, setFeeInput] = useState("0");
  const [mode, setMode] = useState("chf");
  const val = parseFloat(input) || 0;
  const fee = parseFloat(feeInput) || 0;
  const newBtc = mode === "chf" ? (val - fee) / currentChf : val;
  const newChf = mode === "chf" ? val : val * currentChf + fee;
  const newTotalBtc = totalBtc + newBtc;
  const newTotalInvested = totalInvested + newChf;
  const newAvgChf = newTotalBtc > 0 ? newTotalInvested / newTotalBtc : 0;
  const newAvgUsd = newAvgChf / usdChf;
  const avgDrop = avgChf > 0 ? ((newAvgChf - avgChf) / avgChf) * 100 : 0;
  const hasInput = val > 0;
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 20, padding: "20px 16px 20px", marginBottom: 12 }}>
      <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.1em", marginBottom: 16 }}>DCA-RECHNER</div>
      <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 3, marginBottom: 14, gap: 3 }}>
        {[["chf", "Betrag (CHF)"], ["btc", "Menge (BTC)"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setInput(""); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: mode === m ? "#1f1f1f" : "transparent", color: mode === m ? "#fff" : "#555", border: mode === m ? "1px solid #2a2a2a" : "1px solid transparent", fontWeight: mode === m ? 500 : 400 }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div><div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 6 }}>{mode === "chf" ? "KAUFBETRAG (CHF)" : "BTC MENGE"}</div><input type="number" step="any" placeholder={mode === "chf" ? "500" : "0.005"} value={input} onChange={e => setInput(e.target.value)} style={inputStyle} /></div>
        <div><div style={{ color: "#555", fontSize: 10, letterSpacing: "0.1em", marginBottom: 6 }}>GEBÜHREN (CHF)</div><input type="number" step="any" placeholder="0" value={feeInput} onChange={e => setFeeInput(e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: hasInput ? 14 : 0 }}>
        <div style={{ background: "#111", borderRadius: 12, padding: "14px 12px" }}><div style={{ color: "#444", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6 }}>AKTUELLER EINSTAND</div><div style={{ color: "#fff", fontSize: 17, fontWeight: 300 }}>CHF {fmt(avgChf, 0)}</div><div style={{ color: "#444", fontSize: 11, marginTop: 3 }}>${fmt(avgChf / usdChf, 0)}</div></div>
        <div style={{ background: hasInput ? (newAvgChf < avgChf ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)") : "#111", border: hasInput ? `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` : "1px solid transparent", borderRadius: 12, padding: "14px 12px", transition: "background 0.3s" }}>
          <div style={{ color: "#444", fontSize: 10, letterSpacing: "0.08em", marginBottom: 6 }}>NEUER EINSTAND</div>
          <div style={{ color: hasInput ? (newAvgChf < avgChf ? "#22c55e" : "#ef4444") : "#555", fontSize: 17, fontWeight: 300 }}>{hasInput ? `CHF ${fmt(newAvgChf, 0)}` : "—"}</div>
          <div style={{ color: "#444", fontSize: 11, marginTop: 3 }}>{hasInput ? `$${fmt(newAvgUsd, 0)}` : ""}</div>
        </div>
      </div>
      {hasInput && (
        <div style={{ background: newAvgChf < avgChf ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[{ label: "EINSTAND Δ", val: `${avgDrop > 0 ? "+" : ""}${avgDrop.toFixed(1)}%`, color: avgDrop < 0 ? "#22c55e" : "#ef4444" }, { label: "GEKAUFT", val: `${fmtBtc(newBtc)} BTC`, color: "#fff" }, { label: "GESAMT BTC", val: fmtBtc(newTotalBtc), color: "#fff" }].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: "center" }}><div style={{ color: "#444", fontSize: 9, letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div><div style={{ color, fontSize: 13, fontWeight: 500 }}>{val}</div></div>
            ))}
          </div>
        </div>
      )}
      {!hasInput && <div style={{ color: "#2a2a2a", fontSize: 12, textAlign: "center", paddingTop: 4 }}>Betrag eingeben um Einstandsänderung zu sehen</div>}
    </div>
  );
}

function KpiGrid({ portfolioChf, totalInvested, pnlChf, pnlPct, totalBtc, btcUsd, btcChf, avgUsd, avgChf }) {
  const neg = pnlChf < 0;
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ background: "linear-gradient(145deg,#111 0%,#0d0d0d 100%)", border: "1px solid #1f1f1f", borderRadius: 20, padding: "28px 24px 24px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: neg ? "rgba(239,68,68,0.04)" : "rgba(34,197,94,0.04)", borderRadius: "50%" }} />
        <div style={{ color: "#666", fontSize: 13, letterSpacing: "0.1em", marginBottom: 10 }}>PORTFOLIO WERT</div>
        <div style={{ fontSize: 46, fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 16 }}>
          <span style={{ color: "#666", fontSize: 20, marginRight: 6 }}>CHF</span>
          <span style={{ color: "#fff" }}>{fmt(portfolioChf)}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ background: neg ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: neg ? "#ef4444" : "#22c55e", fontSize: 13, fontWeight: 500, padding: "4px 10px", borderRadius: 8 }}>{neg ? "" : "+"}{fmt(pnlChf)} CHF</span>
          <span style={{ background: neg ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: neg ? "#ef4444" : "#22c55e", fontSize: 13, padding: "4px 10px", borderRadius: 8 }}>{neg ? "" : "+"}{pnlPct.toFixed(2)}%</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[{ label: "INVESTIERT", val: `CHF ${fmt(totalInvested)}` }, { label: "TOTAL BTC", val: fmtBtc(totalBtc) + " BTC" }].map(({ label, val }) => (
          <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 16, padding: "18px 16px" }}>
            <div style={{ color: "#666", fontSize: 13, letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 300 }}>{val}</div>
          </div>
        ))}
      </div>
      {[{ label: "AKTUELLER KURS", left: fmt(btcUsd, 0), leftSub: "USD", right: fmt(btcChf, 0), rightSub: "CHF", mb: 10 }, { label: "Ø EINSTANDSPREIS", left: fmt(avgUsd, 0), leftSub: "USD", right: fmt(avgChf, 0), rightSub: "CHF", mb: 0 }].map(({ label, left, leftSub, right, rightSub, mb }) => (
        <div key={label} style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 16, padding: "18px 16px", marginBottom: mb }}>
          <div style={{ color: "#666", fontSize: 13, letterSpacing: "0.08em", marginBottom: 12 }}>{label}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ color: "#fff", fontSize: 22, fontWeight: 300 }}>{left}</div><div style={{ color: "#666", fontSize: 13, marginTop: 3 }}>{leftSub}</div></div>
            <div style={{ width: 1, background: "#1f1f1f", alignSelf: "stretch" }} />
            <div style={{ textAlign: "right" }}><div style={{ color: "#fff", fontSize: 22, fontWeight: 300 }}>{right}</div><div style={{ color: "#666", fontSize: 13, marginTop: 3 }}>{rightSub}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ portfolioChf, investedChf }) {
  const max = Math.max(portfolioChf, investedChf, 1) * 1.2;
  const steps = [0, 25000, 50000, 75000, 100000].filter(v => v <= max);
  const bars = [{ label: "Portfolio", value: portfolioChf, color: "#ef4444" }, { label: "Investiert", value: investedChf, color: "#3b82f6" }];
  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 20, padding: "20px 16px 16px" }}>
        <div style={{ color: "#666", fontSize: 12, letterSpacing: "0.1em", marginBottom: 20 }}>VERGLEICH</div>
        <div style={{ display: "flex", alignItems: "flex-end", height: 180, position: "relative" }}>
          {steps.map(v => (<div key={v} style={{ position: "absolute", left: 32, right: 0, bottom: `${(v / max) * 100}%`, borderTop: "1px solid #161616" }}><span style={{ position: "absolute", left: -30, bottom: 2, color: "#333", fontSize: 9 }}>{v >= 1000 ? `${v / 1000}k` : v}</span></div>))}
          <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "flex-end", paddingLeft: 36, height: "100%" }}>
            {bars.map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ color: "#444", fontSize: 10 }}>{fmt(value, 0)}</div>
                <div style={{ width: "100%", height: `${Math.max((value / max) * 148, 2)}px`, background: color, borderRadius: "6px 6px 2px 2px", opacity: 0.8 }} />
                <div style={{ color: "#555", fontSize: 10 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionModal({ onClose, onSave, editTx }) {
  const blank = { date: new Date().toISOString().slice(0, 10), btc: "", chf: "", fee: "", type: "buy", note: "" };
  const [form, setForm] = useState(editTx ? { ...editTx, btc: String(editTx.btc), chf: String(editTx.chf), fee: String(editTx.fee ?? "") } : blank);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isTransfer = form.type === "transfer";
  const handleSave = async () => {
    if (!form.btc) return;
    setSaving(true);
    await onSave({ ...form, btc: +form.btc, chf: isTransfer ? 0 : +form.chf || 0, fee: +form.fee || 0 });
    setSaving(false);
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0a0a0a", borderTop: "1px solid #1f1f1f", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 420, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#222", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 500, marginBottom: 20 }}>{editTx ? "Transaktion bearbeiten" : "Neue Transaktion"}</div>
        <Field label="TYP">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {Object.entries(TYPE_META).map(([t, m]) => (<button key={t} onClick={() => set("type", t)} style={{ padding: "10px 0", borderRadius: 10, background: form.type === t ? m.bg : "#111", border: `1px solid ${form.type === t ? m.color + "55" : "#222"}`, color: form.type === t ? m.color : "#555", cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span style={{ fontSize: 17 }}>{m.icon}</span>{m.label}</button>))}
          </div>
        </Field>
        <Field label="DATUM"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="BTC MENGE"><input type="number" placeholder="0.05" value={form.btc} onChange={e => set("btc", e.target.value)} style={inputStyle} step="any" /></Field>
          {isTransfer ? <Field label="NETZWERKGEBÜHR (BTC)"><input type="number" placeholder="0.00002" value={form.fee} onChange={e => set("fee", e.target.value)} style={inputStyle} step="any" /></Field> : <Field label="CHF BETRAG"><input type="number" placeholder="3500" value={form.chf} onChange={e => set("chf", e.target.value)} style={inputStyle} step="any" /></Field>}
        </div>
        {!isTransfer && <Field label="HANDELSGEBÜHREN (CHF)"><input type="number" placeholder="5.50" value={form.fee} onChange={e => set("fee", e.target.value)} style={inputStyle} step="any" /></Field>}
        <Field label="NOTIZ (OPTIONAL)"><input type="text" placeholder={isTransfer ? "z.B. Kraken → Ledger" : "z.B. DCA Kauf"} value={form.note} onChange={e => set("note", e.target.value)} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "14px 0", background: "#111", border: "1px solid #222", color: "#666", borderRadius: 12, cursor: "pointer", fontSize: 14, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "14px 0", background: saving ? "#333" : TYPE_META[form.type].color, border: "none", color: form.type === "buy" ? "#000" : "#fff", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {saving ? "Speichern..." : editTx ? "Speichern" : `${TYPE_META[form.type].label} erfassen`}
          </button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, onDelete, onEdit }) {
  const m = TYPE_META[tx.type];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #0e0e0e" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{m.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ color: "#fff", fontSize: 15 }}>{fmtBtc(tx.btc)} <span style={{ color: "#555", fontSize: 12 }}>BTC</span></div>
          <div style={{ color: m.color, fontSize: 14 }}>{tx.type === "transfer" ? (tx.fee > 0 ? `−${tx.fee} BTC` : "—") : `CHF ${fmt(tx.chf)}`}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <div style={{ color: "#3a3a3a", fontSize: 11 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</div>
          {tx.fee > 0 && tx.type !== "transfer" && <div style={{ color: "#2e2e2e", fontSize: 11 }}>Geb. CHF {fmt(tx.fee)}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(tx)} style={{ background: "none", border: "1px solid #1a1a1a", color: "#333", borderRadius: 7, cursor: "pointer", fontSize: 12, padding: "5px 8px" }}>✎</button>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "1px solid #1a1a1a", color: "#333", borderRadius: 7, cursor: "pointer", fontSize: 12, padding: "5px 8px" }}>✕</button>
      </div>
    </div>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [btcUsd, setBtcUsd]             = useState(78009);
  const [usdChf, setUsdChf]             = useState(0.786);
  const [chartData, setChartData]       = useState([]);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [view, setView]                 = useState("dashboard");
  const [showModal, setShowModal]       = useState(false);
  const [editTx, setEditTx]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [dbLoading, setDbLoading]       = useState(true);
  const [txFilter, setTxFilter]         = useState("all");

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover";
    document.documentElement.style.background = "#000";
  }, []);

  const loadTransactions = useCallback(async () => {
    setDbLoading(true);
    try { const data = await api.getAll(); setTransactions(Array.isArray(data) ? data : []); } catch (e) { console.error(e); }
    setDbLoading(false);
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const fmtTime = (d) => d ? d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf");
      const d = await r.json();
      if (d.bitcoin) { setBtcUsd(d.bitcoin.usd); setUsdChf(d.bitcoin.chf / d.bitcoin.usd); setLastUpdated(new Date()); }
    } catch {}
    setLoading(false);
  }, []);

  const fetchChart = useCallback(async () => {
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=chf&days=730&interval=daily");
      const d = await r.json();
      if (!d.prices?.length) return;
      const monthly = {};
      d.prices.forEach(([ts, price]) => { const dt = new Date(ts); const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`; if (!monthly[key]) monthly[key] = []; monthly[key].push(price); });
      const data = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([key, prices]) => [key, Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)]);
      if (data.length) setChartData(data);
    } catch {}
  }, []);

  useEffect(() => { fetchPrice(); fetchChart(); }, [fetchPrice, fetchChart]);
  useEffect(() => { const id = setInterval(fetchPrice, 60_000); return () => clearInterval(id); }, [fetchPrice]);

  const btcChf = btcUsd * usdChf;
  const buyTx  = transactions.filter(t => t.type === "buy");
  const sellTx = transactions.filter(t => t.type === "sell");
  const trfTx  = transactions.filter(t => t.type === "transfer");
  const totalBtc = buyTx.reduce((s, t) => s + +t.btc, 0) - sellTx.reduce((s, t) => s + +t.btc, 0) - trfTx.reduce((s, t) => s + +(t.fee || 0), 0);
  const totalInvested = buyTx.reduce((s, t) => s + +t.chf + +(t.fee || 0), 0) - sellTx.reduce((s, t) => s + +t.chf - +(t.fee || 0), 0);
  const portfolioChf = totalBtc * btcChf;
  const pnlChf = portfolioChf - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnlChf / totalInvested) * 100 : 0;
  const avgChf = totalBtc > 0 ? totalInvested / totalBtc : 0;
  const avgUsd = avgChf / usdChf;

  const handleSave = async (form) => {
    if (form.id && transactions.find(t => t.id === form.id)) {
      const updated = await api.update(form);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = await api.create(form);
      setTransactions(prev => [...prev, created]);
    }
  };

  const handleDelete = async (id) => {
    await api.remove(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const filteredTx = [...transactions].filter(t => txFilter === "all" || t.type === txFilter).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html { height: -webkit-fill-available; }
        html, body { background: #000; color: #fff; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; min-height: -webkit-fill-available; overscroll-behavior: none; }
        ::-webkit-scrollbar { width: 3px; background: #000; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.25); cursor: pointer; }
        input { font-size: 16px !important; }
        input:focus { border-color: #333 !important; box-shadow: 0 0 0 1px #333; }
        button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "#000" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, background: "#f7931a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000" }}>₿</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>Portfolio</div>
              {lastUpdated && <div style={{ fontSize: 10, color: "#333", marginTop: 1 }}>Aktualisiert {fmtTime(lastUpdated)}</div>}
            </div>
          </div>
          <button onClick={() => { fetchPrice(); fetchChart(); }} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 8, color: loading ? "#f59e0b" : "#555", cursor: "pointer", fontSize: 13, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            <span style={{ display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
            <span style={{ fontSize: 12 }}>{loading ? "..." : `$${fmt(btcUsd, 0)}`}</span>
          </button>
        </div>

        {dbLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#333", fontSize: 14 }}>Lade Daten...</div>
        ) : (
          <>
            {view === "dashboard" && (
              <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 125px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}>
                <KpiGrid portfolioChf={portfolioChf} totalInvested={totalInvested} pnlChf={pnlChf} pnlPct={pnlPct} totalBtc={totalBtc} btcUsd={btcUsd} btcChf={btcChf} avgUsd={avgUsd} avgChf={avgChf} />
                <div style={{ padding: "0 16px" }}>
                  <PriceChart avgChf={avgChf} currentChf={btcChf} transactions={transactions} chartData={chartData} />
                  <BreakEvenCard avgChf={avgChf} currentChf={btcChf} />
                  <DcaCalculator totalBtc={totalBtc} totalInvested={totalInvested} avgChf={avgChf} currentChf={btcChf} usdChf={usdChf} />
                </div>
                <BarChart portfolioChf={portfolioChf} investedChf={totalInvested} />
              </div>
            )}
            {view === "transactions" && (
              <div style={{ padding: "0 16px", overflowY: "auto", maxHeight: "calc(100vh - 125px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {[["all", "Alle"], ...Object.entries(TYPE_META).map(([k, v]) => [k, v.label])].map(([id, label]) => (
                    <button key={id} onClick={() => setTxFilter(id)} style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: txFilter === id ? "#fff" : "#111", color: txFilter === id ? "#000" : "#555", border: `1px solid ${txFilter === id ? "#fff" : "#1f1f1f"}`, fontWeight: txFilter === id ? 500 : 400 }}>{label}</button>
                  ))}
                </div>
                {filteredTx.length === 0 && <div style={{ color: "#333", textAlign: "center", padding: "40px 0", fontSize: 14 }}>Keine Transaktionen</div>}
                {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} onDelete={handleDelete} onEdit={tx => { setEditTx(tx); setShowModal(true); }} />)}
                <div style={{ height: 80 }} />
              </div>
            )}
          </>
        )}

        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid #111", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "10px 32px calc(20px + env(safe-area-inset-bottom))", gap: 12 }}>
          <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: view === "dashboard" ? "#fff" : "#444", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", justifySelf: "end" }}>
            <span style={{ fontSize: 18 }}>◈</span><span style={{ fontSize: 10, letterSpacing: "0.06em" }}>Dashboard</span>
          </button>
          <button onClick={() => { setEditTx(null); setShowModal(true); }} style={{ width: 52, height: 52, borderRadius: 16, background: "#fff", border: "none", color: "#000", cursor: "pointer", fontSize: 28, fontWeight: 300, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(255,255,255,0.12)", lineHeight: 1 }}>+</button>
          <button onClick={() => setView("transactions")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: view === "transactions" ? "#fff" : "#444", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", justifySelf: "start" }}>
            <span style={{ fontSize: 18 }}>≡</span><span style={{ fontSize: 10, letterSpacing: "0.06em" }}>Verlauf</span>
          </button>
        </div>
      </div>

      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditTx(null); }} onSave={handleSave} editTx={editTx} />}
    </>
  );
}
