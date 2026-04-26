import { useState, useEffect, useCallback, useRef } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Auth Client ──────────────────────────────────────────────────────
const supabase = createClient(
  "https://xjkomserewmxktwvmoaa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa29tc2VyZXdteGt0d3Ztb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjEzNTMsImV4cCI6MjA5MjUzNzM1M30.4GVJpwwQUCwhFGgMPFFYr_H23RUbX_3TpRAYpbvy9Es"
);

// ── API (mit JWT Auth) ────────────────────────────────────────────────────────
const authHeaders = (token) => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

const api = {
  getAll: (token) => fetch("/api/transactions", { headers: authHeaders(token) }).then(r => r.json()),
  create: (tx, token) => fetch("/api/transactions", { method: "POST", headers: authHeaders(token), body: JSON.stringify(tx) }).then(r => r.json()),
  update: (tx, token) => fetch(`/api/transactions/${tx.id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(tx) }).then(r => r.json()),
  remove: (id, token) => fetch(`/api/transactions/${id}`, { method: "DELETE", headers: authHeaders(token) }).then(r => r.json()),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtChf = (n, d = 2) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsd = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtBtc = (n) => { const s = n.toFixed(6); return parseFloat(s).toString(); };

// ── Währungs-Konfiguration ────────────────────────────────────────────────────
const CURRENCIES = {
  CHF: { label: "CHF", symbol: "CHF", locale: "de-CH", rate: (usdChf) => usdChf },
  EUR: { label: "EUR", symbol: "EUR", locale: "de-DE", rate: (usdChf) => usdChf * 0.92 },
  USD: { label: "USD", symbol: "$",   locale: "en-US", rate: () => 1 },
};

const fmtCurrency = (n, currency, usdChf, d = 0) => {
  const cfg = CURRENCIES[currency];
  const rate = currency === "CHF" ? usdChf : currency === "EUR" ? usdChf * 0.92 : 1;
  const converted = n * (currency === "USD" ? 1 / usdChf : currency === "EUR" ? usdChf / (usdChf * 0.92) * usdChf * 0.92 / usdChf : 1);
  return new Intl.NumberFormat(cfg.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
};

// Konvertierung: CHF-Betrag in gewählte Währung
const toDisplay = (chfAmount, currency, usdChf, eurUsd = 0.92) => {
  if (currency === "CHF") return chfAmount;
  if (currency === "USD") return chfAmount / usdChf;
  if (currency === "EUR") return (chfAmount / usdChf) * eurUsd;
  return chfAmount;
};

const fmtAmt = (chfAmount, currency, usdChf, d = 0) => {
  const val = toDisplay(chfAmount, currency, usdChf, eurUsd);
  const cfg = CURRENCIES[currency];
  const formatted = new Intl.NumberFormat(cfg.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(val);
  return `${cfg.symbol} ${formatted}`;
};

const TYPE_META = {
  buy:      { label: "Kauf",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: "↓" },
  sell:     { label: "Verkauf",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: "↑" },
  transfer: { label: "Transfer", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "⇄" },
};

// ── Theme ─────────────────────────────────────────────────────────────────────
const DARK = {
  bg:        "#0f0f0f",
  surface:   "#1c1c1e",
  border:    "#3a3a3c",
  text:      "#ffffff",
  textSub:   "#d1d1d6",
  textMuted: "#98989f",
  textFaint: "#636366",
  input:     "#2c2c2e",
  inputBorder: "#48484a",
  navBg:     "rgba(18,18,18,0.97)",
  divider:   "#3a3a3c",
};

const LIGHT = {
  bg:        "#f2f2f7",
  surface:   "#fff",
  border:    "#e0e0e0",
  text:      "#000",
  textSub:   "#3a3a3a",
  textMuted: "#555",
  textFaint: "#888",
  input:     "#f5f5f5",
  inputBorder: "#d0d0d0",
  navBg:     "rgba(242,242,247,0.97)",
  divider:   "#e0e0e0",
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

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ T }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const iStyle = {
    width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
    color: T.text, padding: "14px 16px", borderRadius: 12, fontSize: 16,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    appearance: "none", WebkitAppearance: "none",
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || (!password && mode !== "reset")) { setError("Bitte alle Felder ausfüllen."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        if (password.length < 6) { throw new Error("Passwort muss mindestens 6 Zeichen haben."); }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Bestätigungsmail gesendet! Bitte E-Mail prüfen.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccess("Passwort-Reset E-Mail gesendet!");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const titles = { login: "Anmelden", register: "Konto erstellen", reset: "Passwort zurücksetzen" };
  const btnLabels = { login: "Anmelden", register: "Registrieren", reset: "Link senden" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: "#f7931a", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#000", boxShadow: "0 8px 24px rgba(247,147,26,0.35)", marginBottom: 16 }}>₿</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>BTC Portfolio</div>
          <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>Dein Bitcoin-Tracker</div>
        </div>

        {/* Card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 24 }}>{titles[mode]}</div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#ef4444", fontSize: 14 }}>{error}</div>
          )}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, color: "#22c55e", fontSize: 14 }}>{success}</div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.06em", marginBottom: 8 }}>E-MAIL</div>
            <input type="email" placeholder="name@beispiel.ch" value={email} onChange={e => setEmail(e.target.value)} style={iStyle} autoCapitalize="none" />
          </div>

          {mode !== "reset" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.06em", marginBottom: 8 }}>PASSWORT</div>
              <input type="password" placeholder={mode === "register" ? "Mindestens 6 Zeichen" : "••••••••"} value={password} onChange={e => setPassword(e.target.value)} style={iStyle}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "15px 0", background: loading ? T.textFaint : "#f7931a",
            border: "none", borderRadius: 12, color: "#000", fontSize: 16, fontWeight: 600,
            fontFamily: "inherit", cursor: loading ? "default" : "pointer", marginBottom: 16,
          }}>
            {loading ? "Bitte warten..." : btnLabels[mode]}
          </button>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Passwort vergessen?
                </button>
                <button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#f7931a", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  Noch kein Konto? Registrieren
                </button>
              </>
            )}
            {(mode === "register" || mode === "reset") && (
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                ← Zurück zur Anmeldung
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ lastUpdated, btcUsd, onRefresh, loading, T }) {
  const t = lastUpdated ? lastUpdated.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, background: "#f7931a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#000", flexShrink: 0, boxShadow: "0 4px 12px rgba(247,147,26,0.3)" }}>₿</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>Portfolio</div>
          <div style={{ fontSize: 11, color: T.textFaint, marginTop: 1 }}>Aktualisiert {t}</div>
        </div>
      </div>
      <button onClick={onRefresh} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <span style={{ fontSize: 13, color: T.textMuted, display: "inline-block", animation: loading ? "spin 1s linear infinite" : "none" }}>↻</span>
        <span style={{ fontSize: 13, color: T.textMuted }}>Aktualisieren</span>
      </button>
    </div>
  );
}

// ── Portfolio Card ─────────────────────────────────────────────────────────────
function PortfolioCard({ portfolioChf, pnlChf, pnlPct, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, buildPortfolioChart, hasRealData }) {
  const sym = CURRENCIES[currency].symbol;
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("portfolioTab") || "7D"; } catch { return "7D"; }
  });
  // Echter Chart wenn Daten vorhanden, sonst Demo-Daten
  const realData = hasRealData ? buildPortfolioChart(activeTab) : null;
  const data = (realData && realData.length > 1) ? realData : PORTFOLIO_CHART_DATA[activeTab];
  const isNeg = pnlChf < 0;
  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ color: T.textMuted, fontSize: 13 }}>Gesamtwert</div>
          <div style={{ display: "flex", gap: 2, background: T.input, borderRadius: 10, padding: 3 }}>
            {["1D", "7D", "30D", "ALL"].map(t => (
              <button key={t} onClick={() => { setActiveTab(t); try { localStorage.setItem("portfolioTab", t); } catch {} }} style={{ padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: activeTab === t ? T.surface : "transparent", color: activeTab === t ? T.text : T.textFaint, boxShadow: activeTab === t ? `0 1px 3px rgba(0,0,0,0.1)` : "none" }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <span style={{ fontSize: 22, fontWeight: 500, color: T.textMuted, marginRight: 3 }}>{sym}</span>
          {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toDisplay(portfolioChf, currency, usdChf, eurUsd))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 20 }}>
          <span style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 14, fontWeight: 500 }}>
            {isNeg ? "↓" : "↑"} {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toDisplay(Math.abs(pnlChf), currency, usdChf))} {sym} ({isNeg ? "" : "+"}{pnlPct.toFixed(2)}%)
          </span>
          <span style={{ color: T.textFaint, fontSize: 13 }}>seit Kauf</span>
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
            <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text }} labelStyle={{ color: T.textMuted }} itemStyle={{ color: T.text, fontWeight: 500 }} formatter={(v) => [`${CURRENCIES[currency].symbol} ${new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd))}`, ""]} />
            <Area type="monotone" dataKey="v" stroke={isNeg ? "#ef4444" : "#22c55e"} strokeWidth={2} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4, fill: isNeg ? "#ef4444" : "#22c55e" }} />
          </AreaChart>
        </ResponsiveContainer>
        {(() => {
          const vals = data.map(d => d.v);
          const mn = Math.min(...vals), mx = Math.max(...vals), mid = Math.round((mn + mx) / 2);
          return (
            <div style={{ position: "absolute", right: 8, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", padding: "8px 0" }}>
              {[mx, mid, mn].map(v => (<span key={v} style={{ fontSize: 11, color: T.textMuted, textAlign: "right", fontWeight: 500 }}>{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd))}</span>))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Position Card ─────────────────────────────────────────────────────────────
function PositionCard({ totalBtc, portfolioChf, totalInvested, avgChf, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const sym = CURRENCIES[currency].symbol;
  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 20px" }}>
      <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>Deine Position</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ borderRight: `1px solid ${T.divider}`, paddingRight: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>Bestand</div>
          <div style={{ color: T.text, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{fmtBtc(totalBtc)} <span style={{ fontSize: 13, fontWeight: 400, color: T.textSub }}>BTC</span></div>
          <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>≈ {sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(portfolioChf, currency, usdChf, eurUsd))}</div>
        </div>
        <div style={{ paddingLeft: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>Investiert</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(totalInvested, currency, usdChf, eurUsd))}</div>
          </div>
          <div>
            <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>Einstandspreis</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(avgChf, currency, usdChf, eurUsd))}</div>
            <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>pro BTC</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Market Card mit Live Chart ────────────────────────────────────────────────
function MarketCard({ btcChf, btcUsd, dayChangePct, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const sym = CURRENCIES[currency].symbol;
  const btcDisplay = toDisplay(btcChf, currency, usdChf, eurUsd);
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("marketTab") || "1T"; } catch { return "1T"; }
  });
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const isPos = dayChangePct >= 0;
  const color = isPos ? "#22c55e" : "#ef4444";
  const TABS = ["1T", "1W", "1M", "3M", "6M", "1J"];

  const fetchMarketChart = useCallback(async (tab) => {
    setLoadingChart(true);
    setChartData([]); // reset while loading
    try {
      const daysMap = { "1T": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1J": 365 };
      const days = daysMap[tab];
      const r = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=chf&days=${days}`);
      const d = await r.json();
      if (!d.prices?.length) { setLoadingChart(false); return; }
      const formatted = d.prices.map(([ts, price]) => {
        const dt = new Date(ts);
        let label;
        if (days === 1) label = dt.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
        else if (days <= 7) label = dt.toLocaleDateString("de-CH", { weekday: "short" });
        else label = dt.toLocaleDateString("de-CH", { day: "numeric", month: "short" });
        return { t: label, v: Math.round(price) };
      });
      const step = Math.max(1, Math.floor(formatted.length / 60));
      setChartData(formatted.filter((_, i) => i % step === 0 || i === formatted.length - 1));
    } catch (e) { console.error("Chart fetch failed:", e); }
    setLoadingChart(false);
  }, []);

  useEffect(() => {
    fetchMarketChart(activeTab);
    // Retry after 3s if rate limited
    const retry = setTimeout(() => {
      setChartData(prev => prev.length === 0 ? prev : prev);
      fetchMarketChart(activeTab);
    }, 3000);
    return () => clearTimeout(retry);
  }, [activeTab, fetchMarketChart]);

  const vals = chartData.map(d => d.v);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 0;
  const midV = Math.round((minV + maxV) / 2);
  const xTicks = chartData.filter((_, i) => { const n = chartData.length; if (n <= 8) return true; return i % Math.floor(n / 5) === 0 || i === n - 1; }).map(d => d.t);

  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "#f7931a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#000", flexShrink: 0 }}>₿</div>
            <span style={{ color: T.textSub, fontSize: 14 }}>Bitcoin (BTC)</span>
          </div>
          <div style={{ background: isPos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
            <span>{isPos ? "▲" : "▼"}</span>{Math.abs(dayChangePct).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(btcDisplay)}</div>
        {currency === "CHF" && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3, marginBottom: 14 }}>${fmtUsd(btcUsd)}</div>}
        {currency === "EUR" && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3, marginBottom: 14 }}>${fmtUsd(btcUsd)}</div>}
        {currency === "USD" && <div style={{ marginBottom: 14 }} />}
        <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.divider}`, paddingBottom: 12 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setActiveTab(t); try { localStorage.setItem("marketTab", t); } catch {} }} style={{ flex: 1, padding: "5px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", background: activeTab === t ? T.input : "transparent", color: activeTab === t ? T.text : T.textFaint }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ height: 160, position: "relative" }}>
        {loadingChart ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.textFaint, fontSize: 13 }}>Lade...</div>
        ) : chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 52, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" ticks={xTicks} />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: T.textMuted }} itemStyle={{ color: T.text }} formatter={(v) => [`CHF ${fmtChf(v, 0)}`, ""]} />
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="url(#marketGrad)" dot={false} activeDot={{ r: 3, fill: color }} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", right: 6, top: 8, bottom: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[maxV, midV, minV].map(v => (<span key={v} style={{ fontSize: 10, color: T.textMuted, textAlign: "right" }}>{fmtChf(v, 0)}</span>))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Analyse Charts ─────────────────────────────────────────────────────────────
function PriceChart({ avgChf, currentChf, transactions, chartData, T }) {
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
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em" }}>KURSVERLAUF VS. EINSTAND</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#f59e0b", borderRadius: 1 }} /><span style={{ color: T.textMuted, fontSize: 12 }}>Einstand</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} /><span style={{ color: T.textMuted, fontSize: 12 }}>Kauf</span></div>
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
        {yTicks.map(t => (<g key={t.v}><line x1={PAD_L} y1={t.y} x2={PAD_L + cw} y2={t.y} stroke={T.border} strokeWidth="1" /><text x={PAD_L - 6} y={t.y + 4} fill={T.textMuted} fontSize="9" textAnchor="end">{t.label}</text></g>))}
        {xTicks.map(t => (<text key={t.i} x={xScale(t.i)} y={H - 4} fill={T.textFaint} fontSize="8" textAnchor="middle">{t.label.slice(2)}</text>))}
        <polygon points={areaPoints} fill="url(#areaGrad)" clipPath="url(#chartClip)" />
        <polyline points={linePoints} fill="none" stroke={isAbove ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinejoin="round" clipPath="url(#chartClip)" opacity="0.9" />
        {avgChf >= minP && avgChf <= maxP && (<g><line x1={PAD_L} y1={avgY} x2={PAD_L + cw} y2={avgY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" /><text x={PAD_L + cw + 2} y={avgY + 4} fill="#f59e0b" fontSize="8">{Math.round(avgChf / 1000)}k</text></g>)}
        {buyMarkers.map((m, i) => (<g key={i}><circle cx={m.x} cy={m.y} r="4" fill="#22c55e" opacity="0.85" /><circle cx={m.x} cy={m.y} r="7" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" /></g>))}
        {tooltip && (<g><line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + ch} stroke={T.textFaint} strokeWidth="1" strokeDasharray="3 3" /><circle cx={tooltip.x} cy={tooltip.y} r="4" fill={T.text} opacity="0.95" /></g>)}
      </svg>
      <div style={{ marginTop: 10, padding: "10px 14px", background: T.input, borderRadius: 8, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40 }}>
        {tooltip ? (<><span style={{ color: T.textMuted, fontSize: 13 }}>{tooltip.label}</span><span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>CHF {fmtChf(tooltip.price, 0)}</span></>) : (<><span style={{ color: T.textFaint, fontSize: 13 }}>Finger ziehen zum Ablesen</span><span style={{ color: T.textMuted, fontSize: 13 }}>CHF {fmtChf(currentChf, 0)}</span></>)}
      </div>
    </div>
  );
}

function BreakEvenCard({ avgChf, currentChf, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const sym = CURRENCIES[currency].symbol;
  const fmt = (v) => `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd))}`;
  const diff = currentChf - avgChf;
  const diffPct = avgChf > 0 ? (diff / avgChf) * 100 : 0;
  const isAbove = diff >= 0;
  const toBreakEvenPct = avgChf > 0 ? ((avgChf - currentChf) / currentChf) * 100 : 0;
  const ratio = Math.max(-1, Math.min(1, diff / (avgChf * 0.8)));
  const R = 54, cx = 80, cy = 72;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcPath = (s, e, r) => { const sr = toRad(s - 90), er = toRad(e - 90); const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr), x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er); return `M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`; };
  const needleAngle = isAbove ? ratio * 90 : -90 + (ratio + 1) * 90;
  const nRad = toRad(needleAngle - 90);
  const nx = cx + (R - 6) * Math.cos(nRad), ny = cy + (R - 6) * Math.sin(nRad);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>BREAK-EVEN ANALYSE</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg viewBox="0 0 160 88" style={{ width: 160, flexShrink: 0 }}>
          <path d={arcPath(-90, 0, R)} fill="none" stroke={isAbove ? "rgba(239,68,68,0.2)" : "#ef4444"} strokeWidth="10" strokeLinecap="round" opacity={isAbove ? 1 : 0.85} />
          <path d={arcPath(0, 90, R)} fill="none" stroke={isAbove ? "#22c55e" : "rgba(34,197,94,0.2)"} strokeWidth="10" strokeLinecap="round" opacity={isAbove ? 0.85 : 1} />
          <line x1={cx} y1={cy - R + 5} x2={cx} y2={cy - R + 14} stroke={T.border} strokeWidth="1.5" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={T.text} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <circle cx={cx} cy={cy} r="4" fill={T.surface} stroke={T.textFaint} strokeWidth="1.5" />
          <text x={cx - R - 2} y={cy + 10} fill={T.textFaint} fontSize="8" textAnchor="middle">-80%</text>
          <text x={cx + R + 2} y={cy + 10} fill={T.textFaint} fontSize="8" textAnchor="middle">+80%</text>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>AKTUELL VS. EINSTAND</div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 22, fontWeight: 300 }}>{isAbove ? "+" : ""}{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(diff, currency, usdChf, eurUsd))}<span style={{ fontSize: 14, marginLeft: 4, opacity: 0.7 }}>{sym}</span></div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 14, opacity: 0.7, marginTop: 3 }}>{isAbove ? "+" : ""}{diffPct.toFixed(1)}%</div>
          </div>
          <div style={{ background: isAbove ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isAbove ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "10px 12px" }}>
            {isAbove ? (<><div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>IM GEWINN SEIT</div><div style={{ color: "#22c55e", fontSize: 17 }}>{fmt(avgChf)}</div></>) : (<><div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>BTC MUSS STEIGEN UM</div><div style={{ color: "#ef4444", fontSize: 17 }}>+{toBreakEvenPct.toFixed(1)}%</div><div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>auf {fmt(avgChf)}</div></>)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: T.textMuted, fontSize: 12 }}>Einstand {fmt(avgChf)}</span><span style={{ color: T.textMuted, fontSize: 12 }}>Aktuell {fmt(currentChf)}</span></div>
        <div style={{ height: 4, background: T.input, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, Math.max(2, (currentChf / (avgChf * 1.5)) * 100))}%`, background: isAbove ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#991b1b,#ef4444)", borderRadius: 2 }} /></div>
      </div>
    </div>
  );
}

function DcaCalculator({ totalBtc, totalInvested, avgChf, currentChf, usdChf, T, currency = "CHF", eurUsd = 0.92 }) {
  const sym = CURRENCIES[currency].symbol;
  const fmt = (v) => `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd))}`;
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
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none" };
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 20px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>DCA-RECHNER</div>
      <div style={{ display: "flex", background: T.input, borderRadius: 10, padding: 3, marginBottom: 16, gap: 3 }}>
        {[["chf", `Betrag (${sym})`], ["btc", "Menge (BTC)"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setInput(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "inherit", background: mode === m ? T.surface : "transparent", color: mode === m ? T.text : T.textMuted, border: "none", fontWeight: mode === m ? 500 : 400 }}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{mode === "chf" ? `KAUFBETRAG (${sym})` : "BTC MENGE"}</div><input type="number" step="any" placeholder={mode === "chf" ? "z.B. 500" : "z.B. 0.005"} inputMode="decimal" value={input} onChange={e => setInput(e.target.value)} style={iStyle} /></div>
        <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>GEBÜHREN ({sym})</div><input type="number" step="any" placeholder="0" value={feeInput} onChange={e => setFeeInput(e.target.value)} style={iStyle} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: hasInput ? 14 : 0 }}>
        <div style={{ background: T.input, borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 6 }}>AKTUELLER EINSTAND</div>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 300 }}>{fmt(avgChf)}</div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>${fmtChf(avgChf / usdChf, 0)}</div>
        </div>
        <div style={{ background: hasInput ? (newAvgChf < avgChf ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)") : T.input, border: hasInput ? `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` : `1px solid transparent`, borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 6 }}>NEUER EINSTAND</div>
          <div style={{ color: hasInput ? (newAvgChf < avgChf ? "#22c55e" : "#ef4444") : T.textFaint, fontSize: 18, fontWeight: 300 }}>{hasInput ? fmt(newAvgChf) : "—"}</div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>{hasInput ? `$${fmtChf(newAvgUsd, 0)}` : ""}</div>
        </div>
      </div>
      {hasInput && (
        <div style={{ background: newAvgChf < avgChf ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[{ label: "EINSTAND Δ", val: `${avgDrop > 0 ? "+" : ""}${avgDrop.toFixed(1)}%`, color: avgDrop < 0 ? "#22c55e" : "#ef4444" }, { label: "GEKAUFT", val: `${fmtBtc(newBtc)} BTC`, color: T.text }, { label: "GESAMT BTC", val: fmtBtc(newTotalBtc), color: T.text }].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: "center" }}><div style={{ color: T.textMuted, fontSize: 11, marginBottom: 5 }}>{label}</div><div style={{ color, fontSize: 14, fontWeight: 500 }}>{val}</div></div>
            ))}
          </div>
        </div>
      )}
      {!hasInput && <div style={{ color: T.textFaint, fontSize: 13, textAlign: "center", paddingTop: 4 }}>Betrag eingeben um Einstandsänderung zu sehen</div>}
    </div>
  );
}

function BarChart({ portfolioChf, investedChf, T }) {
  const max = Math.max(portfolioChf, investedChf, 1) * 1.2;
  const steps = [0, 25000, 50000, 75000, 100000].filter(v => v <= max);
  const bars = [{ label: "Portfolio", value: portfolioChf, color: "#ef4444" }, { label: "Investiert", value: investedChf, color: "#3b82f6" }];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 20 }}>VERGLEICH</div>
      <div style={{ display: "flex", alignItems: "flex-end", height: 180, position: "relative" }}>
        {steps.map(v => (<div key={v} style={{ position: "absolute", left: 32, right: 0, bottom: `${(v / max) * 100}%`, borderTop: `1px solid ${T.border}` }}><span style={{ position: "absolute", left: -30, bottom: 2, color: T.textMuted, fontSize: 10 }}>{v >= 1000 ? `${v / 1000}k` : v}</span></div>))}
        <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "flex-end", paddingLeft: 36, height: "100%" }}>
          {bars.map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ color: T.textMuted, fontSize: 11 }}>{fmtChf(value, 0)}</div>
              <div style={{ width: "100%", height: `${Math.max((value / max) * 148, 2)}px`, background: color, borderRadius: "6px 6px 2px 2px", opacity: 0.8 }} />
              <div style={{ color: T.textSub, fontSize: 12 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingScreen({ onFinish, T }) {
  const [slide, setSlide] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const privacyContent = [
    { title: "Was gespeichert wird", text: "Deine E-Mail-Adresse (für Login) sowie deine erfassten Transaktionen: Datum, BTC-Menge, Betrag, Gebühren und Notiz." },
    { title: "Wo", text: "Alle Daten werden verschlüsselt in der EU gespeichert — auf AWS-Servern in Irland (eu-west-1), betrieben über Supabase." },
    { title: "Wer hat Zugriff", text: "Nur du. Dank Row-Level Security sieht ausschliesslich dein Account deine Daten." },
    { title: "Löschen", text: "Du kannst dein Konto und alle Daten jederzeit unter Einstellungen → Konto löschen vollständig entfernen." },
    { title: "Kontakt", text: "support [at] bluebubble [dot] ch" },
  ];
  const slides = [
    {
      icon: "₿",
      iconBg: "#f7931a",
      title: "Willkommen bei BTC Portfolio Tracker",
      text: "Dein persönlicher Bitcoin-Portfolio-Tracker. Behalte den Überblick über deine Investitionen — jederzeit und überall.",
    },
    {
      icon: "chart",
      iconBg: null,
      title: "Portfolio tracken",
      text: "Erfasse Käufe, Verkäufe und Transfers. Die App berechnet deinen Einstandspreis und zeigt dir deinen Gewinn in Echtzeit.",
    },
    {
      icon: "analyse",
      iconBg: null,
      title: "Tiefe Analysen",
      text: "Break-Even Analyse, DCA-Rechner und Preis-Charts helfen dir, bessere Entscheidungen zu treffen.",
    },
    {
      icon: "currency",
      iconBg: null,
      title: "Deine Währung",
      text: "Wähle zwischen CHF, EUR und USD. Alle Beträge werden automatisch umgerechnet — mit Live-Wechselkursen.",
    },
    {
      icon: "privacy",
      iconBg: null,
      title: "Datenschutz",
      text: "Deine Daten gehören dir. Alles wird verschlüsselt in der EU gespeichert — du kannst dein Konto jederzeit vollständig löschen.",
    },
  ];
  const s = slides[slide];
  const isLast = slide === slides.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
      {/* Slide content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 32 }}>
          {slide === 0 && (
            <svg viewBox="0 0 280 120" width="260" style={{ display: "block" }}>
              <rect x="90" y="10" width="100" height="100" rx="26" fill="#f7931a"/>
              <text x="140" y="78" textAnchor="middle" fontSize="56" fontWeight="800" fill="#000">₿</text>
              <circle cx="55" cy="30" r="20" fill="#fef3e0" stroke="#f7931a" strokeWidth="1"/>
              <text x="55" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#BA7517">CHF</text>
              <circle cx="225" cy="30" r="20" fill="#e8f4ff" stroke="#378ADD" strokeWidth="1"/>
              <text x="225" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#185FA5">USD</text>
              <circle cx="55" cy="90" r="20" fill="#eaf3de" stroke="#639922" strokeWidth="1"/>
              <text x="55" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3B6D11">EUR</text>
              <line x1="75" y1="30" x2="90" y2="55" stroke="#f7931a" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
              <line x1="205" y1="30" x2="190" y2="55" stroke="#378ADD" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
              <line x1="75" y1="90" x2="90" y2="88" stroke="#639922" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
            </svg>
          )}
          {slide === 1 && (
            <svg viewBox="0 0 280 160" width="280" style={{ display: "block" }}>
              <rect x="80" y="4" width="120" height="152" rx="20" fill={T.surface} stroke={T.border} strokeWidth="1"/>
              <rect x="92" y="16" width="96" height="10" rx="5" fill={T.border}/>
              <text x="140" y="52" textAnchor="middle" fontSize="11" fill={T.textFaint}>Portfolio</text>
              <text x="140" y="74" textAnchor="middle" fontSize="22" fontWeight="700" fill={T.text}>61'200</text>
              <text x="140" y="74" textAnchor="middle" fontSize="11" fill={T.textMuted} dy="-28">CHF</text>
              <text x="140" y="92" textAnchor="middle" fontSize="12" fill="#22c55e">↑ +28.4%</text>
              <rect x="96" y="106" width="88" height="8" rx="4" fill="#22c55e" opacity="0.15"/>
              <rect x="96" y="106" width="64" height="8" rx="4" fill="#22c55e" opacity="0.75"/>
              <rect x="88" y="130" width="22" height="7" rx="3" fill={T.border}/>
              <rect x="116" y="130" width="22" height="7" rx="3" fill="#f7931a" opacity="0.85"/>
              <rect x="144" y="130" width="22" height="7" rx="3" fill={T.border}/>
              <rect x="172" y="130" width="22" height="7" rx="3" fill={T.border}/>
              <circle cx="32" cy="60" r="26" fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth="1.5"/>
              <text x="32" y="54" textAnchor="middle" fontSize="10" fill="#3B6D11">Kauf</text>
              <text x="32" y="68" textAnchor="middle" fontSize="13" fontWeight="600" fill="#27500A">+0.25</text>
              <text x="32" y="80" textAnchor="middle" fontSize="9" fill="#3B6D11">BTC</text>
              <line x1="58" y1="62" x2="80" y2="72" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
              <circle cx="248" cy="100" r="26" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth="1.5"/>
              <text x="248" y="94" textAnchor="middle" fontSize="10" fill="#991b1b">Verkauf</text>
              <text x="248" y="108" textAnchor="middle" fontSize="13" fontWeight="600" fill="#7f1d1d">−0.1</text>
              <text x="248" y="120" textAnchor="middle" fontSize="9" fill="#991b1b">BTC</text>
              <line x1="200" y1="100" x2="222" y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" opacity="0.6"/>
            </svg>
          )}
          {slide === 2 && (
            <svg viewBox="0 0 280 160" width="280" style={{ display: "block" }}>
              <rect x="14" y="10" width="252" height="130" rx="18" fill={T.surface} stroke={T.border} strokeWidth="1"/>
              <polyline points="30,120 65,100 100,108 135,75 168,82 202,45 235,52 262,24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
              <line x1="162" y1="10" x2="162" y2="140" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8"/>
              <text x="168" y="30" fontSize="11" fontWeight="500" fill="#BA7517">Break-Even</text>
              <circle cx="202" cy="45" r="5" fill="#22c55e"/>
              <circle cx="262" cy="24" r="5" fill="#22c55e"/>
              <circle cx="262" cy="24" r="9" fill="#22c55e" opacity="0.2"/>
              <rect x="22" y="16" width="70" height="24" rx="8" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1"/>
              <text x="57" y="32" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3B6D11">+28.4%</text>
              <rect x="22" y="118" width="36" height="14" rx="4" fill={T.input}/>
              <rect x="64" y="118" width="36" height="14" rx="4" fill={T.input}/>
              <rect x="106" y="118" width="36" height="14" rx="4" fill={T.input}/>
              <rect x="148" y="118" width="36" height="14" rx="4" fill={T.input}/>
              <rect x="22" y="118" width="36" height="14" rx="4" fill="#f7931a" opacity="0.8"/>
            </svg>
          )}
          {slide === 3 && (
            <svg viewBox="0 0 280 120" width="260" style={{ display: "block" }}>
              <line x1="55" y1="60" x2="225" y2="60" stroke={T.border} strokeWidth="0.5"/>
              <circle cx="55" cy="60" r="38" fill="#fef3e0" stroke="#f7931a" strokeWidth="1.5"/>
              <text x="55" y="70" textAnchor="middle" fontSize="30" fontWeight="700" fill="#BA7517">₣</text>
              <circle cx="140" cy="60" r="38" fill="#eeedfe" stroke="#534AB7" strokeWidth="1.5"/>
              <text x="140" y="70" textAnchor="middle" fontSize="30" fontWeight="700" fill="#3C3489">€</text>
              <circle cx="225" cy="60" r="38" fill="#e8f4ff" stroke="#185FA5" strokeWidth="1.5"/>
              <text x="225" y="70" textAnchor="middle" fontSize="30" fontWeight="700" fill="#185FA5">$</text>
            </svg>
          )}
          {slide === 4 && (
            <svg viewBox="0 0 280 120" width="260" style={{ display: "block" }}>
              <rect x="30" y="20" width="220" height="80" rx="16" fill={T.surface} stroke={T.border} strokeWidth="0.5"/>
              <rect x="46" y="36" width="60" height="8" rx="4" fill={T.border}/>
              <rect x="46" y="52" width="100" height="8" rx="4" fill={T.border}/>
              <rect x="46" y="68" width="80" height="8" rx="4" fill={T.border}/>
              <circle cx="220" cy="36" r="12" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
              <text x="220" y="40" textAnchor="middle" fontSize="12" fontWeight="700" fill="#27500A">✓</text>
              <circle cx="220" cy="60" r="12" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
              <text x="220" y="64" textAnchor="middle" fontSize="12" fontWeight="700" fill="#27500A">✓</text>
              <circle cx="220" cy="84" r="12" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1"/>
              <text x="220" y="88" textAnchor="middle" fontSize="12" fontWeight="700" fill="#27500A">✓</text>
              <rect x="30" y="20" width="220" height="80" rx="16" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4"/>
            </svg>
          )}
        </div>
        <div style={{ color: T.text, fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 16, lineHeight: 1.2 }}>{s.title}</div>
        <div style={{ color: T.textMuted, fontSize: 16, textAlign: "center", lineHeight: 1.6 }}>{s.text}</div>
      </div>
      {/* Dots */}
      {slide === 4 && (
        <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: "#f7931a", fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 8, textDecoration: "underline" }}>
          Vollständige Datenschutzerklärung lesen
        </button>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 24 : 8, height: 8, borderRadius: 4, background: i === slide ? "#f7931a" : T.border, cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
      {/* Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: isLast ? "1fr" : "1fr 2fr", gap: 12, width: "100%", maxWidth: 360 }}>
        {!isLast && (
          <button onClick={onFinish} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 14, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Überspringen</button>
        )}
        <button onClick={() => isLast ? onFinish() : setSlide(s => s + 1)} style={{ padding: "15px 0", background: "#f7931a", border: "none", color: "#000", borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>
          {isLast ? "Loslegen 🚀" : "Weiter →"}
        </button>
      </div>
    {showPrivacy && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowPrivacy(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Datenschutzerklärung</div>
          {privacyContent.map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>Schliessen</button>
        </div>
      </div>
    )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsView({ darkMode, setDarkMode, T, transactions, userEmail, onLogout, currency = "CHF", setCurrency, usdChf = 0.9, eurUsd = 0.92, btcChf = 0, btcUsd = 0, onResetOnboarding }) {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);



  return (
    <>
    <div style={{ padding: "8px 16px", overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", paddingBottom: 100 }}>

      {/* KONTO */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>KONTO</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ color: T.textMuted, fontSize: 14 }}>Eingeloggt als</span>
          <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{userEmail}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>Passwort ändern</span>
          <button onClick={() => setShowPwModal(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
        <div style={{ padding: "4px 0" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", color: "#ef4444", fontSize: 15, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>Abmelden</button>
        </div>
      </div>

      {/* PORTFOLIO */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 4, marginTop: 24 }}>PORTFOLIO-WÄHRUNG</div>
      <div style={{ color: T.textFaint, fontSize: 12, marginBottom: 8 }}>Alle Beträge werden in dieser Währung angezeigt und erfasst</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {["CHF", "EUR", "USD"].map((c, i) => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding: "14px 0", background: currency === c ? "#f7931a" : "none", border: "none", borderRight: i < 2 ? `1px solid ${T.border}` : "none", color: currency === c ? "#000" : T.textMuted, fontSize: 15, fontWeight: currency === c ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
          ))}
        </div>
      </div>

      {/* DARSTELLUNG */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>DARSTELLUNG</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px" }}>
          <div>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 500 }}>{darkMode ? "Dark Mode" : "Light Mode"}</div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{darkMode ? "Dunkles Design aktiv" : "Helles Design aktiv"}</div>
          </div>
          <div onClick={() => setDarkMode(!darkMode)} style={{ width: 51, height: 31, borderRadius: 16, cursor: "pointer", background: darkMode ? "#f7931a" : "#e0e0e0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
            <div style={{ width: 27, height: 27, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: darkMode ? 22 : 2, transition: "left 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </div>

      {/* APP INFO */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>APP INFO</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        {[{ label: "Version", value: "1.5.0" }, { label: "Datenbank", value: "Supabase" }, { label: "Kurs-API", value: "CoinGecko" }].map(({ label, value }, i, arr) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ color: T.text, fontSize: 15 }}>{label}</span>
            <span style={{ color: T.textMuted, fontSize: 15 }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>Datenschutzerklärung</span>
          <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>Einführung nochmals zeigen</span>
          <button onClick={onResetOnboarding} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
      </div>

      {/* GEFAHRENZONE */}
      <div style={{ color: "#ef4444", fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 32 }}>KONTO LÖSCHEN</div>
      <div style={{ background: T.surface, border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <span style={{ color: "#ef4444", fontSize: 15 }}>Konto löschen</span>
          <button onClick={() => setShowDeleteModal(true)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
      </div>

    </div>
    {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} T={T} />}
    {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} onLogout={onLogout} T={T} />}
    {showPrivacy && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowPrivacy(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Datenschutzerklärung</div>
          {[
            { title: "Was gespeichert wird", text: "Deine E-Mail-Adresse (für Login) sowie deine erfassten Transaktionen: Datum, BTC-Menge, Betrag, Gebühren und Notiz." },
            { title: "Wo", text: "Alle Daten werden verschlüsselt in der EU gespeichert — auf AWS-Servern in Irland (eu-west-1), betrieben über Supabase." },
            { title: "Wer hat Zugriff", text: "Nur du. Dank Row-Level Security sieht ausschliesslich dein Account deine Daten." },
            { title: "Löschen", text: "Du kannst dein Konto und alle Daten jederzeit unter Einstellungen → Konto löschen vollständig entfernen." },
            { title: "Kontakt", text: "support [at] bluebubble [dot] ch" },
          ].map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>Schliessen</button>
        </div>
      </div>
    )}
    </>
  );
}

// ── Password Modal ────────────────────────────────────────────────────────────
function PasswordModal({ onClose, T }) {
  const [pwForm, setPwForm] = useState({ next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwError, setPwError] = useState("");
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  const handleSave = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwError("Passwörter stimmen nicht überein."); return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Mindestens 6 Zeichen erforderlich."); return;
    }
    setPwStatus("saving"); setPwError("");
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) {
      setPwError(error.message); setPwStatus("error");
    } else {
      setPwStatus("ok");
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Passwort ändern</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>NEUES PASSWORT</div>
          <input type="password" placeholder="Mindestens 6 Zeichen" value={pwForm.next} onChange={e => setPw("next", e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>PASSWORT BESTÄTIGEN</div>
          <input type="password" placeholder="Wiederholen" value={pwForm.confirm} onChange={e => setPw("confirm", e.target.value)} style={iStyle} />
        </div>
        {pwError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{pwError}</div>}
        {pwStatus === "ok" && <div style={{ color: "#22c55e", fontSize: 13, marginBottom: 14 }}>✓ Passwort erfolgreich geändert</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Abbrechen</button>
          <button onClick={handleSave} disabled={pwStatus === "saving"} style={{ padding: "15px 0", background: pwStatus === "saving" ? T.textFaint : "#f7931a", border: "none", color: "#000", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {pwStatus === "saving" ? "Wird gespeichert..." : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onLogout, T }) {
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const confirmed = confirm === "LÖSCHEN";

  const handleDelete = async () => {
    if (!confirmed) return;
    setStatus("saving"); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/transactions/account", { method: "DELETE", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      await supabase.auth.signOut();
      onLogout();
    } catch (e) {
      setError("Fehler: " + e.message); setStatus("error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⚠️</div>
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>Konto löschen?</div>
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 16 }}>Alle Transaktionen und Kontodaten werden unwiderruflich gelöscht.</div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 20, padding: "10px 16px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>Tippe <strong style={{ color: "#ef4444" }}>LÖSCHEN</strong> zur Bestätigung</div>
          <input type="text" placeholder="LÖSCHEN" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", background: T.input, border: `1px solid ${confirmed ? "#ef4444" : T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Abbrechen</button>
          <button onClick={handleDelete} disabled={!confirmed || status === "saving"} style={{ padding: "15px 0", background: confirmed ? "#ef4444" : T.textFaint, border: "none", color: "#fff", borderRadius: 12, cursor: confirmed ? "pointer" : "default", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {status === "saving" ? "Wird gelöscht..." : "Konto löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Transaction Modal ─────────────────────────────────────────────────────────
function TransactionModal({ onClose, onSave, editTx, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const sym = CURRENCIES[currency].symbol;
  // Wenn editTx, zeige gespeicherten CHF-Wert in gewählter Währung
  const chfToDisplay = (v) => currency === "CHF" ? v : currency === "USD" ? v / usdChf : (v / usdChf) * eurUsd;
  const displayToChf = (v) => currency === "CHF" ? v : currency === "USD" ? v * usdChf : (v / eurUsd) * usdChf;
  const blank = { date: new Date().toISOString().slice(0, 10), btc: "", chf: "", fee: "", type: "buy", note: "" };
  const [form, setForm] = useState(editTx ? { ...editTx, btc: String(editTx.btc), chf: String(parseFloat(chfToDisplay(editTx.chf).toFixed(2))), fee: String(parseFloat(chfToDisplay(editTx.fee ?? 0).toFixed(2))) } : blank);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isTransfer = form.type === "transfer";
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none" };
  const handleSave = async () => {
    if (!form.btc) return;
    setSaving(true);
    // Immer in CHF speichern
    const chfAmount = isTransfer ? 0 : displayToChf(+form.chf || 0);
    const chfFee = displayToChf(+form.fee || 0);
    await onSave({ ...form, btc: +form.btc, chf: chfAmount, fee: chfFee });
    setSaving(false);
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderRadius: "20px 20px 0 0", padding: "12px 20px 40px", width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ color: T.text, fontSize: 19, fontWeight: 500, marginBottom: 20 }}>{editTx ? "Transaktion bearbeiten" : "Neue Transaktion"}</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>TYP</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {Object.entries(TYPE_META).map(([t, m]) => (<button key={t} onClick={() => set("type", t)} style={{ padding: "12px 0", borderRadius: 10, background: form.type === t ? m.bg : T.input, border: `1px solid ${form.type === t ? m.color + "55" : T.inputBorder}`, color: form.type === t ? m.color : T.textMuted, cursor: "pointer", fontSize: 15, fontWeight: 500, fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}><span style={{ fontSize: 19 }}>{m.icon}</span>{m.label}</button>))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>DATUM</div>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={iStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>BTC MENGE</div><input type="number" placeholder="z.B. 0.005" inputMode="decimal" value={form.btc} onChange={e => set("btc", e.target.value)} style={iStyle} step="any" /></div>
          {isTransfer ? <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>NETZWERKGEBÜHR (BTC)</div><input type="number" placeholder="z.B. 0.00002" inputMode="decimal" value={form.fee} onChange={e => set("fee", e.target.value)} style={iStyle} step="any" /></div> : <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>BETRAG ({sym})</div><input type="number" placeholder={currency === "CHF" ? "z.B. 3'500.00" : currency === "USD" ? "z.B. 3'800.00" : "z.B. 3'600.00"} inputMode="decimal" value={form.chf} onChange={e => set("chf", e.target.value)} style={iStyle} step="any" /></div>}
        </div>
        {!isTransfer && +form.btc > 0 && +form.chf > 0 && (
          <div style={{ marginTop: 10, marginBottom: 4, padding: "10px 14px", background: T.input, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: T.textMuted, fontSize: 13 }}>Preis pro BTC</span>
            <span style={{ color: T.text, fontSize: 15, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(+form.chf / +form.btc)}</span>
          </div>
        )}
        {!isTransfer && <div style={{ marginBottom: 16, marginTop: 12 }}><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>HANDELSGEBÜHREN ({sym})</div><input type="number" placeholder="z.B. 5.50 (0 falls keine)" inputMode="decimal" value={form.fee} onChange={e => set("fee", e.target.value)} style={iStyle} step="any" /></div>}
        <div style={{ marginBottom: 16, marginTop: !isTransfer ? 0 : 12 }}><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>NOTIZ (OPTIONAL)</div><input type="text" placeholder={isTransfer ? "z.B. Kraken → Ledger" : "z.B. DCA Kauf"} value={form.note} onChange={e => set("note", e.target.value)} style={iStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Abbrechen</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "15px 0", background: saving ? T.textFaint : TYPE_META[form.type].color, border: "none", color: form.type === "buy" ? "#000" : "#fff", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {saving ? "Speichern..." : editTx ? "Speichern" : `${TYPE_META[form.type].label} erfassen`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ tx, onConfirm, onCancel, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const m = TYPE_META[tx.type];
  const sym = CURRENCIES[currency].symbol;
  const fmtTx = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:2,maximumFractionDigits:2}).format(toDisplay(v, currency, usdChf, eurUsd));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🗑</div>
        </div>
        {/* Title */}
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>Transaktion löschen?</div>
        {/* Detail */}
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          <span style={{ color: m.color, fontWeight: 500 }}>{m.label}</span>
          {" · "}{fmtBtc(tx.btc)} BTC
          {tx.type !== "transfer" && <> · {sym} {fmtTx(tx.chf)}</>}
          <br />
          <span style={{ fontSize: 13 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</span>
        </div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 24, padding: "10px 16px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>
          Diese Aktion kann nicht rückgängig gemacht werden.
        </div>
        {/* Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={onCancel} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Abbrechen</button>
          <button onClick={onConfirm} style={{ padding: "15px 0", background: "#ef4444", border: "none", color: "#fff", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>Löschen</button>
        </div>
      </div>
    </div>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxRow({ tx, onDelete, onEdit, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const m = TYPE_META[tx.type];
  const sym = CURRENCIES[currency].symbol;
  const fmtTx = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:2,maximumFractionDigits:2}).format(toDisplay(v, currency, usdChf, eurUsd));
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ color: T.text, fontSize: 16 }}>{fmtBtc(tx.btc)} <span style={{ color: T.textMuted, fontSize: 13 }}>BTC</span></div>
            <div style={{ color: m.color, fontSize: 15 }}>{tx.type === "transfer" ? (tx.fee > 0 ? `−${tx.fee} BTC` : "—") : `${sym} ${fmtTx(tx.chf)}`}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <div style={{ color: T.textMuted, fontSize: 13 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</div>
            {tx.fee > 0 && tx.type !== "transfer" && <div style={{ color: T.textFaint, fontSize: 12 }}>Geb. {sym} {fmtTx(tx.fee)}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => onEdit(tx)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "7px 10px" }}>✎</button>
          <button onClick={() => setShowConfirm(true)} style={{ background: "none", border: `1px solid rgba(239,68,68,0.3)`, color: "#ef4444", borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "7px 10px" }}>✕</button>
        </div>
      </div>
      {showConfirm && (
        <DeleteConfirmModal
          tx={tx}
          onConfirm={() => { setShowConfirm(false); onDelete(tx.id); }}
          onCancel={() => setShowConfirm(false)}
          T={T}
          currency={currency}
          usdChf={usdChf}
          eurUsd={eurUsd}
        />
      )}
    </>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ view, setView, onAdd, T }) {
  const btn = (id, icon, label) => (
    <button onClick={() => setView(id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
      <span style={{ fontSize: 19, color: view === id ? "#f7931a" : T.textFaint, width: 24, textAlign: "center", display: "block" }}>{icon}</span>
      <span style={{ fontSize: 10, color: view === id ? "#f7931a" : T.textFaint, fontWeight: view === id ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.navBg, backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "10px 16px calc(16px + env(safe-area-inset-bottom))" }}>
      {btn("dashboard", "◈", "Dashboard")}
      {btn("analyse", "◎", "Analyse")}
      <button onClick={onAdd} style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, #f7931a, #e07b10)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#000", fontWeight: 400, lineHeight: "56px", boxShadow: "0 4px 20px rgba(247,147,26,0.35)", flexShrink: 0 }}>+</button>
      {btn("verlauf", "≡", "Verlauf")}
      {btn("settings", "⚙︎", "Einstellungen")}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]               = useState(null);
  const [authLoading, setAuthLoading]       = useState(true);
  const [transactions, setTransactions]     = useState([]);
  const [btcUsd, setBtcUsd]                 = useState(77664);
  const [usdChf, setUsdChf]                 = useState(0.787);
  const [eurUsd, setEurUsd]                 = useState(0.92);
  const [dayChangePct, setDayChangePct]     = useState(1.25);
  const [historicChartData, setHistoricChartData] = useState([]);
  const [rawPriceData, setRawPriceData]           = useState([]); // [[isoDate, chfPrice], ...]
  const [lastUpdated, setLastUpdated]       = useState(null);
  const [view, setView]                     = useState("dashboard");
  const [showModal, setShowModal]           = useState(false);
  const [editTx, setEditTx]                 = useState(null);
  const [loading, setLoading]               = useState(false);
  const [dbLoading, setDbLoading]           = useState(true);
  const [txFilter, setTxFilter]             = useState("all");
  const [darkMode, setDarkMode]             = useState(() => {
    try { const v = localStorage.getItem("darkMode"); return v === null ? false : v !== "false"; } catch { return false; }
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return localStorage.getItem("onboardingDone") !== "true"; } catch { return true; }
  });
  const finishOnboarding = () => {
    try { localStorage.setItem("onboardingDone", "true"); } catch {}
    setShowOnboarding(false);
  };
  const resetOnboarding = () => {
    try { localStorage.removeItem("onboardingDone"); } catch {}
    setShowOnboarding(true);
  };
  const [currency, setCurrencyState]        = useState(() => {
    try { return localStorage.getItem("currency") || "CHF"; } catch { return "CHF"; }
  });
  const setCurrency = (c) => { setCurrencyState(c); try { localStorage.setItem("currency", c); } catch {} };

  const T = darkMode ? DARK : LIGHT;
  const token = session?.access_token;

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try { localStorage.setItem("darkMode", darkMode); } catch {}
    document.documentElement.style.background = T.bg;
    document.body.style.background = T.bg;
    document.body.style.color = T.text;
  }, [darkMode, T]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover";
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!token) return;
    setDbLoading(true);
    try { const data = await api.getAll(token); setTransactions(Array.isArray(data) ? data : []); } catch {}
    setDbLoading(false);
  }, [token]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf,eur&include_24hr_change=true");
      const d = await r.json();
      if (d.bitcoin) {
        setBtcUsd(d.bitcoin.usd);
        setUsdChf(d.bitcoin.chf / d.bitcoin.usd);
        setEurUsd(d.bitcoin.eur / d.bitcoin.usd);
        setDayChangePct(d.bitcoin.usd_24h_change ?? 0);
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  const fetchHistoricChart = useCallback(async () => {
    try {
      const r = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=chf&days=730&interval=daily");
      const d = await r.json();
      if (!d.prices?.length) return;
      // Für Markt-Chart: monatliche Durchschnitte
      const monthly = {};
      d.prices.forEach(([ts, price]) => { const dt = new Date(ts); const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`; if (!monthly[key]) monthly[key] = []; monthly[key].push(price); });
      const data = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([key, prices]) => [key, Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)]);
      if (data.length) setHistoricChartData(data);
      // Für Portfolio-Chart: tägliche Preise speichern
      const daily = d.prices.map(([ts, price]) => {
        const dt = new Date(ts);
        const iso = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
        return [iso, Math.round(price)];
      });
      setRawPriceData(daily);
    } catch {}
  }, []);

  useEffect(() => { fetchPrice(); fetchHistoricChart(); }, [fetchPrice, fetchHistoricChart]);
  useEffect(() => { const id = setInterval(fetchPrice, 60_000); return () => clearInterval(id); }, [fetchPrice]);

  const btcChf = btcUsd * usdChf;
  const buyTx  = transactions.filter(t => t.type === "buy");
  const sellTx = transactions.filter(t => t.type === "sell");
  const trfTx  = transactions.filter(t => t.type === "transfer");

  // Total BTC bestand
  const totalBtc = buyTx.reduce((s, t) => s + +t.btc, 0)
                 - sellTx.reduce((s, t) => s + +t.btc, 0)
                 - trfTx.reduce((s, t) => s + +(t.fee || 0), 0);

  // Investiertes Kapital (nur Käufe bestimmen den Einstandspreis)
  const buyBtc     = buyTx.reduce((s, t) => s + +t.btc, 0);
  const buyInvested = buyTx.reduce((s, t) => s + +t.chf + +(t.fee || 0), 0);

  // P&L: Einnahmen aus Verkäufen werden angerechnet
  const sellProceeds = sellTx.reduce((s, t) => s + +t.chf - +(t.fee || 0), 0);
  const totalInvested = buyInvested - sellProceeds;

  const portfolioChf  = totalBtc * btcChf;
  const pnlChf        = portfolioChf - totalInvested;
  const pnlPct        = buyInvested > 0 ? (pnlChf / buyInvested) * 100 : 0;

  // Einstandspreis: nur aus Käufen berechnet, unabhängig von Verkäufen
  const avgChf = buyBtc > 0 ? buyInvested / buyBtc : 0;
  const avgUsd = avgChf / usdChf;

  const handleSave = async (form) => {
    if (form.id && transactions.find(t => t.id === form.id)) {
      const updated = await api.update(form, token);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = await api.create(form, token);
      setTransactions(prev => [...prev, created]);
    }
  };

  const handleDelete = async (id) => {
    await api.remove(id, token);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTransactions([]);
  };

  // Berechnet echten Portfolio-Verlauf aus Transaktionen + historischen Kursen
  const buildPortfolioChart = (tab) => {
    if (!rawPriceData.length || !transactions.length) return [];
    const now = new Date();
    const msPerDay = 86400000;
    let cutoffDays = { "1D": 1, "7D": 7, "30D": 30, "ALL": 9999 }[tab] || 7;
    const cutoff = new Date(now - cutoffDays * msPerDay);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    // Filtere Preisdaten auf gewünschten Zeitraum
    const prices = rawPriceData.filter(([d]) => d >= cutoffStr);
    if (!prices.length) return [];

    // Sortiere Transaktionen nach Datum
    const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    // Für jeden Preispunkt: berechne BTC-Menge zu diesem Datum
    return prices.map(([date, chfPrice]) => {
      let btcAmt = 0;
      for (const tx of sortedTx) {
        if (tx.date > date) break;
        if (tx.type === "buy") btcAmt += +tx.btc;
        else if (tx.type === "sell") btcAmt -= +tx.btc;
        else if (tx.type === "transfer") btcAmt -= +(tx.fee || 0);
      }
      const portfolioChfVal = Math.round(btcAmt * chfPrice);
      // Label je nach Tab
      let label = date;
      if (tab === "1D") label = date.slice(11, 16) || date;
      else if (tab === "7D") { const d = new Date(date); label = ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()]; }
      else if (tab === "30D") label = date.slice(8, 10);
      else label = date.slice(0, 7);
      return { t: label, v: portfolioChfVal };
    });
  };

  const exportCSV = () => {
    const sym = currency;
    const conv = (chfVal) => {
      if (currency === "CHF") return chfVal;
      if (currency === "USD") return chfVal / usdChf;
      return (chfVal / usdChf) * eurUsd;
    };
    const fmt2 = (v) => parseFloat(conv(v).toFixed(2));
    const btcPrice = currency === "CHF" ? btcChf : currency === "USD" ? btcUsd : btcUsd * eurUsd;
    const header = `Datum,Typ,BTC,${sym} Betrag,${sym} Gebühren,Portfoliowert heute (${sym}),Notiz`;
    const rows = [...transactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => [
        t.date, t.type, t.btc,
        t.type === "transfer" ? 0 : fmt2(t.chf),
        fmt2(t.fee || 0),
        parseFloat((t.btc * btcPrice).toFixed(2)),
        `"${(t.note || "").replace(/"/g, '""')}"`
      ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `btc-transaktionen-${sym}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTx = [...transactions].filter(t => txFilter === "all" || t.type === txFilter).sort((a, b) => b.date.localeCompare(a.date));
  const scrollStyle = { overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch", paddingBottom: 100 };

  // Auth loading
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: T.textFaint, fontSize: 15 }}>Laden...</div>
    </div>
  );

  // Nicht eingeloggt → Login Screen
  if (!session) return (
    <>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; } input { font-size: 16px !important; }`}</style>
      <AuthScreen T={T} />
    </>
  );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html { height: -webkit-fill-available; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; min-height: -webkit-fill-available; overscroll-behavior: none; }
        button { font-family: inherit; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: ${darkMode ? "invert(0.3)" : "none"}; cursor: pointer; }
        input { font-size: 16px !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {window.location.hostname.includes("dev--") && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: "linear-gradient(90deg, #7c3aed, #a855f7)", color: "#fff", textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 2, padding: "6px 0", fontFamily: "inherit" }}>
          🧪 TESTUMGEBUNG — dev
        </div>
      )}
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, paddingTop: window.location.hostname.includes("dev--") ? 28 : 0 }}>
        <Header lastUpdated={lastUpdated} btcUsd={btcUsd} onRefresh={() => { fetchPrice(); fetchHistoricChart(); }} loading={loading} T={T} />

        {dbLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: T.textFaint, fontSize: 15 }}>Lade Daten...</div>
        ) : (
          <>
            {view === "dashboard" && (
              <div style={scrollStyle}>
                <PortfolioCard portfolioChf={portfolioChf} pnlChf={pnlChf} pnlPct={pnlPct} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} buildPortfolioChart={buildPortfolioChart} hasRealData={rawPriceData.length > 0 && transactions.length > 0} />
                <PositionCard totalBtc={totalBtc} portfolioChf={portfolioChf} totalInvested={totalInvested} avgChf={avgChf} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />
                <MarketCard btcChf={btcChf} btcUsd={btcUsd} dayChangePct={dayChangePct} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />
              </div>
            )}
            {view === "analyse" && (
              <div style={{ ...scrollStyle, padding: "0 12px" }}>
                <PriceChart avgChf={avgChf} currentChf={btcChf} transactions={transactions} chartData={historicChartData} T={T} />
                <BreakEvenCard avgChf={avgChf} currentChf={btcChf} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />
                <DcaCalculator totalBtc={totalBtc} totalInvested={totalInvested} avgChf={avgChf} currentChf={btcChf} usdChf={usdChf} T={T} currency={currency} eurUsd={eurUsd} />
                <BarChart portfolioChf={portfolioChf} investedChf={totalInvested} T={T} />
              </div>
            )}
            {view === "verlauf" && (
              <div style={{ ...scrollStyle, padding: "0 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16, paddingTop: 4 }}>
                  {[["all", "Alle"], ...Object.entries(TYPE_META).map(([k, v]) => [k, v.label])].map(([id, label]) => (
                    <button key={id} onClick={() => setTxFilter(id)} style={{ padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: txFilter === id ? T.text : T.surface, color: txFilter === id ? T.bg : T.textMuted, border: `1px solid ${txFilter === id ? T.text : T.border}`, fontWeight: txFilter === id ? 500 : 400 }}>{label}</button>
                  ))}
                  <button onClick={exportCSV} title="CSV exportieren" style={{ background: "transparent", border: "1.5px solid #f7931a", color: "#f7931a", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "auto" }}>↓</button>
                </div>
                {filteredTx.length === 0 && <div style={{ color: T.textFaint, textAlign: "center", padding: "40px 0", fontSize: 15 }}>Keine Transaktionen</div>}
                {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} onDelete={handleDelete} onEdit={tx => { setEditTx(tx); setShowModal(true); }} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />)}
              </div>
            )}
            {view === "settings" && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} T={T} transactions={transactions} userEmail={session?.user?.email} onLogout={handleLogout} currency={currency} setCurrency={setCurrency} usdChf={usdChf} eurUsd={eurUsd} btcChf={btcChf} btcUsd={btcUsd} onResetOnboarding={resetOnboarding} />}
          </>
        )}
      </div>

      {showOnboarding && <OnboardingScreen onFinish={finishOnboarding} T={T} />}
      <BottomNav view={view} setView={setView} onAdd={() => { setEditTx(null); setShowModal(true); }} T={T} />
      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditTx(null); }} onSave={handleSave} editTx={editTx} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />}
    </>
  );
}
