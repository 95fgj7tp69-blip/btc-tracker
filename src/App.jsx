import { useState, useEffect, useCallback, useRef } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";

const api = {
  getAll: ()   => fetch("/api/transactions").then(r => r.json()),
  create: (tx) => fetch("/api/transactions", { method: "POST",   headers: { "Content-Type": "application/json" }, body: JSON.stringify(tx) }).then(r => r.json()),
  update: (tx) => fetch(`/api/transactions/${tx.id}`, { method: "PUT",    headers: { "Content-Type": "application/json" }, body: JSON.stringify(tx) }).then(r => r.json()),
  remove: (id) => fetch(`/api/transactions/${id}`,   { method: "DELETE" }).then(r => r.json()),
};

const fmtChf = (n, d = 2) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsd = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtBtc = (n) => { const s = n.toFixed(6); return parseFloat(s).toString(); };

const TYPE_META = {
  buy:      { label: "Kauf",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: "↓" },
  sell:     { label: "Verkauf",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: "↑" },
  transfer: { label: "Transfer", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "⇄" },
};

const FALLBACK_PRICES_CHF = [
  ["2023-01", 21800], ["2023-02", 24200], ["2023-03", 27300], ["2023-04", 28100],
  ["2023-05", 26400], ["2023-06", 27900], ["2023-07", 29100], ["2023-08", 25800],
  ["2023-09", 24600], ["2023-10", 28900], ["2023-11", 35200], ["2023-12", 41800],
  ["2024-01", 39500], ["2024-02", 49200], ["2024-03", 64800], ["2024-04", 57900],
  ["2024-05", 61300], ["2024-06", 59800], ["2024-07", 62400], ["2024-08", 56700],
  ["2024-09", 58200], ["2024-10", 64100], ["2024-11", 87300], ["2024-12", 93200],
  ["2025-01", 98500], ["2025-02", 82400], ["2025-03", 74600], ["2025-04", 61258],
];

const PORTFOLIO_CHART_DATA = {
  "1D": [
    { t: "00:00", v: 33800 }, { t: "03:00", v: 34100 }, { t: "06:00", v: 33200 },
    { t: "09:00", v: 32400 }, { t: "12:00", v: 31900 }, { t: "15:00", v: 31200 },
    { t: "18:00", v: 30900 }, { t: "21:00", v: 31350 },
  ],
  "7D": [
    { t: "Mo", v: 36200 }, { t: "Di", v: 35400 }, { t: "Mi", v: 34800 },
    { t: "Do", v: 33900 }, { t: "Fr", v: 33100 }, { t: "Sa", v: 31800 }, { t: "So", v: 31350 },
  ],
  "30D": [
    { t: "1", v: 38500 }, { t: "5", v: 37200 }, { t: "10", v: 36100 },
    { t: "15", v: 35000 }, { t: "20", v: 33500 }, { t: "25", v: 32000 }, { t: "30", v: 31350 },
  ],
  "ALL": [
    { t: "Jan", v: 22000 }, { t: "Mrz", v: 33000 }, { t: "Mai", v: 35000 },
    { t: "Jul", v: 40000 }, { t: "Sep", v: 36000 }, { t: "Nov", v: 45000 }, { t: "Jetzt", v: 31350 },
  ],
};

const inputStyle = {
  width: "100%", background: "#111", border: "1px solid #222",
  color: "#fff", padding: "13px 14px", borderRadius: 10, fontSize: 16,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Header({ lastUpdated, btcUsd, onRefresh, loading }) {
  const t = lastUpdated ? lastUpdated.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "#f7931a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#000", flexShrink: 0, boxShadow: "0 4px 12px rgba(247,147,26,0.3)" }}>₿</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>Portfolio</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>Aktualisiert {t}</div>
        </div>
      </div>
      <button onClick={onRefresh} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <span style={{ fontSize: 13, color: "#888", display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#ccc" }}>${fmtUsd(btcUsd)}</span>
      </button>
    </div>
  );
}

function PortfolioCard({ portfolioChf, pnlChf, pnlPct }) {
  const [activeTab, setActiveTab] = useState("7D");
  const data = PORTFOLIO_CHART_DATA[activeTab];
  const isNeg = pnlChf < 0;
  return (
    <div style={{ margin: "0 12px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ color: "#888", fontSize: 13 }}>Gesamtwert</div>
          <div style={{ display: "flex", gap: 2, background: "#111", borderRadius: 10, padding: 3 }}>
            {["1D", "7D", "30D", "ALL"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: activeTab === t ? "#222" : "transparent", color: activeTab === t ? "#fff" : "#555" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <span style={{ fontSize: 22, fontWeight: 500, color: "#888", marginRight: 3 }}>CHF</span>
          {fmtChf(portfolioChf)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 20 }}>
          <span style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 14, fontWeight: 500 }}>
            {isNeg ? "↓" : "↑"} {fmtChf(Math.abs(pnlChf))} CHF ({isNeg ? "" : "+"}{pnlPct.toFixed(2)}%)
          </span>
          <span style={{ color: "#666", fontSize: 13 }}>seit Kauf</span>
        </div>
      </div>
      <div style={{ height: 140, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 50, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isNeg ? "#ef4444" : "#22c55e"} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isNeg ? "#ef4444" : "#22c55e"} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 13 }} labelStyle={{ color: "#aaa" }} itemStyle={{ color: "#fff", fontWeight: 500 }} formatter={(v) => [`CHF ${fmtChf(v, 0)}`, ""]} />
            <Area type="monotone" dataKey="v" stroke={isNeg ? "#ef4444" : "#22c55e"} strokeWidth={2} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4, fill: isNeg ? "#ef4444" : "#22c55e" }} />
          </AreaChart>
        </ResponsiveContainer>
        {(() => {
          const vals = data.map(d => d.v);
          const mn = Math.min(...vals), mx = Math.max(...vals), mid = Math.round((mn + mx) / 2);
          return (
            <div style={{ position: "absolute", right: 8, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", padding: "8px 0" }}>
              {[mx, mid, mn].map(v => (<span key={v} style={{ fontSize: 11, color: "#777", textAlign: "right", fontWeight: 500 }}>{fmtChf(v, 0)}</span>))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function PositionCard({ totalBtc, portfolioChf, totalInvested, avgChf }) {
  return (
    <div style={{ margin: "0 12px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 20px" }}>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Deine Position</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ borderRight: "1px solid #1a1a1a", paddingRight: 16 }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>Bestand</div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{fmtBtc(totalBtc)} <span style={{ fontSize: 13, fontWeight: 400, color: "#999" }}>BTC</span></div>
          <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>≈ CHF {fmtChf(portfolioChf, 0)}</div>
        </div>
        <div style={{ paddingLeft: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 2 }}>Investiert</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>CHF {fmtChf(totalInvested, 0)}</div>
          </div>
          <div>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 2 }}>Einstandspreis</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>CHF {fmtChf(avgChf, 0)}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>pro BTC</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketCard({ btcChf, btcUsd, dayChangePct }) {
  const isPos = dayChangePct >= 0;
  return (
    <div style={{ margin: "0 12px 12px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ color: "#888", fontSize: 13, marginBottom: 14 }}>Aktueller Kurs</div>
        <div style={{ background: isPos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: isPos ? "#22c55e" : "#ef4444", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
          <span>{isPos ? "▲" : "▼"}</span>{Math.abs(dayChangePct).toFixed(2)}%
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, background: "#f7931a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#000", flexShrink: 0 }}>₿</div>
        <span style={{ color: "#aaa", fontSize: 14 }}>Bitcoin (BTC)</span>
      </div>
      <div>
        <div style={{ color: "#fff", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>CHF {fmtChf(btcChf, 0)}</div>
        <div style={{ color: "#777", fontSize: 13, marginTop: 3 }}>${fmtUsd(btcUsd)}</div>
      </div>
    </div>
  );
}

function PriceChart({ avgChf, currentChf, transactions, chartData }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const data = chartData?.length ? chartData : FALLBACK_PRICES_CHF;
  const prices = data.map(d => d[1]);
  const minP = Math.min(...prices) * 0.92, maxP = Math.max(...prices) * 1.06;
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
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em" }}>KURSVERLAUF VS. EINSTAND</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#f59e0b", borderRadius: 1 }} /><span style={{ color: "#777", fontSize: 12 }}>Einstand</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} /><span style={{ color: "#777", fontSize: 12 }}>Kauf</span></div>
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
        {yTicks.map(t => (<g key={t.v}><line x1={PAD_L} y1={t.y} x2={PAD_L + cw} y2={t.y} stroke="#1a1a1a" strokeWidth="1" /><text x={PAD_L - 6} y={t.y + 4} fill="#666" fontSize="9" textAnchor="end">{t.label}</text></g>))}
        {xTicks.map(t => (<text key={t.i} x={xScale(t.i)} y={H - 4} fill="#555" fontSize="8" textAnchor="middle">{t.label.slice(2)}</text>))}
        <polygon points={areaPoints} fill="url(#areaGrad)" clipPath="url(#chartClip)" />
        <polyline points={linePoints} fill="none" stroke={isAbove ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinejoin="round" clipPath="url(#chartClip)" opacity="0.9" />
        {avgChf >= minP && avgChf <= maxP && (<g><line x1={PAD_L} y1={avgY} x2={PAD_L + cw} y2={avgY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" /><text x={PAD_L + cw + 2} y={avgY + 4} fill="#f59e0b" fontSize="8">{Math.round(avgChf / 1000)}k</text></g>)}
        {buyMarkers.map((m, i) => (<g key={i}><circle cx={m.x} cy={m.y} r="4" fill="#22c55e" opacity="0.85" /><circle cx={m.x} cy={m.y} r="7" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" /></g>))}
        {tooltip && (<g><line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + ch} stroke="#444" strokeWidth="1" strokeDasharray="3 3" /><circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#fff" opacity="0.95" /></g>)}
      </svg>
      <div style={{ marginTop: 10, padding: "10px 14px", background: "#111", borderRadius: 8, border: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40 }}>
        {tooltip ? (<><span style={{ color: "#777", fontSize: 13 }}>{tooltip.label}</span><span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>CHF {fmtChf(tooltip.price, 0)}</span></>) : (<><span style={{ color: "#444", fontSize: 13 }}>Finger ziehen zum Ablesen</span><span style={{ color: "#666", fontSize: 13 }}>CHF {fmtChf(currentChf, 0)}</span></>)}
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
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 16 }}>BREAK-EVEN ANALYSE</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg viewBox="0 0 160 88" style={{ width: 160, flexShrink: 0 }}>
          <path d={arcPath(-90, 0, R)} fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="10" strokeLinecap="round" />
          <path d={arcPath(0, 90, R)} fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="10" strokeLinecap="round" />
          {isAbove ? <path d={arcPath(0, Math.max(0.1, Math.min(90, ratio * 90)), R)} fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" opacity="0.85" /> : <path d={arcPath(Math.max(-90, Math.min(-0.1, ratio * 90)), 0, R)} fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round" opacity="0.85" />}
          <line x1={cx} y1={cy - R + 5} x2={cx} y2={cy - R + 14} stroke="#2a2a2a" strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          <circle cx={cx} cy={cy} r="4" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
          <text x={cx - R - 2} y={cy + 10} fill="#555" fontSize="8" textAnchor="middle">-80%</text>
          <text x={cx + R + 2} y={cy + 10} fill="#555" fontSize="8" textAnchor="middle">+80%</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 6 }}>AKTUELL VS. EINSTAND</div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 22, fontWeight: 300 }}>{isAbove ? "+" : ""}{fmtChf(diff, 0)}<span style={{ fontSize: 14, marginLeft: 4, opacity: 0.7 }}>CHF</span></div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 14, opacity: 0.7, marginTop: 3 }}>{isAbove ? "+" : ""}{diffPct.toFixed(1)}%</div>
          </div>
          <div style={{ background: isAbove ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)", border: `1px solid ${isAbove ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`, borderRadius: 10, padding: "10px 12px" }}>
            {isAbove ? (<><div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>IM GEWINN SEIT</div><div style={{ color: "#22c55e", fontSize: 17 }}>CHF {fmtChf(avgChf, 0)}</div></>) : (<><div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>BTC MUSS STEIGEN UM</div><div style={{ color: "#ef4444", fontSize: 17 }}>+{toBreakEvenPct.toFixed(1)}%</div><div style={{ color: "#777", fontSize: 13, marginTop: 3 }}>auf CHF {fmtChf(avgChf, 0)}</div></>)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "#555", fontSize: 12 }}>Einstand CHF {fmtChf(avgChf, 0)}</span><span style={{ color: "#555", fontSize: 12 }}>Aktuell CHF {fmtChf(currentChf, 0)}</span></div>
        <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, Math.max(2, (currentChf / (avgChf * 1.5)) * 100))}%`, background: isAbove ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#991b1b,#ef4444)", borderRadius: 2 }} /></div>
      </div>
    </div>
  );
}

function DcaCalculator({ totalBtc, totalInvested, avgChf, currentChf, usdChf }) {
  const [input, setInput] = useState("");
  const [feeInput, setFeeInput] = useState("0");
  const [mode, setMode] = useState("chf");
  const val = parseFloat(input) || 0, fee = parseFloat(feeInput) || 0;
  const newBtc = mode === "chf" ? (val - fee) / currentChf : val;
  const newChf = mode === "chf" ? val : val * currentChf + fee;
  const newTotalBtc = totalBtc + newBtc, newTotalInvested = totalInvested + newChf;
  const newAvgChf = newTotalBtc > 0 ? newTotalInvested / newTotalBtc : 0;
  const newAvgUsd = newAvgChf / usdChf;
  const avgDrop = avgChf > 0 ? ((newAvgChf - avgChf) / avgChf) * 100 : 0;
  const hasInput = val > 0;
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px 16px 20px", marginBottom: 12 }}>
      <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 16 }}>DCA-RECHNER</div>
      <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 3, marginBottom: 16, gap: 3 }}>
        {[["chf", "Betrag (CHF)"], ["btc", "Menge (BTC)"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setInput(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit", background: mode === m ? "#1f1f1f" : "transparent", color: mode === m ? "#fff" : "#666", border: mode === m ? "1px solid #2a2a2a" : "1px solid transparent", fontWeight: mode === m ? 500 : 400 }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div><div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 8 }}>{mode === "chf" ? "KAUFBETRAG (CHF)" : "BTC MENGE"}</div><input type="number" step="any" placeholder={mode === "chf" ? "500" : "0.005"} value={input} onChange={e => setInput(e.target.value)} style={inputStyle} /></div>
        <div><div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 8 }}>GEBÜHREN (CHF)</div><input type="number" step="any" placeholder="0" value={feeInput} onChange={e => setFeeInput(e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: hasInput ? 14 : 0 }}>
        <div style={{ background: "#111", borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: "#777", fontSize: 12, marginBottom: 6 }}>AKTUELLER EINSTAND</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 300 }}>CHF {fmtChf(avgChf, 0)}</div>
          <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>${fmtChf(avgChf / usdChf, 0)}</div>
        </div>
        <div style={{ background: hasInput ? (newAvgChf < avgChf ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)") : "#111", border: hasInput ? `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` : "1px solid transparent", borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: "#777", fontSize: 12, marginBottom: 6 }}>NEUER EINSTAND</div>
          <div style={{ color: hasInput ? (newAvgChf < avgChf ? "#22c55e" : "#ef4444") : "#555", fontSize: 18, fontWeight: 300 }}>{hasInput ? `CHF ${fmtChf(newAvgChf, 0)}` : "—"}</div>
          <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{hasInput ? `$${fmtChf(newAvgUsd, 0)}` : ""}</div>
        </div>
      </div>
      {hasInput && (
        <div style={{ background: newAvgChf < avgChf ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[{ label: "EINSTAND Δ", val: `${avgDrop > 0 ? "+" : ""}${avgDrop.toFixed(1)}%`, color: avgDrop < 0 ? "#22c55e" : "#ef4444" }, { label: "GEKAUFT", val: `${fmtBtc(newBtc)} BTC`, color: "#fff" }, { label: "GESAMT BTC", val: fmtBtc(newTotalBtc), color: "#fff" }].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: "center" }}><div style={{ color: "#666", fontSize: 11, marginBottom: 5 }}>{label}</div><div style={{ color, fontSize: 14, fontWeight: 500 }}>{val}</div></div>
            ))}
          </div>
        </div>
      )}
      {!hasInput && <div style={{ color: "#333", fontSize: 13, textAlign: "center", paddingTop: 4 }}>Betrag eingeben um Einstandsänderung zu sehen</div>}
    </div>
  );
}

function BarChart({ portfolioChf, investedChf }) {
  const max = Math.max(portfolioChf, investedChf, 1) * 1.2;
  const steps = [0, 25000, 50000, 75000, 100000].filter(v => v <= max);
  const bars = [{ label: "Portfolio", value: portfolioChf, color: "#ef4444" }, { label: "Investiert", value: investedChf, color: "#3b82f6" }];
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: "#888", fontSize: 13, letterSpacing: "0.06em", marginBottom: 20 }}>VERGLEICH</div>
      <div style={{ display: "flex", alignItems: "flex-end", height: 180, position: "relative" }}>
        {steps.map(v => (<div key={v} style={{ position: "absolute", left: 32, right: 0, bottom: `${(v / max) * 100}%`, borderTop: "1px solid #161616" }}><span style={{ position: "absolute", left: -30, bottom: 2, color: "#555", fontSize: 10 }}>{v >= 1000 ? `${v / 1000}k` : v}</span></div>))}
        <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "flex-end", paddingLeft: 36, height: "100%" }}>
          {bars.map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ color: "#666", fontSize: 11 }}>{fmtChf(value, 0)}</div>
              <div style={{ width: "100%", height: `${Math.max((value / max) * 148, 2)}px`, background: color, borderRadius: "6px 6px 2px 2px", opacity: 0.8 }} />
              <div style={{ color: "#777", fontSize: 12 }}>{label}</div>
            </div>
          ))}
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
      <div onClick={e => e.stopPropagation()} style={{ background: "#0a0a0a", borderTop: "1px solid #1f1f1f", borderRadius: "20px 20px 0 0", padding: "12px 20px 40px", width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ color: "#fff", fontSize: 19, fontWeight: 500, marginBottom: 20 }}>{editTx ? "Transaktion bearbeiten" : "Neue Transaktion"}</div>
        <Field label="TYP">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {Object.entries(TYPE_META).map(([t, m]) => (<button key={t} onClick={() => set("type", t)} style={{ padding: "12px 0", borderRadius: 10, background: form.type === t ? m.bg : "#111", border: `1px solid ${form.type === t ? m.color + "55" : "#222"}`, color: form.type === t ? m.color : "#666", cursor: "pointer", fontSize: 15, fontWeight: 500, fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}><span style={{ fontSize: 19 }}>{m.icon}</span>{m.label}</button>))}
          </div>
        </Field>
        <Field label="DATUM"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="BTC MENGE"><input type="number" placeholder="0.05" value={form.btc} onChange={e => set("btc", e.target.value)} style={inputStyle} step="any" /></Field>
          {isTransfer ? <Field label="NETZWERKGEBÜHR (BTC)"><input type="number" placeholder="0.00002" value={form.fee} onChange={e => set("fee", e.target.value)} style={inputStyle} step="any" /></Field> : <Field label="CHF BETRAG"><input type="number" placeholder="3500" value={form.chf} onChange={e => set("chf", e.target.value)} style={inputStyle} step="any" /></Field>}
        </div>
        {!isTransfer && <Field label="HANDELSGEBÜHREN (CHF)"><input type="number" placeholder="5.50" value={form.fee} onChange={e => set("fee", e.target.value)} style={inputStyle} step="any" /></Field>}
        <Field label="NOTIZ (OPTIONAL)"><input type="text" placeholder={isTransfer ? "z.B. Kraken → Ledger" : "z.B. DCA Kauf"} value={form.note} onChange={e => set("note", e.target.value)} style={inputStyle} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: "#111", border: "1px solid #222", color: "#777", borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "15px 0", background: saving ? "#333" : TYPE_META[form.type].color, border: "none", color: form.type === "buy" ? "#000" : "#fff", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
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
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: "1px solid #0e0e0e" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ color: "#fff", fontSize: 16 }}>{fmtBtc(tx.btc)} <span style={{ color: "#666", fontSize: 13 }}>BTC</span></div>
          <div style={{ color: m.color, fontSize: 15 }}>{tx.type === "transfer" ? (tx.fee > 0 ? `−${tx.fee} BTC` : "—") : `CHF ${fmtChf(tx.chf)}`}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ color: "#555", fontSize: 13 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</div>
          {tx.fee > 0 && tx.type !== "transfer" && <div style={{ color: "#444", fontSize: 12 }}>Geb. CHF {fmtChf(tx.fee)}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onEdit(tx)} style={{ background: "none", border: "1px solid #222", color: "#555", borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "7px 10px" }}>✎</button>
        <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "1px solid #222", color: "#555", borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "7px 10px" }}>✕</button>
      </div>
    </div>
  );
}

function BottomNav({ view, setView, onAdd }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(5,5,5,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid #141414", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "10px 32px calc(16px + env(safe-area-inset-bottom))" }}>
      <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifySelf: "center" }}>
        <span style={{ fontSize: 20, color: view === "dashboard" ? "#f7931a" : "#333" }}>◈</span>
        <span style={{ fontSize: 11, color: view === "dashboard" ? "#f7931a" : "#444", fontWeight: view === "dashboard" ? 600 : 400 }}>Dashboard</span>
      </button>
      <button onClick={onAdd} style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, #f7931a, #e07b10)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#000", fontWeight: 300, lineHeight: 1, boxShadow: "0 4px 20px rgba(247,147,26,0.35)" }}>+</button>
      <button onClick={() => setView("verlauf")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifySelf: "center" }}>
        <span style={{ fontSize: 20, color: view === "verlauf" ? "#f7931a" : "#333" }}>≡</span>
        <span style={{ fontSize: 11, color: view === "verlauf" ? "#f7931a" : "#444", fontWeight: view === "verlauf" ? 600 : 400 }}>Verlauf</span>
      </button>
    </div>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [btcUsd, setBtcUsd]             = useState(77664);
  const [usdChf, setUsdChf]             = useState(0.787);
  const [dayChangePct, setDayChangePct] = useState(1.25);
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

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf&include_24hr_change=true");
      const d = await r.json();
      if (d.bitcoin) { setBtcUsd(d.bitcoin.usd); setUsdChf(d.bitcoin.chf / d.bitcoin.usd); setDayChangePct(d.bitcoin.usd_24h_change ?? 0); setLastUpdated(new Date()); }
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
  const totalBtc      = buyTx.reduce((s, t) => s + +t.btc, 0) - sellTx.reduce((s, t) => s + +t.btc, 0) - trfTx.reduce((s, t) => s + +(t.fee || 0), 0);
  const totalInvested = buyTx.reduce((s, t) => s + +t.chf + +(t.fee || 0), 0) - sellTx.reduce((s, t) => s + +t.chf - +(t.fee || 0), 0);
  const portfolioChf  = totalBtc * btcChf;
  const pnlChf        = portfolioChf - totalInvested;
  const pnlPct        = totalInvested > 0 ? (pnlChf / totalInvested) * 100 : 0;
  const avgChf        = totalBtc > 0 ? totalInvested / totalBtc : 0;
  const avgUsd        = avgChf / usdChf;

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
        html { height: -webkit-fill-available; background: #000; }
        html, body { background: #000; color: #fff; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; min-height: -webkit-fill-available; overscroll-behavior: none; }
        button { font-family: inherit; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.25); cursor: pointer; }
        input { font-size: 16px !important; }
        input:focus { border-color: #333 !important; box-shadow: 0 0 0 1px #333; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#000" }}>
        <Header lastUpdated={lastUpdated} btcUsd={btcUsd} onRefresh={() => { fetchPrice(); fetchChart(); }} loading={loading} />
        {dbLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#444", fontSize: 15 }}>Lade Daten...</div>
        ) : (
          <>
            {view === "dashboard" && (
              <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch", paddingBottom: 100 }}>
                <PortfolioCard portfolioChf={portfolioChf} pnlChf={pnlChf} pnlPct={pnlPct} />
                <PositionCard totalBtc={totalBtc} portfolioChf={portfolioChf} totalInvested={totalInvested} avgChf={avgChf} />
                <MarketCard btcChf={btcChf} btcUsd={btcUsd} dayChangePct={dayChangePct} />
                <div style={{ padding: "0 12px" }}>
                  <PriceChart avgChf={avgChf} currentChf={btcChf} transactions={transactions} chartData={chartData} />
                  <BreakEvenCard avgChf={avgChf} currentChf={btcChf} />
                  <DcaCalculator totalBtc={totalBtc} totalInvested={totalInvested} avgChf={avgChf} currentChf={btcChf} usdChf={usdChf} />
                  <BarChart portfolioChf={portfolioChf} investedChf={totalInvested} />
                </div>
              </div>
            )}
            {view === "verlauf" && (
              <div style={{ padding: "0 16px", overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch", paddingBottom: 100 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", paddingTop: 4 }}>
                  {[["all", "Alle"], ...Object.entries(TYPE_META).map(([k, v]) => [k, v.label])].map(([id, label]) => (
                    <button key={id} onClick={() => setTxFilter(id)} style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: txFilter === id ? "#fff" : "#111", color: txFilter === id ? "#000" : "#666", border: `1px solid ${txFilter === id ? "#fff" : "#1f1f1f"}`, fontWeight: txFilter === id ? 500 : 400 }}>{label}</button>
                  ))}
                </div>
                {filteredTx.length === 0 && <div style={{ color: "#444", textAlign: "center", padding: "40px 0", fontSize: 15 }}>Keine Transaktionen</div>}
                {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} onDelete={handleDelete} onEdit={tx => { setEditTx(tx); setShowModal(true); }} />)}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav view={view} setView={setView} onAdd={() => { setEditTx(null); setShowModal(true); }} />
      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditTx(null); }} onSave={handleSave} editTx={editTx} />}
    </>
  );
}
