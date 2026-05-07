import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, YAxis, XAxis, Tooltip, Legend, ReferenceLine } from "recharts";
import { createClient } from "@supabase/supabase-js";
import { translations, tr } from "./i18n";

// ── API Base URL (absolut für Capacitor Native App) ───────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE ?? "https://bb-btc-tracker.netlify.app";

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
  getAll: (token) => fetch(`${API_BASE}/api/transactions`, { headers: authHeaders(token) }).then(r => r.json()),
  create: (tx, token) => fetch(`${API_BASE}/api/transactions`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(tx) }).then(r => r.json()),
  update: (tx, token) => fetch(`${API_BASE}/api/transactions/${tx.id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(tx) }).then(r => r.json()),
  remove: (id, token) => fetch(`${API_BASE}/api/transactions/${id}`, { method: "DELETE", headers: authHeaders(token) }).then(r => r.json()),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtChf = (n, d = 2) => new Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtUsd = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtBtc = (n) => { const s = n.toFixed(6); return parseFloat(s).toString(); };

// Rundet auf "schöne" Achsenwerte: 81'234 → 80'000, 9'876 → 10'000
const niceRound = (v) => {
  if (!v || v === 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 1);
  return Math.round(v / mag) * mag;
};

// Globaler Font-Scale Helper — liest aus localStorage damit er in allen Komponenten verfügbar ist
const FONT_SCALES = { S: 0.9, M: 1.0, L: 1.15 };
const fs = (n) => {
  try {
    const scale = FONT_SCALES[localStorage.getItem("fontScale") || "M"] || 1.0;
    return Math.round(n * scale);
  } catch { return n; }
};

// ── Währungs-Konfiguration ────────────────────────────────────────────────────
const CURRENCIES = {
  CHF: { label: "CHF", symbol: "CHF", locale: "de-CH", rate: (usdChf) => usdChf },
  EUR: { label: "EUR", symbol: "EUR", locale: "de-DE", rate: (usdChf) => usdChf * 0.92 },
  USD: { label: "USD", symbol: "$",   locale: "en-US", rate: () => 1 },
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

// TYPE_META als Funktion: Labels werden per t() übersetzt
const getTypeMeta = (t) => ({
  buy:          { label: t("txType.buy"),          color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: "↓" },
  sell:         { label: t("txType.sell"),         color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: "↑" },
  transfer_in:  { label: t("txType.transfer_in"),  color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "→" },
  transfer_out: { label: t("txType.transfer_out"), color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "←" },
});

// ── Theme ─────────────────────────────────────────────────────────────────────
const DARK = {
  bg:        "#0f0f0f",
  surface:   "#1c1c1e",
  border:    "#3a3a3c",
  text:      "#ffffff",
  textSub:   "#e5e5ea",
  textMuted: "#aeaeb2",
  textFaint: "#8e8e93",
  input:     "#2c2c2e",
  inputBorder: "#48484a",
  navBg:     "rgba(18,18,18,0.97)",
  divider:   "#3a3a3c",
};

const LIGHT = {
  bg:        "#f2f2f7",
  surface:   "#fff",
  border:    "#e0e0e0",
  text:      "#000000",
  textSub:   "#1c1c1e",
  textMuted: "#3a3a3a",
  textFaint: "#636366",
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


// ── AGB Text ──────────────────────────────────────────────────────────────────
const AGB_SECTIONS = [
  {
    title: "1. Datenspeicherung bei Drittanbietern",
    text: "Die App speichert deine Daten bei Supabase (Irland, EU) und wird über Netlify bereitgestellt. Obwohl beide Anbieter hohe Sicherheits- und Verfügbarkeitsstandards einhalten, liegt die Verantwortung für die Datenverfügbarkeit bei diesen Drittanbietern. Der Anbieter dieser App übernimmt keine Haftung für Datenverluste, die durch technische Störungen, Ausfälle oder Änderungen bei Supabase oder Netlify entstehen."
  },
  {
    title: "2. Empfehlung zur Datensicherung",
    text: "Nutzer werden ausdrücklich empfohlen, ihre Transaktionsdaten regelmässig via CSV-Export zu sichern. Diese Funktion steht unter Einstellungen → Daten zur Verfügung."
  },
  {
    title: "3. Keine Anlageberatung",
    text: "Die in dieser App angezeigten Informationen, Berechnungen und Analysen dienen ausschliesslich zu Informationszwecken und stellen keine Anlageberatung, Steuerberatung oder Empfehlung zum Kauf oder Verkauf von Kryptowährungen dar. Alle Entscheidungen liegen in der alleinigen Verantwortung des Nutzers."
  },
  {
    title: "4. Verfügbarkeit",
    text: "Der Betrieb der App kann jederzeit und ohne Vorankündigung unterbrochen, eingeschränkt oder eingestellt werden. Ein Anspruch auf permanente Verfügbarkeit besteht nicht."
  },
  {
    title: "5. Haftungsbeschränkung",
    text: "Die Haftung des Anbieters ist im gesetzlich zulässigen Rahmen ausgeschlossen. Dies gilt insbesondere für indirekte Schäden, Datenverluste oder entgangene Gewinne. Vorbehalten bleibt die Haftung für grosse Fahrlässigkeit und Vorsatz."
  },
  {
    title: "6. Änderungen",
    text: "Der Anbieter behält sich vor, diese AGB jederzeit zu ändern. Über wesentliche Änderungen werden Nutzer informiert."
  },
  {
    title: "7. Kontakt",
    text: "support [at] bluebubble [dot] ch"
  },
];
// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ T, language }) {
  const t = tr(translations, language);
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [showAgb, setShowAgb] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const iStyle = {
    width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`,
    color: T.text, padding: "14px 16px", borderRadius: 12, fontSize: 16,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    appearance: "none", WebkitAppearance: "none",
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || (!password && mode !== "reset")) { setError(t("auth.fillAll")); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "register") {
        if (!agbAccepted) { throw new Error(t("auth.acceptAgb")); }
        if (password.length < 6) { throw new Error(t("auth.passwordTooShort")); }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(t("auth.confirmationSent"));
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccess(t("auth.resetSent"));
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const titles = { login: t("auth.login"), register: t("auth.register"), reset: t("auth.reset") };
  const btnLabels = { login: t("auth.btnLogin"), register: t("auth.btnRegister"), reset: t("auth.btnReset") };

  return (
    <>
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: "#f7931a", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(247,147,26,0.35)", marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 44 44"><line x1="8" y1="36" x2="8" y2="8" stroke="#000" strokeWidth="3" strokeLinecap="round"/><line x1="8" y1="36" x2="36" y2="36" stroke="#000" strokeWidth="3" strokeLinecap="round"/><polyline points="14,26 20,18 26,22 36,10" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="10" r="3" fill="#000"/></svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Trackoshi</div>
          <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>{t("auth.tagline")}</div>
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
            <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.06em", marginBottom: 8 }}>{t("auth.email")}</div>
            <input type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={e => setEmail(e.target.value)} style={iStyle} autoCapitalize="none" />
          </div>

          {mode !== "reset" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.06em", marginBottom: 8 }}>{t("auth.password")}</div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} placeholder={mode === "register" ? t("auth.passwordRegisterPlaceholder") : t("auth.passwordPlaceholder")} value={password} onChange={e => setPassword(e.target.value)} style={{ ...iStyle, paddingRight: 48 }}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textFaint, fontSize: 18, padding: 0, display: "flex", alignItems: "center" }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div onClick={() => setAgbAccepted(!agbAccepted)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agbAccepted ? "#f7931a" : T.inputBorder}`, background: agbAccepted ? "#f7931a" : "transparent", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {agbAccepted && <span style={{ color: "#000", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>
                {t("auth.agbText")}{" "}
                <span onClick={() => setShowAgb(true)} style={{ color: "#f7931a", cursor: "pointer", textDecoration: "underline" }}>{t("auth.agbLink")}</span>
                {" "}{t("auth.andThe")}{" "}
                <span onClick={() => setShowAgb(true)} style={{ color: "#f7931a", cursor: "pointer", textDecoration: "underline" }}>{t("auth.privacyLink")}</span>
              </div>
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading || (mode === "register" && !agbAccepted)} style={{
            width: "100%", padding: "15px 0", background: (loading || (mode === "register" && !agbAccepted)) ? T.textFaint : "#f7931a",
            border: "none", borderRadius: 12, color: "#000", fontSize: 16, fontWeight: 600,
            fontFamily: "inherit", cursor: (loading || (mode === "register" && !agbAccepted)) ? "default" : "pointer", marginBottom: 16,
          }}>
            {loading ? t("auth.loading") : btnLabels[mode]}
          </button>

          {/* Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("reset"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  {t("auth.forgotPassword")}
                </button>
                <button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#f7931a", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
                  {t("auth.noAccount")}
                </button>
              </>
            )}
            {(mode === "register" || mode === "reset") && (
              <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                {t("auth.backToLogin")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    {showAgb && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowAgb(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "85vh", overflowY: "auto", padding: "28px 24px 40px" }}>
          <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 20px" }} />
          <div style={{ color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("auth.agbTitle")}</div>
          {AGB_SECTIONS.map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 18 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowAgb(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>{t("auth.close")}</button>
        </div>
      </div>
    )}
    </>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ lastUpdated, loading, T, onSettingsOpen, language }) {
  const t = tr(translations, language);
  const t2 = lastUpdated ? lastUpdated.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  return (
    <div style={{ padding: "14px 16px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#f7931a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(247,147,26,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 44 44"><line x1="8" y1="36" x2="8" y2="8" stroke="#000" strokeWidth="3.5" strokeLinecap="round"/><line x1="8" y1="36" x2="36" y2="36" stroke="#000" strokeWidth="3.5" strokeLinecap="round"/><polyline points="14,26 20,18 26,22 36,10" fill="none" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="10" r="3.5" fill="#000"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{t("header.portfolio")}</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 1 }}>
              {loading ? t("header.aktualisiere") : `${t("header.aktualisiert")} ${t2}`}
            </div>
          </div>
        </div>
        <button onClick={onSettingsOpen} style={{ width: 42, height: 42, background: T.input, border: `1px solid ${T.inputBorder}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: T.textMuted }}>⚙</button>
      </div>
    </div>
  );
}

// ── Portfolio Card ─────────────────────────────────────────────────────────────
function PortfolioCard({ portfolioChf, pnlChf, pnlPct, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, transactions = [], btcChfLive = 0, rawPriceData = [], language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const isNeg = pnlChf < 0;
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("portfolioTab") || "ALL"; } catch { return "ALL"; }
  });
  const fmtY = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd));
  const fmtLabel = (d) => d.slice(8,10)+"."+d.slice(5,7)+"."+d.slice(2,4);

  // Berechne Chart aus Transaktionen -- kein API-Aufruf nötig
  const chartData = (() => {
    try {
      if (!transactions.length) return null;
      const sortedTx = [...transactions]
        .filter(tx => tx.type === "buy" || tx.type === "sell" || tx.type === "transfer_in" || tx.type === "transfer_out")
        .sort((a, b) => (a.date||"").localeCompare(b.date||""));
      if (!sortedTx.length) return null;

      // Cutoff je nach Tab
      const now = new Date();
      const cutoffDays = { "1D": 1, "7D": 7, "30D": 30, "1Y": 365, "ALL": 9999 }[activeTab] || 9999;
      const cutoffStr = new Date(now.getTime() - cutoffDays * 86400000).toISOString().slice(0,10);

      const points = [];
      let cumInvested = 0;
      let cumBtc = 0;

      // Alle Transaktionen verarbeiten um kumulierte Werte zu erhalten
      for (const tx of sortedTx) {
        if (tx.type === "buy") { cumInvested += +(tx.chf||0) + +(tx.fee||0); cumBtc += +(tx.btc||0); }
        else if (tx.type === "sell") { cumInvested -= +(tx.chf||0) - +(tx.fee||0); cumBtc -= +(tx.btc||0); }
        else if (tx.type === "transfer_out") { cumBtc -= +(tx.btc||0); }
        else if (tx.type === "transfer_in")  { cumBtc += +(tx.btc||0); }
        if (tx.date >= cutoffStr) {
          points.push({ t: fmtLabel(tx.date), invested: Math.round(cumInvested) });
        }
      }

      // Startpunkt: Stand am Beginn des Zeitraums
      const startInvested = (() => {
        let inv = 0;
        for (const tx of sortedTx) {
          if (tx.date >= cutoffStr) break;
          if (tx.type === "buy") inv += +(tx.chf||0) + +(tx.fee||0);
          else if (tx.type === "sell") inv -= +(tx.chf||0) - +(tx.fee||0);
        }
        return Math.round(inv);
      })();
      // Für ALL-Tab: erstes Transaktionsdatum als Startpunkt, nicht 9999 Tage zurück
      const startDate = activeTab === "ALL" && sortedTx.length
        ? sortedTx[0].date
        : cutoffStr;
      points.unshift({ t: fmtLabel(startDate), invested: startInvested });

      // Portfolio-Wert Linie mit historischen Tageskursen
      const pricesInRange = rawPriceData.length > 0
        ? rawPriceData.filter(([d]) => d >= cutoffStr)
        : [];

      if (pricesInRange.length >= 2) {
        // txMap aufbauen
        const txMap = {};
        let runBtc = 0, runInv = 0;
        for (const tx of sortedTx) {
          if (tx.type === "buy")               { runBtc += +(tx.btc||0); runInv += +(tx.chf||0) + +(tx.fee||0); }
          else if (tx.type === "sell")         { runBtc -= +(tx.btc||0); runInv -= +(tx.chf||0); }
          else if (tx.type === "transfer_in")  { runBtc += +(tx.btc||0); }
          else if (tx.type === "transfer_out") { runBtc -= +(tx.btc||0); }
          txMap[tx.date] = { btc: runBtc, inv: runInv };
        }
        const txDatesSorted = Object.keys(txMap).sort();

        const fmtT = (date) => {
          if (activeTab === "7D")  return ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date(date+"T12:00:00").getDay()];
          if (activeTab === "30D") return date.slice(8,10)+".";
          if (activeTab === "ALL") return date.slice(0,7);
          return fmtLabel(date);
        };

        // Portfolio-Wert aus Preisdaten (alle Tabs)
        let lastBtc = 0;
        // Initialisiere lastBtc mit Stand vor erstem Preispunkt
        const prevTx = txDatesSorted.filter(d => d < pricesInRange[0][0]);
        if (prevTx.length) lastBtc = txMap[prevTx[prevTx.length-1]].btc;

        const combined = pricesInRange.map(([date, usdPrice]) => {
          if (txMap[date]) lastBtc = txMap[date].btc;
          else {
            const prev = txDatesSorted.filter(d => d <= date);
            if (prev.length) lastBtc = txMap[prev[prev.length-1]].btc;
          }
          return { t: fmtT(date), portfolio: Math.max(0, Math.round(lastBtc * usdPrice * usdChf)) };
        });

        // Investiert-Linie für ALLE Tabs
        // Startstand vor erstem Preispunkt berechnen
        const firstPriceDate = pricesInRange[0][0];
        const prevTxAll = txDatesSorted.filter(d => d <= firstPriceDate);
        const startInvAll = prevTxAll.length ? txMap[prevTxAll[prevTxAll.length-1]].inv : 0;

        // Für jeden Preis-Punkt: investierten Stand interpolieren
        let lastInv = startInvAll;
        combined.forEach(p => {
          const t = p.t;
          // Suche letzte TX <= diesem Monat/Tag
          let matchDate;
          if (activeTab === "ALL") {
            const txBefore = txDatesSorted.filter(d => d.slice(0,7) <= t);
            if (txBefore.length) matchDate = txBefore[txBefore.length-1];
          } else {
            // Für 1T/7T/30T: finde TX an oder vor dem raw-Datum
            // Da t ein formatiertes Label ist, nutze den Index im combined-Array
            const idx = combined.indexOf(p);
            const rawDate = pricesInRange[Math.min(idx, pricesInRange.length-1)]?.[0];
            if (rawDate) {
              const txBefore = txDatesSorted.filter(d => d <= rawDate);
              if (txBefore.length) matchDate = txBefore[txBefore.length-1];
            }
          }
          if (matchDate) lastInv = txMap[matchDate].inv;
          p.invested = Math.max(0, Math.round(lastInv));
        });

        // Heutiger Endpunkt
        const todayT = fmtT(now.toISOString().slice(0,10));
        const todayEx = combined.find(p => p.t === todayT);
        if (todayEx) {
          todayEx.portfolio = Math.round(portfolioChf);
          if (activeTab === "ALL") todayEx.invested = Math.round(runInv);
        } else {
          const pt = { t: todayT, portfolio: Math.round(portfolioChf) };
          if (activeTab === "ALL") pt.invested = Math.round(runInv);
          combined.push(pt);
        }

        combined.sort((a,b) => a.t.localeCompare(b.t));
        return combined.length >= 2 ? combined : null;
      }

      // Fallback: Investiert-Linie + Heute-Punkt
      const todayD = now.toISOString().slice(0,10);
      const lastBtc = sortedTx.reduce((btc, tx) => {
        if (tx.type === "buy") return btc + +(tx.btc||0);
        if (tx.type === "sell") return btc - +(tx.btc||0);
        if (tx.type === "transfer_in")  return btc + +(tx.btc||0);
        if (tx.type === "transfer_out") return btc - +(tx.btc||0);
        return btc;
      }, 0);
      points.push({ t: fmtLabel(todayD), invested: points[points.length-1]?.invested, today: Math.round(lastBtc * btcChfLive) });

      return points.length >= 2 ? points : null;
    } catch { return null; }
  })();

  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ color: T.textMuted, fontSize: 13 }}>{t("portfolio.gesamtwert")}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <span style={{ fontSize: 22, fontWeight: 500, color: T.textMuted, marginRight: 3 }}>{sym}</span>
          {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toDisplay(portfolioChf, currency, usdChf, eurUsd))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, marginBottom: 16 }}>
          <span style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 14, fontWeight: 500 }}>
            {isNeg ? "↓" : "↑"} {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(toDisplay(Math.abs(pnlChf), currency, usdChf))} {sym} ({isNeg ? "" : "+"}{pnlPct.toFixed(2)}%)
          </span>
          <span style={{ color: T.textFaint, fontSize: 13 }}>{t("portfolio.seitKauf")}</span>
        </div>
      </div>
      {/* Tab-Auswahl — nur verfügbare Tabs aktiv */}
      {(() => {
        const now = new Date();
        const oldestPrice = rawPriceData.length ? rawPriceData[0][0] : null;
        const oldestTx = transactions.length ? [...transactions].sort((a,b) => a.date.localeCompare(b.date))[0]?.date : null;
        const daysSinceOldestPrice = oldestPrice ? Math.floor((now - new Date(oldestPrice)) / 86400000) : 0;
        const daysSinceOldestTx = oldestTx ? Math.floor((now - new Date(oldestTx)) / 86400000) : 0;
        const tabs = [
          { key: "1D",  label: "1T",  available: true },
          { key: "7D",  label: "7T",  available: true },
          { key: "30D", label: "30T", available: true },
          { key: "1Y",  label: "1J",  available: daysSinceOldestPrice >= 365 && daysSinceOldestTx >= 365 },
          { key: "ALL", label: (() => {
            if (!oldestPrice) return "Alle";
            const years = Math.round(daysSinceOldestPrice / 365 * 2) / 2; // auf 0.5 runden
            if (years >= 1) return `${years % 1 === 0 ? years : years}J`;
            const months = Math.round(daysSinceOldestPrice / 30);
            return `${months}M`;
          })(), available: daysSinceOldestTx > 30 },
        ];
        // Falls activeTab nicht mehr verfügbar, auf 30D zurückfallen
        const effectiveTab = tabs.find(t => t.key === activeTab)?.available ? activeTab : "30D";
        if (effectiveTab !== activeTab) { setActiveTab(effectiveTab); try { localStorage.setItem("portfolioTab", effectiveTab); } catch {} }
        return (
          <div style={{ display: "flex", gap: 2, background: T.input, borderRadius: 10, padding: 3, margin: "0 16px 12px" }}>
            {tabs.filter(t => t.available).map(t => (
              <button key={t.key} onClick={() => { setActiveTab(t.key); try { localStorage.setItem("portfolioTab", t.key); } catch {} }}
                style={{ padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  background: activeTab === t.key ? T.surface : "transparent",
                  color: activeTab === t.key ? T.text : T.textFaint,
                  boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}>{t.label}</button>
            ))}
          </div>
        );
      })()}
      <div style={{ height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData || []} margin={{ top: 5, right: 16, left: 0, bottom: 20 }}>
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: T.textFaint }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: T.textMuted, marginBottom: 4 }}
              formatter={(v, name) => [`${sym} ${fmtY(v)}`, name === "invested" ? t("portfolio.investiert") : name === "portfolio" ? t("portfolio.portfoliowert") : t("portfolio.heute")]}
            />
            <Line type="stepAfter" dataKey="invested" stroke="#f7931a" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
            {chartData?.[0]?.portfolio !== undefined ? (
              <Line type="monotone" dataKey="portfolio" stroke={isNeg ? "#ef4444" : "#22c55e"} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: isNeg ? "#ef4444" : "#22c55e" }} />
            ) : (
              <Line type="monotone" dataKey="today" stroke={isNeg ? "#ef4444" : "#22c55e"} strokeWidth={0}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.today) return null;
                  return <circle key="today-dot" cx={cx} cy={cy} r={7} fill={isNeg ? "#ef4444" : "#22c55e"} stroke={T.surface} strokeWidth={2} />;
                }}
                activeDot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Legende */}
      <div style={{ display: "flex", gap: 16, padding: "0 16px 16px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 2, background: "#f7931a", borderRadius: 1 }} />
          <span style={{ fontSize: 12, color: T.textMuted }}>{t("portfolio.investiert")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {chartData?.[0]?.portfolio !== undefined ? (
            <><div style={{ width: 20, height: 2, background: isNeg ? "#ef4444" : "#22c55e", borderRadius: 1 }} /><span style={{ fontSize: 12, color: T.textMuted }}>{t("portfolio.portfoliowert")}</span></>
          ) : (
            <><div style={{ width: 8, height: 8, borderRadius: "50%", background: isNeg ? "#ef4444" : "#22c55e" }} /><span style={{ fontSize: 12, color: T.textMuted }}>{t("portfolio.heute")}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Position Card ─────────────────────────────────────────────────────────────
function PositionCard({ totalBtc, portfolioChf, totalInvested, avgChf, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 20px" }}>
      <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 16 }}>{t("position.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ borderRight: `1px solid ${T.divider}`, paddingRight: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>{t("position.bestand")}</div>
          <div style={{ color: T.text, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{fmtBtc(totalBtc)} <span style={{ fontSize: 13, fontWeight: 400, color: T.textSub }}>BTC</span></div>
          <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>≈ {sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(portfolioChf, currency, usdChf, eurUsd))}</div>
        </div>
        <div style={{ paddingLeft: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>{t("position.investiert")}</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(totalInvested, currency, usdChf, eurUsd))}</div>
          </div>
          <div>
            <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>{t("position.einstandspreis")}</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(avgChf, currency, usdChf, eurUsd))}</div>
            <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{t("position.proBtc")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Market Card mit Live Chart ────────────────────────────────────────────────
function MarketCard({ btcChf, btcUsd, dayChangePct, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language, secondaryCurrency = "none" }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const btcDisplay = toDisplay(btcChf, currency, usdChf, eurUsd);
  const fmtPrice = (v, cur) => new Intl.NumberFormat(CURRENCIES[cur].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const showSecondary = secondaryCurrency && secondaryCurrency !== "none" && secondaryCurrency !== currency;
  const btcSecondary = secondaryCurrency === "CHF" ? btcChf : secondaryCurrency === "USD" ? btcUsd : (btcUsd * eurUsd);
  const symSecondary = showSecondary && CURRENCIES[secondaryCurrency] ? CURRENCIES[secondaryCurrency].symbol : "";
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem("marketTab") || "1T"; } catch { return "1T"; }
  });
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const TABS = ["1T", "1W", "1M", "3M", "6M", "1J"];

  const fetchMarketChart = useCallback(async (tab) => {
    setLoadingChart(true);
    setChartData([]);
    try {
      const daysMap = { "1T": 1, "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1J": 365 };
      const days = daysMap[tab];
      const r = await fetch(`${API_BASE}/api/market?days=${days}`);
      const d = await r.json();
      if (!d.prices?.length) { setLoadingChart(false); return; }
      setChartData(d.prices);
    } catch (e) { console.error("Chart fetch failed:", e); }
    setLoadingChart(false);
  }, []);

  useEffect(() => {
    fetchMarketChart(activeTab);
    const retry = setTimeout(() => { fetchMarketChart(activeTab); }, 3000);
    return () => clearTimeout(retry);
  }, [activeTab, fetchMarketChart]);

  // Berechnungen
  const vals = chartData.map(d => d.v);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 0;
  const firstV = chartData.length ? chartData[0].v : 0;
  const lastV = chartData.length ? chartData[chartData.length - 1].v : 0;
  const tabChangePct = firstV > 0 ? ((lastV - firstV) / firstV) * 100 : 0;
  const isPos = tabChangePct >= 0;
  const color = isPos ? "#22c55e" : "#ef4444";

  // Rechte Achse: %-Werte bei min/mid/max
  const pctAt = (v) => firstV > 0 ? ((v - firstV) / firstV * 100) : 0;
  const fmtPct = (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

  const xTicks = chartData.filter((_, i) => {
    const n = chartData.length;
    if (n <= 8) return true;
    return i % Math.floor(n / 5) === 0 || i === n - 1;
  }).map(d => d.t);

  const fmtAxis = (usdVal) => {
    const converted = niceRound(toDisplay(usdVal * usdChf, currency, usdChf, eurUsd));
    return new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted);
  };
  const fmtTooltip = (usdVal) => {
    const converted = toDisplay(usdVal * usdChf, currency, usdChf, eurUsd);
    const pct = fmtPct(pctAt(usdVal));
    return `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(converted)} (${pct})`;
  };

  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "#f7931a", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 44 44"><line x1="8" y1="36" x2="8" y2="8" stroke="#000" strokeWidth="4" strokeLinecap="round"/><line x1="8" y1="36" x2="36" y2="36" stroke="#000" strokeWidth="4" strokeLinecap="round"/><polyline points="14,26 20,18 26,22 36,10" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="10" r="4" fill="#000"/></svg>
            </div>
            <span style={{ color: T.textSub, fontSize: 14 }}>Bitcoin (BTC)</span>
          </div>
          {/* Badge: Tab-%-Änderung statt fix 24h */}
          <div style={{ background: isPos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
            <span>{isPos ? "▲" : "▼"}</span>{Math.abs(tabChangePct).toFixed(2)}% <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 2 }}>{activeTab}</span>
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>{sym} {fmtPrice(btcDisplay, currency)}</div>
        {showSecondary && btcSecondary > 0 && (
          <div style={{ fontSize: 28, fontWeight: 700, color: T.textMuted, letterSpacing: "-0.02em", marginTop: 2 }}>{symSecondary} {fmtPrice(btcSecondary, secondaryCurrency)}</div>
        )}
        {!showSecondary && currency !== "USD" && <div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>${fmtUsd(btcUsd)}</div>}
        <div style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.divider}`, paddingBottom: 12 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); try { localStorage.setItem("marketTab", tab); } catch {} }}
              style={{ flex: 1, padding: "5px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", background: activeTab === tab ? T.input : "transparent", color: activeTab === tab ? T.text : T.textFaint }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 180, position: "relative" }}>
        {loadingChart ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.textFaint, fontSize: 13 }}>{t("market.lade")}</div>
        ) : chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 48, left: 48, bottom: 20 }}>
                <defs>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" ticks={xTicks} />
                <YAxis domain={[minV, maxV]} hide />
                <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} labelStyle={{ color: T.textMuted }} itemStyle={{ color: T.text }} formatter={(v) => [fmtTooltip(v), ""]} />
                {firstV > 0 && firstV >= minV && firstV <= maxV && (
                  <ReferenceLine y={firstV} stroke={T.textFaint} strokeDasharray="4 3" strokeOpacity={0.5} strokeWidth={1} />
                )}
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="url(#marketGrad)" dot={false} activeDot={{ r: 3, fill: color }} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Linke Y-Achse: absoluter Kurs */}
            <div style={{ position: "absolute", left: 6, top: 8, bottom: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[maxV, (minV + maxV) / 2, minV].map((v, i) => (
                <span key={i} style={{ fontSize: 9, color: T.textMuted, textAlign: "left" }}>{fmtAxis(v)}</span>
              ))}
            </div>

            {/* Rechte Y-Achse: %-Änderung */}
            <div style={{ position: "absolute", right: 4, top: 8, bottom: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
              {[maxV, (minV + maxV) / 2, minV].map((v, i) => {
                const pct = pctAt(v);
                const isZero = Math.abs(pct) < 0.5;
                return (
                  <span key={i} style={{ fontSize: 9, color: isZero ? T.textMuted : pct > 0 ? "#22c55e" : "#ef4444", textAlign: "right", fontWeight: isZero ? 600 : 400 }}>
                    {fmtPct(pct)}
                  </span>
                );
              })}
            </div>

          </>
        ) : null}
      </div>
    </div>
  );
}

// ── Analyse Charts ─────────────────────────────────────────────────────────────
function PriceChart({ avgChf, currentChf, transactions, chartData, T, language, currency = "CHF", usdChf = 0.9, eurUsd = 0.92 }) {
  const t = tr(translations, language);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const sym = CURRENCIES[currency].symbol;
  const convertPrice = (usdPrice) => {
    if (currency === "CHF") return usdPrice * usdChf;
    if (currency === "EUR") return usdPrice * eurUsd;
    return usdPrice;
  };
  const rawData = chartData?.length ? chartData : FALLBACK_PRICES_CHF;
  const data = rawData.map(([d, p]) => [d, Math.round(convertPrice(p))]);
  const prices = data.map(d => d[1]);
  const avgDisplay = Math.round(toDisplay(avgChf, currency, usdChf, eurUsd));
  const isAbove = currentChf >= avgChf;
  if (prices.length === 0) return null;
  const chartMin = Math.min(...prices);
  const chartMax = Math.max(...prices);
  const minP = Math.min(chartMin * 0.92, avgDisplay > 0 ? avgDisplay * 0.95 : chartMin * 0.92);
  const maxP = chartMax * 1.06;
  const W = 340, H = 160, PAD_L = 46, PAD_R = 12, PAD_T = 12, PAD_B = 24;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const xScale = (i) => PAD_L + (i / (data.length - 1)) * cw;
  const yScale = (v) => PAD_T + ch - ((v - minP) / (maxP - minP)) * ch;
  const linePoints = data.map((d, i) => `${xScale(i)},${yScale(d[1])}`).join(" ");
  const areaPoints = [`${xScale(0)},${PAD_T + ch}`, ...data.map((d, i) => `${xScale(i)},${yScale(d[1])}`), `${xScale(data.length - 1)},${PAD_T + ch}`].join(" ");
  const buyMarkers = transactions.filter(t => t.type === "buy").map(t => { const idx = data.findIndex(d => d[0] === t.date.slice(0, 7)); if (idx < 0) return null; return { x: xScale(idx), y: yScale(data[idx][1]) }; }).filter(Boolean);
  const avgY = yScale(avgDisplay);
  const yTicks = [minP, (minP + maxP) / 2, maxP].map(v => { const nr = niceRound(v); return { v: nr, y: yScale(nr), label: nr >= 1000 ? `${Math.round(nr / 1000)}k` : Math.round(nr) }; });
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
        <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em" }}>{t("priceChart.title")}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 16, height: 2, background: "#f59e0b", borderRadius: 1 }} /><span style={{ color: T.textMuted, fontSize: 12 }}>{t("priceChart.einstand")}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} /><span style={{ color: T.textMuted, fontSize: 12 }}>{t("priceChart.kauf")}</span></div>
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
        {avgChf > 0 && (<g><line x1={PAD_L} y1={avgY} x2={PAD_L + cw} y2={avgY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" /><text x={PAD_L + cw + 2} y={avgY + 4} fill="#f59e0b" fontSize="8">{Math.round(avgDisplay / 1000)}k</text></g>)}
        {buyMarkers.map((m, i) => (<g key={i}><circle cx={m.x} cy={m.y} r="4" fill="#22c55e" opacity="0.85" /><circle cx={m.x} cy={m.y} r="7" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.3" /></g>))}
        {tooltip && (<g><line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + ch} stroke={T.textFaint} strokeWidth="1" strokeDasharray="3 3" /><circle cx={tooltip.x} cy={tooltip.y} r="4" fill={T.text} opacity="0.95" /></g>)}
      </svg>
      <div style={{ marginTop: 10, padding: "10px 14px", background: T.input, borderRadius: 8, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40 }}>
        {tooltip ? (<><span style={{ color: T.textMuted, fontSize: 13 }}>{tooltip.label}</span><span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{sym} {fmtChf(tooltip.price, 0)}</span></>) : (<><span style={{ color: T.textFaint, fontSize: 13 }}>{t("priceChart.fingerHint")}</span><span style={{ color: T.textMuted, fontSize: 13 }}>{sym} {fmtChf(toDisplay(currentChf, currency, usdChf, eurUsd), 0)}</span></>)}
      </div>
    </div>
  );
}

function BreakEvenCard({ avgChf, currentChf, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
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
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>{t("breakEven.title")}</div>
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
            <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>{language === "en" ? "CURRENT VS. COST BASIS" : "AKTUELL VS. EINSTAND"}</div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 22, fontWeight: 300 }}>{isAbove ? "+" : ""}{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(diff, currency, usdChf, eurUsd))}<span style={{ fontSize: 14, marginLeft: 4, opacity: 0.7 }}>{sym}</span></div>
            <div style={{ color: isAbove ? "#22c55e" : "#ef4444", fontSize: 14, opacity: 0.7, marginTop: 3 }}>{isAbove ? "+" : ""}{diffPct.toFixed(1)}%</div>
          </div>
          <div style={{ background: isAbove ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isAbove ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "10px 12px" }}>
            {isAbove ? (<><div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>{language === "en" ? "IN PROFIT SINCE" : "IM GEWINN SEIT"}</div><div style={{ color: "#22c55e", fontSize: 17 }}>{fmt(avgChf)}</div></>) : (<><div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>{language === "en" ? "BTC NEEDS TO RISE BY" : "BTC MUSS STEIGEN UM"}</div><div style={{ color: "#ef4444", fontSize: 17 }}>+{toBreakEvenPct.toFixed(1)}%</div><div style={{ color: T.textMuted, fontSize: 13, marginTop: 3 }}>{language === "en" ? "to" : "auf"} {fmt(avgChf)}</div></>)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: T.textMuted, fontSize: 12 }}>{t("position.einstandspreis")} {fmt(avgChf)}</span><span style={{ color: T.textMuted, fontSize: 12 }}>{language === "en" ? "Current" : "Aktuell"} {fmt(currentChf)}</span></div>
        <div style={{ height: 4, background: T.input, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, Math.max(2, (currentChf / (avgChf * 1.5)) * 100))}%`, background: isAbove ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#991b1b,#ef4444)", borderRadius: 2 }} /></div>
      </div>
    </div>
  );
}

// ── Szenario-Rechner ──────────────────────────────────────────────────────────
function SzenarioCalculator({ totalBtc, totalInvested, avgChf, btcChf, usdChf, eurUsd, T, currency = "CHF", secondaryCurrency = "none", language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const showSecondary = secondaryCurrency && secondaryCurrency !== "none" && secondaryCurrency !== currency;
  const symSec = showSecondary && CURRENCIES[secondaryCurrency] ? CURRENCIES[secondaryCurrency].symbol : "";

  const [zielInput, setZielInput] = useState("");
  const [zielCurrency, setZielCurrency] = useState(currency);
  const [zeitraum, setZeitraum] = useState("1J");
  const [sparplan, setSparplan] = useState("kein");
  const [sparInput, setSparInput] = useState("");

  const ZEITRAEUME = ["6M", "1J", "2J", "5J", "10J"];
  const MONATE = { "6M": 6, "1J": 12, "2J": 24, "5J": 60, "10J": 120 };
  const PERIODEN_PRO_MONAT = { "kein": 0, "woechentlich": 4.33, "monatlich": 1 };

  // Zielkurs immer in CHF intern
  const zielVal = parseFloat(zielInput.replace(/'/g, "")) || 0;
  const zielChf = zielVal > 0
    ? (zielCurrency === "CHF" ? zielVal
      : zielCurrency === "USD" ? zielVal * usdChf
      : zielVal * usdChf / eurUsd)
    : 0;

  // Sparplan
  const sparVal = parseFloat(sparInput.replace(/'/g, "")) || 0;
  const sparChfProPeriode = sparVal > 0
    ? (currency === "CHF" ? sparVal : currency === "USD" ? sparVal * usdChf : sparVal * usdChf / eurUsd)
    : 0;
  const anzahlMonate = MONATE[zeitraum] || 12;
  const periodenTotal = sparplan !== "kein" ? Math.round(anzahlMonate * PERIODEN_PRO_MONAT[sparplan]) : 0;
  const sparTotal = sparChfProPeriode * periodenTotal;
  const zusätzlicheBtc = zielChf > 0 && sparTotal > 0 ? sparTotal / zielChf : 0;

  // Resultate
  const gesamtBtc = totalBtc + zusätzlicheBtc;
  const portfolioWert = gesamtBtc * zielChf;
  const investiertGesamt = totalInvested + sparTotal;
  const gewinn = portfolioWert - investiertGesamt;
  const gewinnPct = investiertGesamt > 0 ? (gewinn / investiertGesamt) * 100 : 0;
  const isPos = gewinn >= 0;

  const fmt = (chfVal) => `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(toDisplay(chfVal, currency, usdChf, eurUsd))}`;
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none" };
  const hasInput = zielChf > 0;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 20px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>
        {language === "en" ? "SCENARIO CALCULATOR" : "SZENARIO-RECHNER"}
      </div>

      {/* Zielkurs */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>
          {language === "en" ? "TARGET BTC PRICE" : "ZIEL-BTC-KURS"}
        </div>
        {showSecondary && (
          <div style={{ display: "flex", background: T.input, borderRadius: 10, padding: 3, marginBottom: 10, gap: 3 }}>
            {[currency, secondaryCurrency].map((c) => (
              <button key={c} onClick={() => setZielCurrency(c)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", background: zielCurrency === c ? T.surface : "transparent", color: zielCurrency === c ? T.text : T.textMuted, border: "none", fontWeight: zielCurrency === c ? 500 : 400 }}>
                {CURRENCIES[c]?.symbol} {c}
              </button>
            ))}
          </div>
        )}
        <input type="number" step="any" inputMode="decimal"
          placeholder={zielCurrency === "CHF" ? "z.B. 150'000" : zielCurrency === "USD" ? "e.g. 200,000" : "z.B. 180'000"}
          value={zielInput} onChange={e => setZielInput(e.target.value)} style={iStyle} />
      </div>

      {/* Zeitraum */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>
          {language === "en" ? "TIME HORIZON" : "ZEITHORIZONT"}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {ZEITRAEUME.map(z => (
            <button key={z} onClick={() => setZeitraum(z)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${zeitraum === z ? "#f7931a" : T.border}`, background: zeitraum === z ? "#f7931a" : T.input, color: zeitraum === z ? "#000" : T.textMuted, fontSize: 13, fontWeight: zeitraum === z ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Sparplan */}
      <div style={{ marginBottom: hasInput ? 20 : 0 }}>
        <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>
          {language === "en" ? "SAVINGS PLAN" : "SPARPLAN"}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: sparplan !== "kein" ? 10 : 0 }}>
          {[["kein", language === "en" ? "None" : "Kein"], ["woechentlich", language === "en" ? "Weekly" : "Wöchentl."], ["monatlich", language === "en" ? "Monthly" : "Monatlich"]].map(([val, label]) => (
            <button key={val} onClick={() => setSparplan(val)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${sparplan === val ? "#f7931a" : T.border}`, background: sparplan === val ? "#f7931a" : T.input, color: sparplan === val ? "#000" : T.textMuted, fontSize: 12, fontWeight: sparplan === val ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
        {sparplan !== "kein" && (
          <input type="number" step="any" inputMode="decimal"
            placeholder={`${sym} ${language === "en" ? "e.g. 500" : "z.B. 500"}`}
            value={sparInput} onChange={e => setSparInput(e.target.value)} style={iStyle} />
        )}
      </div>

      {/* Resultate */}
      {hasInput && (
        <div style={{ background: T.input, borderRadius: 14, padding: "16px 14px", marginTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "BTC HOLDINGS" : "BTC BESTAND"}</div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{gesamtBtc.toFixed(5)} BTC</div>
              {zusätzlicheBtc > 0 && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>+{zusätzlicheBtc.toFixed(5)} Sparplan</div>}
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "PORTFOLIO VALUE" : "PORTFOLIOWERT"}</div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{fmt(portfolioWert)}</div>
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "TOTAL INVESTED" : "INVESTIERT TOTAL"}</div>
              <div style={{ color: T.text, fontSize: 15 }}>{fmt(investiertGesamt)}</div>
              {sparTotal > 0 && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>+{fmt(sparTotal)} Sparplan</div>}
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "GAIN / LOSS" : "GEWINN / VERLUST"}</div>
              <div style={{ color: isPos ? "#22c55e" : "#ef4444", fontSize: 15, fontWeight: 600 }}>
                {isPos ? "+" : ""}{fmt(gewinn)}
              </div>
              <div style={{ color: isPos ? "#22c55e" : "#ef4444", fontSize: 12, marginTop: 2 }}>
                {isPos ? "+" : ""}{gewinnPct.toFixed(1)}%
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, color: T.textFaint, fontSize: 11, textAlign: "center" }}>
            {language === "en" ? "Hypothetical scenario — not financial advice" : "Hypothetisches Szenario — keine Anlageberatung"}
          </div>
        </div>
      )}
    </div>
  );
}


function DcaCalculator({ totalBtc, totalInvested, avgChf, currentChf, usdChf, T, currency = "CHF", eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const fmt = (v) => `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd))}`;
  const [input, setInput] = useState("");
  const [feeInput, setFeeInput] = useState("0");
  const [mode, setMode] = useState("chf");
  const val = parseFloat(input) || 0, fee = parseFloat(feeInput) || 0;
  // newBtc: Gebühren kaufen keine BTC, also val / kurs (ohne fee abzug)
  const newBtc = mode === "chf" ? val / currentChf : val;
  // newChf: Gesamtkosten = Kaufbetrag + Gebühren
  const newChf = mode === "chf" ? val + fee : val * currentChf + fee;
  const costBasis = avgChf * totalBtc; // Kostenbasis der gehaltenen BTC
  const newTotalBtc = totalBtc + newBtc;
  const newTotalInvested = costBasis + newChf;
  const newAvgChf = newTotalBtc > 0 ? newTotalInvested / newTotalBtc : 0;
  const newAvgUsd = newAvgChf / usdChf;
  const avgDrop = avgChf > 0 ? ((newAvgChf - avgChf) / avgChf) * 100 : 0;
  const hasInput = val > 0;
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none" };
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 20px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>{t("dca.chartTitle")}</div>
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
        <div><div style={{ color: T.textMuted, fontSize: 12, marginBottom: 6 }}>{language === "en" ? "CURRENT COST BASIS" : "AKTUELLER EINSTAND"}</div>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 300 }}>{fmt(avgChf)}</div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>${fmtChf(avgChf / usdChf, 0)}</div>
        </div>
        <div style={{ background: hasInput ? (newAvgChf < avgChf ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)") : T.input, border: hasInput ? `1px solid ${newAvgChf < avgChf ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` : `1px solid transparent`, borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 6 }}>{language === "en" ? "NEW COST BASIS" : "NEUER EINSTAND"}</div>
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
      {!hasInput && <div style={{ color: T.textFaint, fontSize: 13, textAlign: "center", paddingTop: 4 }}>{language === "en" ? "Enter amount to see cost basis change" : "Betrag eingeben um Einstandsänderung zu sehen"}</div>}
    </div>
  );
}

// ── Realized P&L Card ─────────────────────────────────────────────────────────
function RealizedPnlCard({ transactions, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, avgChf = 0, language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const fmt = (v) => `${sym} ${new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(toDisplay(v, currency, usdChf, eurUsd))}`;

  // Realisierter Gewinn = Verkaufserlös - Einstandswert der verkauften BTC (nach FIFO/AVCO = avgChf)
  const sells = transactions.filter(t => t.type === "sell");
  const totalProceeds = sells.reduce((s, t) => s + +t.chf - +(t.fee || 0), 0);
  const totalCostBasis = sells.reduce((s, t) => s + +t.btc * avgChf, 0);
  const realizedPnl = totalProceeds - totalCostBasis;
  const isPos = realizedPnl >= 0;

  if (sells.length === 0) {
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px", marginBottom: 12 }}>
        <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 12 }}>{t("realizedPnl.title")}</div>
        <div style={{ color: T.textFaint, fontSize: 14, textAlign: "center", padding: "16px 0" }}>{t("realizedPnl.keinVerkauf")}</div>
      </div>
    );
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 16 }}>{t("realizedPnl.title")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: isPos ? "#22c55e" : "#ef4444", letterSpacing: "-0.02em" }}>
            {isPos ? "+" : ""}{fmt(realizedPnl)}
          </div>
          <div style={{ color: T.textMuted, fontSize: 13, marginTop: 4 }}>{language === "en" ? `from ${sells.length} sale${sells.length > 1 ? "s" : ""}` : `aus ${sells.length} Verkauf${sells.length > 1 ? "en" : ""}`}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 4 }}>{language === "en" ? "Sale Proceeds" : "Verkaufserlös"}</div>
          <div style={{ color: T.text, fontSize: 15, fontWeight: 500 }}>{fmt(totalProceeds)}</div>
          <div style={{ color: T.textMuted, fontSize: 12, marginTop: 8, marginBottom: 4 }}>{language === "en" ? "Cost Basis" : "Einstandswert"}</div>
          <div style={{ color: T.text, fontSize: 15, fontWeight: 500 }}>{fmt(totalCostBasis)}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: isPos ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${isPos ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10 }}>
        <span style={{ color: T.textMuted, fontSize: 13 }}>{language === "en" ? `Based on current cost basis of ${fmt(avgChf)} / BTC` : `Basierend auf aktuellem Einstandspreis von ${fmt(avgChf)} / BTC`}</span>
      </div>
    </div>
  );
}

// ── DCA Effizienz Chart ────────────────────────────────────────────────────────
function DcaEfficiencyChart({ transactions, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  const fmt0 = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(toDisplay(v, currency, usdChf, eurUsd));

  // Durchschnittlicher Kaufpreis pro Jahr
  const byYear = {};
  transactions.filter(t => t.type === "buy").forEach(t => {
    const year = t.date.slice(0, 4);
    if (!byYear[year]) byYear[year] = { totalChf: 0, totalBtc: 0 };
    byYear[year].totalChf += +t.chf + +(t.fee || 0);
    byYear[year].totalBtc += +t.btc;
  });

  const years = Object.keys(byYear).sort();
  if (years.length === 0) return null;

  const bars = years.map(year => ({
    year,
    avgPrice: byYear[year].totalBtc > 0 ? byYear[year].totalChf / byYear[year].totalBtc : 0,
    invested: byYear[year].totalChf,
  }));

  const maxPrice = Math.max(...bars.map(b => b.avgPrice)) * 1.15;
  const barH = 140;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textSub, fontSize: 13, letterSpacing: "0.04em", marginBottom: 4 }}>{language === "en" ? "PURCHASE PRICE EFFICIENCY" : "KAUFPREIS-EFFIZIENZ"}</div>
      <div style={{ color: T.textFaint, fontSize: 12, marginBottom: 16 }}>{language === "en" ? `Avg. purchase price per year in ${sym}` : `Ø Kaufpreis pro Jahr in ${sym}`}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: barH + 40, paddingBottom: 24, paddingRight: 48, position: "relative" }}>
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <div key={f} style={{ position: "absolute", left: 0, right: 48, bottom: 24 + f * barH, borderTop: `1px solid ${T.border}`, pointerEvents: "none" }}>
            <span style={{ position: "absolute", right: -46, bottom: 2, color: T.textFaint, fontSize: 9 }}>{fmt0(niceRound(maxPrice * f))}</span>
          </div>
        ))}
        {bars.map(({ year, avgPrice, invested }) => {
          const h = Math.max(4, (avgPrice / maxPrice) * barH);
          // Farbe: günstiger als Durchschnitt = grün, teurer = rot
          const avgAll = bars.reduce((s, b) => s + b.avgPrice, 0) / bars.length;
          const color = avgPrice <= avgAll ? "#22c55e" : "#ef4444";
          return (
            <div key={year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 4 }}>
              <div style={{ color: T.textFaint, fontSize: 9, textAlign: "center" }}>{fmt0(niceRound(avgPrice))}</div>
              <div style={{ width: "100%", height: h, background: color, borderRadius: "4px 4px 2px 2px", opacity: 0.8 }} />
              <div style={{ color: T.textMuted, fontSize: 10, textAlign: "center" }}>{year.slice(2)}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e", opacity: 0.8 }} />
          <span style={{ fontSize: 12, color: T.textMuted }}>Unter Ø</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ef4444", opacity: 0.8 }} />
          <span style={{ fontSize: 12, color: T.textMuted }}>Über Ø</span>
        </div>
      </div>
    </div>
  );
}

// ── Onboarding ───────────────────────────────────────────────────────────────
function OnboardingScreen({ onFinish, T, language }) {
  const t = tr(translations, language);
  const [slide, setSlide] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const privacyContent = t("privacy.sections");
  const slidesData = t("onboarding.slides");
  const slides = [
    { icon: "t",       iconBg: "#f7931a", title: slidesData[0].title, text: slidesData[0].text },
    { icon: "chart",   iconBg: null,      title: slidesData[1].title, text: slidesData[1].text },
    { icon: "analyse", iconBg: null,      title: slidesData[2].title, text: slidesData[2].text },
    { icon: "currency",iconBg: null,      title: slidesData[3].title, text: slidesData[3].text },
    { icon: "privacy", iconBg: null,      title: slidesData[4].title, text: slidesData[4].text },
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
              <line x1="108" y1="90" x2="108" y2="32" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
              <line x1="108" y1="90" x2="178" y2="90" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
              <polyline points="118,72 132,54 148,64 168,36" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="168" cy="36" r="5" fill="#000"/>
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
          {t("onboarding.datenschutzLink")}
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
          <button onClick={onFinish} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 14, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("onboarding.ueberspringen")}</button>
        )}
        <button onClick={() => isLast ? onFinish() : setSlide(s => s + 1)} style={{ padding: "15px 0", background: "#f7931a", border: "none", color: "#000", borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>
          {isLast ? t("onboarding.loslegen") : t("onboarding.weiter")}
        </button>
      </div>
    {showPrivacy && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowPrivacy(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("privacy.title")}</div>
          {privacyContent.map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>{t("privacy.close")}</button>
        </div>
      </div>
    )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsView({ darkMode, setDarkMode, T, transactions, userEmail, onLogout, currency = "CHF", setCurrency, usdChf = 0.9, eurUsd = 0.92, btcChf = 0, btcUsd = 0, onResetOnboarding, onImport, costMethod = "FIFO", setCostMethod, language, setLanguage, secondaryCurrency = "none", setSecondaryCurrency, fontScale = "M", setFontScale }) {
  const t = tr(translations, language);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAgbModal, setShowAgbModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCostInfo, setShowCostInfo] = useState(false);
  const [importResult, setImportResult] = useState(null); // {imported, skipped}
  const [importing, setImporting] = useState(false);

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target.result.replace(/^﻿/, ""); // BOM entfernen
        const lines = text.split("\n").filter(l => l.trim());
        if (lines.length < 2) { setImporting(false); return; }
        const rows = lines.slice(1).map(line => {
          const parts = line.split(",");
          const note = parts[5]?.trim().replace(/^"|"$/g, "") || "";
          let type = parts[1]?.trim();
          // Notiz-basiertes Mapping für ältere CSVs
          if (type === "transfer" && note === "TransferIn")  type = "transfer_in";
          if (type === "transfer" && note === "TransferOut") type = "transfer_out";
          return {
            date: parts[0]?.trim(),
            type,
            btc:  parseFloat(parts[2]) || 0,
            chf:  parseFloat(parts[3]) || 0,
            fee:  parseFloat(parts[4]) || 0,
            note: (note === "TransferIn" || note === "TransferOut") ? "" : note,
          };
        }).filter(r => r.date && r.type && r.btc > 0);

        // Duplikate prüfen: gleiche date + type + btc bereits vorhanden?
        const existing = new Set(transactions.map(t => `${t.date}_${t.type}_${t.btc}`));
        const toImport = rows.filter(r => !existing.has(`${r.date}_${r.type}_${r.btc}`));
        const skipped = rows.length - toImport.length;

        const result = await onImport(toImport);
        setImportResult({ imported: result, skipped });
      } catch (err) {
        setImportResult({ error: err.message });
      }
      setImporting(false);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = ""; // Reset input
  };



  return (
    <>
    <div style={{ padding: "8px 16px", overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", paddingBottom: 100 }}>

      {/* KONTO */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.konto")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ color: T.textMuted, fontSize: 14 }}>{t("settings.eingeloggtAls")}</span>
          <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{userEmail}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.passwortAendern")}</span>
          <button onClick={() => setShowPwModal(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
        <div style={{ padding: "4px 0" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", color: "#ef4444", fontSize: 15, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>{t("settings.abmelden")}</button>
        </div>
      </div>

      {/* DARSTELLUNG — Dark/Light + Schriftgrösse zusammen */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.darstellung")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 500 }}>{darkMode ? t("settings.darkMode") : t("settings.lightMode")}</div>
            <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{darkMode ? t("settings.darkModeAktiv") : t("settings.lightModeAktiv")}</div>
          </div>
          <div onClick={() => setDarkMode(!darkMode)} style={{ width: 51, height: 31, borderRadius: 16, cursor: "pointer", background: darkMode ? "#f7931a" : "#e0e0e0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
            <div style={{ width: 27, height: 27, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: darkMode ? 22 : 2, transition: "left 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
        <div style={{ padding: "14px 18px" }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 10 }}>{language === "en" ? "Text Size" : "Schriftgrösse"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["S", language === "en" ? "Small" : "Klein"], ["M", language === "en" ? "Medium" : "Mittel"], ["L", language === "en" ? "Large" : "Gross"]].map(([scale, label]) => (
              <button key={scale} onClick={() => setFontScale(scale)}
                style={{ padding: "10px 0", background: fontScale === scale ? "#f7931a" : T.input, border: `1px solid ${fontScale === scale ? "#f7931a" : T.border}`, borderRadius: 10, color: fontScale === scale ? "#000" : T.textMuted, fontSize: scale === "S" ? 13 : scale === "M" ? 15 : 17, fontWeight: fontScale === scale ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PORTFOLIO-WÄHRUNG */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 4, marginTop: 24 }}>{t("settings.portfolioWaehrung")}</div>
      <div style={{ color: T.textFaint, fontSize: 12, marginBottom: 8 }}>{t("settings.portfolioWaehrungHint")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {["CHF", "EUR", "USD"].map((c, i) => (
            <button key={c} onClick={() => setCurrency(c)} style={{ padding: "14px 0", background: currency === c ? "#f7931a" : "none", border: "none", borderRight: i < 2 ? `1px solid ${T.border}` : "none", color: currency === c ? "#000" : T.textMuted, fontSize: 15, fontWeight: currency === c ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
          ))}
        </div>
      </div>

      {/* SEKUNDÄRKURS */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 4, marginTop: 16 }}>{t("settings.sekundaerkurs")}</div>
      <div style={{ color: T.textFaint, fontSize: 12, marginBottom: 8 }}>{t("settings.sekundaerkursHint")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0 }}>
          {["none", "CHF", "EUR", "USD"].map((c, i) => {
            const isActive = secondaryCurrency === c;
            const isDisabled = c !== "none" && c === currency;
            const label = c === "none" ? t("settings.sekundaerkursAus") : c;
            return (
              <button key={c} onClick={() => !isDisabled && setSecondaryCurrency(c)}
                style={{ padding: "14px 0", background: isActive ? "#f7931a" : "none", border: "none", borderRight: i < 3 ? `1px solid ${T.border}` : "none", color: isActive ? "#000" : isDisabled ? T.textFaint : T.textMuted, fontSize: 14, fontWeight: isActive ? 600 : 400, cursor: isDisabled ? "default" : "pointer", fontFamily: "inherit", opacity: isDisabled ? 0.35 : 1 }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* EINSTANDSPREIS-METHODE */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 24 }}>
        <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em" }}>{t("settings.einstandsMethode")}</div>
        <button onClick={() => setShowCostInfo(true)} style={{ background: T.input, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: "50%", width: 24, height: 24, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", flexShrink: 0, padding: 0, lineHeight: 1 }}>?</button>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {["FIFO", "AVCO"].map((key, i) => (
            <button key={key} onClick={() => setCostMethod(key)} style={{ padding: "14px 0", background: costMethod === key ? "#f7931a" : "none", border: "none", borderRight: i === 0 ? `1px solid ${T.border}` : "none", color: costMethod === key ? "#000" : T.textMuted, fontSize: 15, fontWeight: costMethod === key ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{key}</button>
          ))}
        </div>
      </div>
      {showCostInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowCostInfo(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("costInfo.title")}</div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t("costInfo.fifoTitle")}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.55 }}>{t("costInfo.fifoText")}</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{t("costInfo.avcoTitle")}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.55 }}>{t("costInfo.avcoText")}</div>
            </div>
            <button onClick={() => setShowCostInfo(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("costInfo.close")}</button>
          </div>
        </div>
      )}

      {/* SPRACHE */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.sprache")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {[["de", "Deutsch 🇩🇪"], ["en", "English 🇬🇧"]].map(([code, label], i) => (
            <button key={code} onClick={() => setLanguage(code)} style={{ padding: "14px 0", background: language === code ? "#f7931a" : "none", border: "none", borderRight: i === 0 ? `1px solid ${T.border}` : "none", color: language === code ? "#000" : T.textMuted, fontSize: 14, fontWeight: language === code ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
          ))}
        </div>
      </div>

      {/* DATEN */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.daten")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ color: T.text, fontSize: 15 }}>{t("settings.importieren")}</div>
            <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.importierenHint")}</div>
          </div>
          <label style={{ background: "#f7931a", border: "none", color: "#000", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", flexShrink: 0 }}>
            {importing ? t("settings.importLaedt") : t("settings.importBtn")}
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} disabled={importing} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ color: T.text, fontSize: 15 }}>{t("settings.demoLaden")}</div>
            <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.demoLadenHint")}</div>
          </div>
          <button onClick={() => setShowDemoModal(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit", flexShrink: 0 }}>{t("settings.demoLadenBtn")}</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <div>
            <div style={{ color: "#ef4444", fontSize: 15 }}>{t("settings.alleLoeschen")}</div>
            <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.alleLoeschenHint")}</div>
          </div>
          <button onClick={() => setShowClearModal(true)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontFamily: "inherit", flexShrink: 0 }}>{t("settings.alleLoeschenBtn")}</button>
        </div>
        {importResult && !importResult.error && (
          <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.border}`, background: "rgba(34,197,94,0.06)" }}>
            <span style={{ color: "#22c55e", fontSize: 13 }}>✓ {importResult.imported} {t("settings.importiert")}</span>
            {importResult.skipped > 0 && <span style={{ color: T.textFaint, fontSize: 13 }}> · {importResult.skipped} {t("settings.uebersprungen")}</span>}
          </div>
        )}
        {importResult?.error && (
          <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.border}` }}>
            <span style={{ color: "#ef4444", fontSize: 13 }}>{t("settings.fehler")}: {importResult.error}</span>
          </div>
        )}
      </div>

      {/* APP INFO */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.appInfo")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        {[{ label: t("settings.version"), value: "2.8.0" }, { label: t("settings.datenbank"), value: "Supabase" }, { label: t("settings.kursApi"), value: "CoinGecko" }].map(({ label, value }, i, arr) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ color: T.text, fontSize: 15 }}>{label}</span>
            <span style={{ color: T.textMuted, fontSize: 15 }}>{value}</span>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderTop: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.onboardingReset")}</span>
          <button onClick={onResetOnboarding} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
      </div>

      {/* RECHTLICHES */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.rechtliches")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.agb")}</span>
          <button onClick={() => setShowAgbModal(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.datenschutz")}</span>
          <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
      </div>

      {/* GEFAHRENZONE */}
      <div style={{ color: "#ef4444", fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 32 }}>{t("settings.kontoLoeschenSection")}</div>
      <div style={{ background: T.surface, border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <span style={{ color: "#ef4444", fontSize: 15 }}>{t("settings.kontoLoeschen")}</span>
          <button onClick={() => setShowDeleteModal(true)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>→</button>
        </div>
      </div>

    </div>
    {showPwModal && <PasswordModal onClose={() => setShowPwModal(false)} T={T} language={language} />}
    {showDeleteModal && <DeleteAccountModal onClose={() => setShowDeleteModal(false)} onLogout={onLogout} T={T} language={language} />}
    {showClearModal && <ClearDataModal onClose={() => setShowClearModal(false)} onImport={onImport} T={T} language={language} />}
    {showDemoModal && <DemoImportModal key={String(showDemoModal)} onClose={() => setShowDemoModal(false)} onImport={onImport} transactions={transactions} T={T} language={language} />}
    {showAgbModal && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowAgbModal(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "85vh", overflowY: "auto", padding: "28px 24px 40px" }}>
          <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "0 auto 20px" }} />
          <div style={{ color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("settings.agbTitle")}</div>
          {AGB_SECTIONS.map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 18 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowAgbModal(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>{t("common.schliessen")}</button>
        </div>
      </div>
    )}
    {showPrivacy && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowPrivacy(false)}>
        <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("privacy.title")}</div>
          {t("privacy.sections").map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 16 }}>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>{t("privacy.close")}</button>
        </div>
      </div>
    )}
    </>
  );
}

// ── Password Modal ────────────────────────────────────────────────────────────
function PasswordModal({ onClose, T, language }) {
  const t = tr(translations, language);
  const [pwForm, setPwForm] = useState({ next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwError, setPwError] = useState("");
  const [showPwNext, setShowPwNext] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));
  const iStyle = { width: "100%", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };

  const handleSave = async () => {
    if (!pwForm.next || pwForm.next !== pwForm.confirm) {
      setPwError(t("pwModal.nichtUebereinstimmend")); return;
    }
    if (pwForm.next.length < 6) {
      setPwError(t("pwModal.zuKurz")); return;
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
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("pwModal.title")}</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>{t("pwModal.neuesPasswort")}</div>
          <div style={{ position: "relative" }}>
            <input type={showPwNext ? "text" : "password"} placeholder={t("pwModal.placeholder")} value={pwForm.next} onChange={e => setPw("next", e.target.value)} style={{ ...iStyle, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPwNext(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textFaint, fontSize: 18, padding: 0, display: "flex", alignItems: "center" }}>
              {showPwNext ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>{t("pwModal.bestaetigen")}</div>
          <div style={{ position: "relative" }}>
            <input type={showPwConfirm ? "text" : "password"} placeholder={t("pwModal.placeholderRepeat")} value={pwForm.confirm} onChange={e => setPw("confirm", e.target.value)} style={{ ...iStyle, paddingRight: 48 }} />
            <button type="button" onClick={() => setShowPwConfirm(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.textFaint, fontSize: 18, padding: 0, display: "flex", alignItems: "center" }}>
              {showPwConfirm ? "🙈" : "👁"}
            </button>
          </div>
        </div>
        {pwError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{pwError}</div>}
        {pwStatus === "ok" && <div style={{ color: "#22c55e", fontSize: 13, marginBottom: 14 }}>{t("pwModal.erfolg")}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("pwModal.abbrechen")}</button>
          <button onClick={handleSave} disabled={pwStatus === "saving"} style={{ padding: "15px 0", background: pwStatus === "saving" ? T.textFaint : "#f7931a", border: "none", color: "#000", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {pwStatus === "saving" ? t("pwModal.speichernLaed") : t("pwModal.speichern")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({ onClose, onLogout, T, language }) {
  const t = tr(translations, language);
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const confirmed = confirm === t("deleteAccount.confirmWord");

  const handleDelete = async () => {
    if (!confirmed) return;
    setStatus("saving"); setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/api/transactions/account`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
      if (!res.ok) throw new Error(t("deleteAccount.fehler"));
      await supabase.auth.signOut();
      onLogout();
    } catch (e) {
      setError(e.message); setStatus("error");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⚠️</div>
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{t("deleteAccount.title")}</div>
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 16 }}>{t("deleteAccount.beschreibung")}</div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 20, padding: "10px 16px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>
          {t("deleteAccount.warnung")}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>{t("deleteAccount.hinweis")} <strong style={{ color: "#ef4444" }}>{t("deleteAccount.hinweisWort")}</strong> {t("deleteAccount.hinweisRest")}</div>
          <input type="text" placeholder={t("deleteAccount.placeholder")} value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", background: T.input, border: `1px solid ${confirmed ? "#ef4444" : T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("deleteAccount.abbrechen")}</button>
          <button onClick={handleDelete} disabled={!confirmed || status === "saving"} style={{ padding: "15px 0", background: confirmed ? "#ef4444" : T.textFaint, border: "none", color: "#fff", borderRadius: 12, cursor: confirmed ? "pointer" : "default", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {status === "saving" ? t("deleteAccount.loeschenLaed") : t("deleteAccount.loeschen")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Clear Data Modal ──────────────────────────────────────────────────────────
function ClearDataModal({ onClose, onImport, T, language }) {
  const t = tr(translations, language);
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0); // 0-100
  const [progressLabel, setProgressLabel] = useState("");
  const confirmed = confirm === t("clearData.confirmWord");

  const handleClear = async () => {
    if (!confirmed) return;
    setStatus("saving"); setError(""); setProgress(0);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const { data: rows } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", session.user.id);
      const total = (rows || []).length;
      if (total === 0) { setStatus("ok"); setTimeout(() => { onClose(); window.location.reload(); }, 1000); return; }
      setProgressLabel(`0 / ${total}`);
      for (let i = 0; i < rows.length; i++) {
        await fetch(`${API_BASE}/api/transactions/${rows[i].id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
        const pct = Math.round(((i + 1) / total) * 100);
        setProgress(pct);
        setProgressLabel(`${i + 1} / ${total}`);
      }
      setStatus("ok");
      setTimeout(() => { onClose(); window.location.reload(); }, 1200);
    } catch (e) {
      setError(e.message); setStatus("error");
    }
  };

  const isSaving = status === "saving";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={isSaving ? undefined : onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🗑️</div>
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{t("clearData.title")}</div>
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 16 }}>{t("clearData.beschreibung")}</div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 20, padding: "10px 16px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>
          {t("clearData.warnung")}
        </div>
        {!isSaving && status !== "ok" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 6 }}>{t("clearData.hinweis")} <strong style={{ color: "#ef4444" }}>{t("clearData.hinweisWort")}</strong> {t("clearData.hinweisRest")}</div>
            <input type="text" placeholder={t("clearData.placeholder")} value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", background: T.input, border: `1px solid ${confirmed ? "#ef4444" : T.inputBorder}`, color: T.text, padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        {isSaving && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.textMuted, fontSize: 13 }}>{t("clearData.loeschenLaed")}</span>
              <span style={{ color: T.textMuted, fontSize: 13 }}>{progressLabel}</span>
            </div>
            <div style={{ height: 8, background: T.input, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#ef4444", borderRadius: 4, transition: "width 0.2s ease" }} />
            </div>
          </div>
        )}
        {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {status === "ok" && <div style={{ color: "#22c55e", fontSize: 13, marginBottom: 14, textAlign: "center" }}>✓ {t("clearData.title")}</div>}
        {!isSaving && status !== "ok" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("clearData.abbrechen")}</button>
            <button onClick={handleClear} disabled={!confirmed} style={{ padding: "15px 0", background: confirmed ? "#ef4444" : T.textFaint, border: "none", color: "#fff", borderRadius: 12, cursor: confirmed ? "pointer" : "default", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
              {t("clearData.loeschen")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Demo Import Modal ─────────────────────────────────────────────────────────

function DemoImportModal({ onClose, onImport, transactions, T, language }) {
  const t = tr(translations, language);
  const [status, setStatus] = useState(null); // null | "saving" | "done" | "error"
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    setStatus("saving"); setProgress(0);
    let animPct = 0;
    const anim = setInterval(() => {
      animPct = Math.min(animPct + 4, 90);
      setProgress(animPct);
    }, 150);
    try {
      const res = await fetch(`${API_BASE}/demo-transaktionen.csv`);
      if (!res.ok) throw new Error("CSV nicht gefunden");
      const text = await res.text();
      const lines = text.replace(/^\uFEFF/, "").split("\n").filter(l => l.trim());
      const rows = lines.slice(1).map(line => {
        const parts = line.split(",");
        return {
          date: parts[0]?.trim(),
          type: parts[1]?.trim(),
          btc:  parseFloat(parts[2]) || 0,
          chf:  parseFloat(parts[3]) || 0,
          fee:  parseFloat(parts[4]) || 0,
          note: parts[5]?.trim().replace(/^"|"$/g, "") || "",
        };
      }).filter(r => r.date && r.type && r.btc > 0);

      const existing = new Set(transactions.map(tx => `${tx.date}_${tx.type}_${tx.btc}`));
      const toImport = rows.filter(r => !existing.has(`${r.date}_${r.type}_${r.btc}`));
      const skipped = rows.length - toImport.length;

      if (toImport.length === 0) {
        clearInterval(anim);
        setProgress(100);
        setResult({ imported: 0, skipped, total: rows.length });
        setStatus("done");
        return;
      }

      const imported = await onImport(toImport);
      clearInterval(anim);
      setProgress(100);
      setResult({ imported, skipped, total: rows.length });
      setStatus("done");
    } catch (e) {
      clearInterval(anim);
      setStatus("error");
    }
  };

  const isSaving = status === "saving";
  const isDone = status === "done";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={isSaving ? undefined : onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(247,147,26,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📊</div>
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{t("demoImport.title")}</div>
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 1.55 }}>
          {t("demoImport.beschreibung")}
        </div>

        {isSaving && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8, textAlign: "center" }}>{t("demoImport.laed")}</div>
            <div style={{ height: 8, background: T.input, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#f7931a", borderRadius: 4, transition: "width 0.15s ease" }} />
            </div>
          </div>
        )}

        {isDone && result && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: result.imported > 0 ? "rgba(34,197,94,0.08)" : "rgba(247,147,26,0.08)", borderRadius: 10, textAlign: "center" }}>
            {result.imported > 0
              ? <span style={{ color: "#22c55e", fontSize: 14 }}>✓ {result.imported} {t("settings.importiert")}{result.skipped > 0 ? ` · ${result.skipped} ${t("settings.uebersprungen")}` : ""}</span>
              : <span style={{ color: "#f7931a", fontSize: 14 }}>{result.total} {t("settings.uebersprungen")}</span>
            }
          </div>
        )}

        {status === "error" && (
          <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 14, textAlign: "center" }}>{t("settings.fehler")}</div>
        )}

        {!isSaving && (
          <div style={{ display: "grid", gridTemplateColumns: isDone ? "1fr" : "1fr 2fr", gap: 12 }}>
            {!isDone && (
              <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("demoImport.abbrechen")}</button>
            )}
            <button onClick={isDone ? onClose : handleImport} style={{ padding: "15px 0", background: "#f7931a", border: "none", color: "#000", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
              {isDone ? t("common.schliessen") : t("demoImport.laden")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Transaction Modal ─────────────────────────────────────────────────────────
function TransactionModal({ onClose, onSave, editTx, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const TYPE_META = getTypeMeta(t);
  const sym = CURRENCIES[currency].symbol;
  // Wenn editTx, zeige gespeicherten CHF-Wert in gewählter Währung
  const chfToDisplay = (v) => currency === "CHF" ? v : currency === "USD" ? v / usdChf : (v / usdChf) * eurUsd;
  const displayToChf = (v) => currency === "CHF" ? v : currency === "USD" ? v * usdChf : (v / eurUsd) * usdChf;
  const blank = { date: new Date().toISOString().slice(0, 10), btc: "", chf: "", fee: "", type: "buy", note: "" };
  const [form, setForm] = useState(editTx ? { ...editTx, btc: String(editTx.btc), chf: String(parseFloat(chfToDisplay(editTx.chf).toFixed(2))), fee: String(parseFloat(chfToDisplay(editTx.fee ?? 0).toFixed(2))) } : blank);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isTransfer = form.type === "transfer_in" || form.type === "transfer_out";
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
        <div style={{ color: T.text, fontSize: 19, fontWeight: 500, marginBottom: 20 }}>{editTx ? t("txModal.titelEdit") : t("txModal.titelNeu")}</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.typ")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(TYPE_META).map(([k, m]) => (<button key={k} onClick={() => set("type", k)} style={{ padding: "10px 0", borderRadius: 10, background: form.type === k ? m.bg : T.input, border: `1px solid ${form.type === k ? m.color + "55" : T.inputBorder}`, color: form.type === k ? m.color : T.textMuted, cursor: "pointer", fontSize: 14, fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ fontSize: 17 }}>{m.icon}</span>{m.label}</button>))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.datum")}</div>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={iStyle} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.btcMenge")}</div><input type="number" placeholder="z.B. 0.005" inputMode="decimal" value={form.btc} onChange={e => set("btc", e.target.value)} style={iStyle} step="any" /></div>
          {isTransfer
            ? <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.gebuehr")} (BTC)</div><input type="number" placeholder="z.B. 0.00002" inputMode="decimal" value={form.fee} onChange={e => set("fee", e.target.value)} style={iStyle} step="any" /></div>
            : <div><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.betrag")} ({sym})</div><input type="number" placeholder={currency === "CHF" ? "z.B. 3'500.00" : currency === "USD" ? "z.B. 3'800.00" : "z.B. 3'600.00"} inputMode="decimal" value={form.chf} onChange={e => set("chf", e.target.value)} style={iStyle} step="any" /></div>}
        </div>
        {!isTransfer && +form.btc > 0 && +form.chf > 0 && (
          <div style={{ marginTop: 10, marginBottom: 4, padding: "10px 14px", background: T.input, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: T.textMuted, fontSize: 13 }}>{t("txModal.preisPro")}</span>
            <span style={{ color: T.text, fontSize: 15, fontWeight: 500 }}>{sym} {new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(+form.chf / +form.btc)}</span>
          </div>
        )}
        {!isTransfer && <div style={{ marginBottom: 16, marginTop: 12 }}><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.gebuehr")} ({sym})</div><input type="number" placeholder="z.B. 5.50" inputMode="decimal" value={form.fee} onChange={e => set("fee", e.target.value)} style={iStyle} step="any" /></div>}
        <div style={{ marginBottom: 16, marginTop: !isTransfer ? 0 : 12 }}><div style={{ color: T.textMuted, fontSize: 13, marginBottom: 8 }}>{t("txModal.notiz")}</div><input type="text" placeholder={isTransfer ? "z.B. Kraken → Ledger" : "z.B. DCA Kauf"} value={form.note} onChange={e => set("note", e.target.value)} style={iStyle} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("txModal.abbrechen")}</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "15px 0", background: saving ? T.textFaint : TYPE_META[form.type].color, border: "none", color: form.type === "buy" ? "#000" : "#fff", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
            {saving ? t("txModal.speichernLaed") : editTx ? t("txModal.speichern") : `${TYPE_META[form.type].label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ tx, onConfirm, onCancel, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const TYPE_META = getTypeMeta(t);
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
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>{t("deleteModal.title")}</div>
        {/* Detail */}
        <div style={{ color: T.textMuted, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          <span style={{ color: m.color, fontWeight: 500 }}>{m.label}</span>
          {" · "}{fmtBtc(tx.btc)} BTC
          {tx.type !== "transfer_in" && tx.type !== "transfer_out" && <> · {sym} {fmtTx(tx.chf)}</>}
          <br />
          <span style={{ fontSize: 13 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</span>
        </div>
        <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", marginBottom: 24, padding: "10px 16px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>
          {t("deleteModal.irreversible")}
        </div>
        {/* Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={onCancel} style={{ padding: "15px 0", background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("deleteModal.abbrechen")}</button>
          <button onClick={onConfirm} style={{ padding: "15px 0", background: "#ef4444", border: "none", color: "#fff", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>{t("deleteModal.loeschen")}</button>
        </div>
      </div>
    </div>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxRow({ tx, onDelete, onEdit, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const TYPE_META = getTypeMeta(t);
  const [showConfirm, setShowConfirm] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(null);
  const THRESHOLD = 72; // px bis Button sichtbar
  const m = TYPE_META[tx.type];
  const sym = CURRENCIES[currency].symbol;
  const fmtTx = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:2,maximumFractionDigits:2}).format(toDisplay(v, currency, usdChf, eurUsd));

  const onTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };
  const onTouchMove = (e) => {
    if (startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    setSwipeX(Math.max(-THRESHOLD, Math.min(0, dx)));
  };
  const onTouchEnd = () => {
    if (swipeX < -THRESHOLD * 0.5) {
      setSwipeX(-THRESHOLD);
    } else {
      setSwipeX(0);
    }
    setSwiping(false);
    startXRef.current = null;
  };

  const close = () => setSwipeX(0);

  return (
    <>
      <div style={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${T.border}` }}>
        {/* Roter Löschen-Button dahinter */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: THRESHOLD, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 0 0" }}>
          <button onClick={() => { close(); setShowConfirm(true); }} style={{ background: "none", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 18 }}>✕</span>
            <span>{t("deleteModal.loeschen")}</span>
          </button>
        </div>
        {/* Zeilen-Inhalt — verschiebt sich beim Swipe */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", background: T.surface, transform: `translateX(${swipeX}px)`, transition: swiping ? "none" : "transform 0.25s ease", willChange: "transform" }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ color: T.text, fontSize: 16 }}>{fmtBtc(tx.btc)} <span style={{ color: T.textMuted, fontSize: 13 }}>BTC</span></div>
              <div style={{ color: m.color, fontSize: 15 }}>
                {tx.type === "transfer_in"  ? `+${tx.btc} BTC` :
                 tx.type === "transfer_out" ? `−${tx.btc} BTC` :
                 `${sym} ${fmtTx(tx.chf)}`}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <div style={{ color: T.textMuted, fontSize: 13 }}>{tx.date}{tx.note ? ` · ${tx.note}` : ""}</div>
              {tx.fee > 0 && tx.type !== "transfer_in" && tx.type !== "transfer_out" && <div style={{ color: T.textFaint, fontSize: 12 }}>{t("verlauf.gebuehr")} {sym} {fmtTx(tx.fee)}</div>}
            </div>
          </div>
          <button onClick={() => { close(); onEdit(tx); }} style={{ background: "none", border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 8, cursor: "pointer", fontSize: 14, padding: "7px 10px", flexShrink: 0 }}>✎</button>
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
          language={language}
        />
      )}
    </>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ view, setView, onAdd, T, language }) {
  const t = tr(translations, language);
  const btn = (id, icon, label) => (
    <button onClick={() => setView(id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 0 }}>
      <span style={{ fontSize: 19, color: view === id ? "#f7931a" : T.textFaint, width: 24, textAlign: "center", display: "block" }}>{icon}</span>
      <span style={{ fontSize: 10, color: view === id ? "#f7931a" : T.textFaint, fontWeight: view === id ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: T.navBg, backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "10px 16px calc(16px + env(safe-area-inset-bottom))" }}>
      {btn("dashboard", "◈", t("nav.dashboard"))}
      {btn("analyse", "◎", t("nav.analyse"))}
      <button onClick={onAdd} style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, #f7931a, #e07b10)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#000", fontWeight: 400, lineHeight: "56px", boxShadow: "0 4px 20px rgba(247,147,26,0.35)", flexShrink: 0 }}>+</button>
      {btn("verlauf", "≡", t("nav.verlauf"))}
      {btn("tools", "⊞", t("nav.tools"))}
    </div>
  );
}

// ── Main App — v2.1.0 ───────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]               = useState(null);
  const [authLoading, setAuthLoading]       = useState(true);
  const [transactions, setTransactions]     = useState([]);
  const [btcUsd, setBtcUsd]                 = useState(77664);
  const [usdChf, setUsdChf]                 = useState(0.787);
  const [eurUsd, setEurUsd]                 = useState(0.92);
  const [dayChangePct, setDayChangePct]     = useState(1.25);
  const [historicChartData, setHistoricChartData] = useState([]);
  const [rawPriceData, setRawPriceData] = useState([]); // [[YYYY-MM-DD, usdPrice], ...]
  const [lastUpdated, setLastUpdated]       = useState(null);
  const [view, setView]                     = useState("dashboard");
  const [showModal, setShowModal]           = useState(false);
  const [showDcaModal, setShowDcaModal]         = useState(false);
  const [showSzenarioModal, setShowSzenarioModal] = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [aiResult, setAiResult]             = useState(null);
  const [aiLoading, setAiLoading]           = useState(false);
  const [aiActiveTool, setAiActiveTool]     = useState(null); // "portfolio" | "market"
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

  const [secondaryCurrency, setSecondaryCurrencyState] = useState(() => {
    try { return localStorage.getItem("secondaryCurrency") || "none"; } catch { return "none"; }
  });
  const setSecondaryCurrency = (c) => { setSecondaryCurrencyState(c); try { localStorage.setItem("secondaryCurrency", c); } catch {} };

  const [fontScale, setFontScaleState] = useState(() => {
    try { return localStorage.getItem("fontScale") || "M"; } catch { return "M"; }
  });
  const setFontScale = (s) => { setFontScaleState(s); try { localStorage.setItem("fontScale", s); } catch {} };

  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("language");
      if (saved) return saved;
      return navigator.language?.startsWith("de") ? "de" : "en";
    } catch { return "de"; }
  });
  const setLanguage = (l) => { setLanguageState(l); try { localStorage.setItem("language", l); } catch {} };
  const t = tr(translations, language);

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
    const scale = { S: "0.9", M: "1.0", L: "1.15" }[fontScale] || "1.0";
    document.documentElement.style.setProperty("--font-scale", scale);
    document.documentElement.style.fontSize = `calc(16px * ${scale})`;
    document.body.style.fontSize = `calc(16px * ${scale})`;
  }, [fontScale]);

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
      // Eigener Proxy mit 60s Cache -- schützt vor Rate Limiting bei vielen Usern
      const r = await fetch(`${API_BASE}/api/prices`);
      const d = await r.json();
      if (d.usd) {
        setBtcUsd(d.usd);
        setUsdChf(d.usdChf);
        setEurUsd(d.eurUsd);
        setDayChangePct(d.usd_24h_change ?? 0);
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  // Holt taegl. historische BTC/USD Kurse (24h gecacht via Netlify Function)
  const fetchHistory = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/history`);
      const d = await r.json();
      if (!d.prices?.length) return;
      // Tägliche Preise für Portfolio-Chart
      setRawPriceData(d.prices);
      // Monatliche Durchschnitte für PriceChart (Analyse-Tab)
      const monthly = {};
      d.prices.forEach(([date, price]) => {
        const key = date.slice(0, 7);
        if (!monthly[key]) monthly[key] = [];
        monthly[key].push(price);
      });
      const data = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b))
        .map(([key, prices]) => [key, Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)]);
      if (data.length) setHistoricChartData(data);
    } catch {}
  }, []);

  useEffect(() => { fetchPrice(); fetchHistory(); }, [fetchPrice, fetchHistory]);
  useEffect(() => { const id = setInterval(fetchPrice, 60_000); return () => clearInterval(id); }, [fetchPrice]);

  const btcChf = btcUsd * usdChf;
  const buyTx  = transactions.filter(t => t.type === "buy");
  const sellTx = transactions.filter(t => t.type === "sell");
  const trfTx  = transactions.filter(t => t.type === "transfer_in" || t.type === "transfer_out");

  // Total BTC bestand
  const totalBtc = buyTx.reduce((s, t) => s + +t.btc, 0)
                 - sellTx.reduce((s, t) => s + +t.btc, 0)
                 + transactions.filter(t => t.type === "transfer_in").reduce((s, t)  => s + +t.btc, 0)
                 - transactions.filter(t => t.type === "transfer_out").reduce((s, t) => s + +t.btc, 0);

  // Investiertes Kapital (nur Käufe bestimmen den Einstandspreis)
  const buyBtc      = buyTx.reduce((s, t) => s + +t.btc, 0);
  const buyInvested = buyTx.reduce((s, t) => s + +t.chf + +(t.fee || 0), 0);

  // P&L: Einnahmen aus Verkäufen werden angerechnet
  const sellProceeds  = sellTx.reduce((s, t) => s + +t.chf - +(t.fee || 0), 0);
  const totalInvested = buyInvested - sellProceeds;

  const portfolioChf = totalBtc * btcChf;
  const pnlChf       = portfolioChf - totalInvested;
  const pnlPct       = buyInvested > 0 ? (pnlChf / buyInvested) * 100 : 0;

  // ── Einstandspreis-Methode ────────────────────────────────────────────────────
  const [costMethod, setCostMethodState] = useState(() => {
    try { return localStorage.getItem("costMethod") || "FIFO"; } catch { return "FIFO"; }
  });
  const setCostMethod = (m) => { setCostMethodState(m); try { localStorage.setItem("costMethod", m); } catch {} };

  // FIFO-Methode: Lots werden nach Kaufdatum verwaltet
  const calcFifo = (txList) => {
    const sorted = [...txList].sort((a, b) => a.date.localeCompare(b.date));
    const lots = []; // { btc, costPerBtc }
    for (const tx of sorted) {
      if (tx.type === "buy") {
        const costPerBtc = (+tx.chf + +(tx.fee || 0)) / +tx.btc;
        lots.push({ btc: +tx.btc, costPerBtc });
      } else if (tx.type === "sell") {
        let toSell = +tx.btc;
        while (toSell > 1e-10 && lots.length) {
          if (lots[0].btc <= toSell) { toSell -= lots[0].btc; lots.shift(); }
          else { lots[0].btc -= toSell; toSell = 0; }
        }
      } else if (tx.type === "transfer_in") {
        // Einbuchung ohne Kostenbasis: zum aktuellen FIFO-Durchschnitt einbuchen
        const curAvg = lots.length ? lots.reduce((s, l) => s + l.btc * l.costPerBtc, 0) / lots.reduce((s, l) => s + l.btc, 0) : 0;
        lots.push({ btc: +tx.btc, costPerBtc: curAvg });
      } else if (tx.type === "transfer_out") {
        let toRemove = +tx.btc;
        while (toRemove > 1e-10 && lots.length) {
          if (lots[0].btc <= toRemove) { toRemove -= lots[0].btc; lots.shift(); }
          else { lots[0].btc -= toRemove; toRemove = 0; }
        }
      }
    }
    const remBtc = lots.reduce((s, l) => s + l.btc, 0);
    const remCost = lots.reduce((s, l) => s + l.btc * l.costPerBtc, 0);
    return remBtc > 0 ? remCost / remBtc : 0;
  };

  // AVCO-Methode (Weighted Average Cost)
  const calcAvco = (txList) => {
    const sorted = [...txList].sort((a, b) => a.date.localeCompare(b.date));
    let poolBtc = 0;
    let avco = 0;
    for (const tx of sorted) {
      if (tx.type === "buy") {
        const kosten = +tx.chf + +(tx.fee || 0);
        avco = (poolBtc * avco + kosten) / (poolBtc + +tx.btc);
        poolBtc += +tx.btc;
      } else if (tx.type === "sell") {
        poolBtc -= +tx.btc;
      } else if (tx.type === "transfer_in") {
        poolBtc += +tx.btc;
      } else if (tx.type === "transfer_out") {
        poolBtc -= +tx.btc;
      }
    }
    return avco;
  };

  const avgChf = costMethod === "FIFO" ? calcFifo(transactions) : calcAvco(transactions);
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

  const handleImportTransactions = async (rows) => {
    let count = 0;
    for (const row of rows) {
      try {
        const created = await api.create(row, token);
        if (created?.id) {
          setTransactions(prev => [...prev, created]);
          count++;
        }
      } catch {}
    }
    return count;
  };

  // Berechnet echten Portfolio-Verlauf aus Transaktionen + historischen Kursen
  const buildPortfolioChart = useCallback((tab) => {
    if (!rawPriceData.length || !transactions.length) return [];
    const now = new Date();
    const msPerDay = 86400000;
    const cutoffDays = { "1D": 1, "7D": 7, "30D": 30, "ALL": 9999 }[tab] || 7;
    const cutoff = new Date(now - cutoffDays * msPerDay);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const prices = rawPriceData.filter(([d]) => d >= cutoffStr);
    if (!prices.length) return [];
    const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const dayLabels = ["So","Mo","Di","Mi","Do","Fr","Sa"];
    return prices.map(([date, usdPrice]) => {
      let btcAmt = 0;
      for (const tx of sortedTx) {
        if (tx.date > date) break;
        if (tx.type === "buy") btcAmt += +tx.btc;
        else if (tx.type === "sell") btcAmt -= +tx.btc;
        else if (tx.type === "transfer_in")  btcAmt += +(tx.btc || 0);
        else if (tx.type === "transfer_out") btcAmt -= +(tx.btc || 0);
      }
      const v = Math.round(btcAmt * usdPrice * usdChf);
      let t = date;
      if (tab === "7D") t = dayLabels[new Date(date).getDay()];
      else if (tab === "30D") t = date.slice(8, 10) + ".";
      else if (tab === "ALL") t = date.slice(0, 7);
      return { t, v };
    });
  }, [rawPriceData, transactions]);

  const exportCSV = () => {
    const sym = currency;
    const conv = (chfVal) => {
      if (currency === "CHF") return chfVal;
      if (currency === "USD") return chfVal / usdChf;
      return (chfVal / usdChf) * eurUsd;
    };
    const fmt2 = (v) => parseFloat(conv(v).toFixed(2));
    const btcPrice = currency === "CHF" ? btcChf : currency === "USD" ? btcUsd : btcUsd * eurUsd;
    const header = `${t("csv.datum")},${t("csv.typ")},${t("csv.btc")},${sym} ${t("csv.betrag")},${sym} ${t("csv.gebuehr")},${t("csv.portfoliowert")} (${sym}),${t("csv.notiz")}`;
    const rows = [...transactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(tx => [
        tx.date, tx.type, tx.btc,
        (tx.type === "transfer_in" || tx.type === "transfer_out") ? 0 : fmt2(tx.chf),
        fmt2(tx.fee || 0),
        parseFloat((tx.btc * btcPrice).toFixed(2)),
        `"${(tx.note || "").replace(/"/g, '""')}"`
      ].join(","));
    const csv = [header, ...rows].join("\n");
    const filename = `btc-transaktionen-${sym}-${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  const filteredTx = [...transactions].filter(t => txFilter === "all" || t.type === txFilter).sort((a, b) => b.date.localeCompare(a.date));

  // ── Claude AI Tools ───────────────────────────────────────────────────────────
  const fmt = (chfAmount) => {
    const val = toDisplay(chfAmount, currency, usdChf, eurUsd);
    return new Intl.NumberFormat(CURRENCIES[currency].locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const realizedPnl = (() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const lots = [];
    let realized = 0;
    for (const tx of sorted) {
      if (tx.type === "buy") {
        lots.push({ btc: +tx.btc, costPerBtc: (+tx.chf + +(tx.fee || 0)) / +tx.btc });
      } else if (tx.type === "sell") {
        let toSell = +tx.btc;
        const proceeds = +tx.chf - +(tx.fee || 0);
        const avgCost = lots.length ? lots.reduce((s, l) => s + l.btc * l.costPerBtc, 0) / lots.reduce((s, l) => s + l.btc, 0) : 0;
        realized += proceeds - toSell * avgCost;
        while (toSell > 1e-10 && lots.length) {
          if (lots[0].btc <= toSell) { toSell -= lots[0].btc; lots.shift(); }
          else { lots[0].btc -= toSell; toSell = 0; }
        }
      }
    }
    return realized;
  })();

  const callClaudeAI = async (tool) => {
    setAiLoading(true);
    setAiActiveTool(tool);
    setAiResult(null);
    const btcPrice = currency === "CHF" ? btcChf : currency === "USD" ? btcUsd : btcUsd * eurUsd;
    const firstTx = transactions.length > 0
      ? [...transactions].sort((a, b) => a.date.localeCompare(b.date))[0].date
      : "n/a";
    const portfolioPayload = {
      totalBtc: totalBtc.toFixed(8),
      invested: fmt(totalInvested),
      value: fmt(portfolioChf),
      pnl: fmt(pnlChf),
      pnlPct: pnlPct.toFixed(1),
      breakEven: fmt(avgChf),
      btcPrice: fmt(btcChf),
      change24h: dayChangePct?.toFixed(2) ?? "n/a",
      method: costMethod,
      txCount: transactions.length,
      firstTx,
      realizedPnl: fmt(realizedPnl),
      currency,
    };
    try {
      const res = await fetch(`${API_BASE}/api/claude`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, portfolio: portfolioPayload, lang: language }),
      });
      const data = await res.json();
      setAiResult(data.result || "error");
    } catch {
      setAiResult("error");
    }
    setAiLoading(false);
  };

  const renderMarkdown = (text) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} style={{ margin: "4px 0" }}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </p>
      );
    });
  const scrollStyle = { overflowY: "auto", maxHeight: "calc(100vh - 80px - env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch", paddingBottom: 100 };

  // Splash Screen — während Auth-Check und initialem Daten-Laden
  if (authLoading || (dbLoading && transactions.length === 0 && session)) return (
    <>
      <style>{`
        @keyframes btc-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(0.95); } }
        @keyframes btc-spin { to { transform:rotate(360deg); } }
        @keyframes btc-fade { from { opacity:0; } to { opacity:1; } }
      `}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, animation: "btc-fade 0.3s ease" }}>
        <div style={{ width: 80, height: 80, background: "#f7931a", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(247,147,26,0.35)", animation: "btc-pulse 1.8s ease-in-out infinite" }}>
          <svg width="44" height="44" viewBox="0 0 44 44"><line x1="8" y1="36" x2="8" y2="8" stroke="#000" strokeWidth="3" strokeLinecap="round"/><line x1="8" y1="36" x2="36" y2="36" stroke="#000" strokeWidth="3" strokeLinecap="round"/><polyline points="14,26 20,18 26,22 36,10" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="36" cy="10" r="3" fill="#000"/></svg>
        </div>
        <div style={{ color: T.text, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>Trackoshi</div>
        <div style={{ width: 32, height: 32, border: `3px solid ${T.border}`, borderTopColor: "#f7931a", borderRadius: "50%", animation: "btc-spin 0.8s linear infinite" }} />
      </div>
    </>
  );

  // Nicht eingeloggt → Login Screen
  if (!session) return (
    <>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; } input { font-size: 16px !important; }`}</style>
      <AuthScreen T={T} language={language} />
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

      {/* Banner temporär ausgeblendet für Screenshots
      {window.location.hostname.includes("dev--") && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, background: "linear-gradient(90deg, #7c3aed, #a855f7)", color: "#fff", textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: 2, padding: "6px 0", fontFamily: "inherit" }}>
          🧪 TESTUMGEBUNG — dev
        </div>
      )}
      */}
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, paddingTop: "env(safe-area-inset-top)" }}>
        <div style={{ zoom: { S: 0.9, M: 1.0, L: 1.15 }[fontScale] || 1.0 }}>
        <Header lastUpdated={lastUpdated} loading={loading} T={T} onSettingsOpen={() => setShowSettings(true)} language={language} />

        {dbLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div style={{ width: 24, height: 24, border: `3px solid ${T.border}`, borderTopColor: "#f7931a", borderRadius: "50%", animation: "btc-spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <>
            {view === "dashboard" && (
              <div style={scrollStyle}>
                <MarketCard btcChf={btcChf} btcUsd={btcUsd} dayChangePct={dayChangePct} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} secondaryCurrency={secondaryCurrency} />
                <PortfolioCard portfolioChf={portfolioChf} pnlChf={pnlChf} pnlPct={pnlPct} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} transactions={transactions} btcChfLive={btcChf} rawPriceData={rawPriceData} language={language} />
                <PositionCard totalBtc={totalBtc} portfolioChf={portfolioChf} totalInvested={totalInvested} avgChf={avgChf} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />
              </div>
            )}
            {view === "analyse" && (
              <div style={{ ...scrollStyle, padding: "0 12px" }}>
                <PriceChart avgChf={avgChf} currentChf={btcChf} transactions={transactions} chartData={historicChartData} T={T} language={language} currency={currency} usdChf={usdChf} eurUsd={eurUsd} />
                <BreakEvenCard avgChf={avgChf} currentChf={btcChf} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />
                <RealizedPnlCard transactions={transactions} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} avgChf={avgChf} language={language} />
                <DcaEfficiencyChart transactions={transactions} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />

              </div>
            )}
            {showDcaModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowDcaModal(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom)" }}>
                  <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "12px auto 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
                    <div style={{ color: T.text, fontSize: 17, fontWeight: 600 }}>{t("dca.title")}</div>
                    <button onClick={() => setShowDcaModal(false)} style={{ background: T.input, border: "none", color: T.textMuted, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>{t("dca.close")}</button>
                  </div>
                  <div style={{ padding: "12px 12px 24px" }}>
                    <DcaCalculator totalBtc={totalBtc} totalInvested={totalInvested} avgChf={avgChf} currentChf={btcChf} usdChf={usdChf} T={T} currency={currency} eurUsd={eurUsd} language={language} />
                  </div>
                </div>
              </div>
            )}
            {showSzenarioModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowSzenarioModal(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderTop: `1px solid ${T.border}`, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom)" }}>
                  <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "12px auto 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
                    <div style={{ color: T.text, fontSize: 17, fontWeight: 600 }}>{language === "en" ? "Scenario Calculator" : "Szenario-Rechner"}</div>
                    <button onClick={() => setShowSzenarioModal(false)} style={{ background: T.input, border: "none", color: T.textMuted, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>{t("dca.close")}</button>
                  </div>
                  <div style={{ padding: "12px 12px 24px" }}>
                    <SzenarioCalculator totalBtc={totalBtc} totalInvested={totalInvested} avgChf={avgChf} btcChf={btcChf} usdChf={usdChf} eurUsd={eurUsd} T={T} currency={currency} secondaryCurrency={secondaryCurrency} language={language} />
                  </div>
                </div>
              </div>
            )}
            {view === "verlauf" && (
              <div style={{ ...scrollStyle, padding: "0 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 16, paddingTop: 4 }}>
                  {[["all", t("verlauf.alle")], ...Object.entries(getTypeMeta(t)).map(([k, v]) => [k, v.label])].map(([id, label]) => (
                    <button key={id} onClick={() => setTxFilter(id)} style={{ padding: "5px 11px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "inherit", background: txFilter === id ? T.text : T.surface, color: txFilter === id ? T.bg : T.textMuted, border: `1px solid ${txFilter === id ? T.text : T.border}`, fontWeight: txFilter === id ? 500 : 400 }}>{label}</button>
                  ))}
                  <button onClick={exportCSV} title={t("verlauf.csvExportTitle")} style={{ background: "transparent", border: "1.5px solid #f7931a", color: "#f7931a", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "auto" }}>↓</button>
                </div>
                {filteredTx.length === 0 && <div style={{ color: T.textFaint, textAlign: "center", padding: "40px 0", fontSize: 15 }}>{t("verlauf.keineTx")}</div>}
                {filteredTx.map(tx => <TxRow key={tx.id} tx={tx} onDelete={handleDelete} onEdit={tx => { setEditTx(tx); setShowModal(true); }} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />)}
              </div>
            )}
            {view === "tools" && (
              <div style={{ ...scrollStyle, padding: "0 16px" }}>
                <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginTop: 24, marginBottom: 12 }}>{t("tools.finanzTools")}</div>
                {/* Kauf-Simulator */}
                <button onClick={() => setShowDcaModal(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", marginBottom: 12, textAlign: "left" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="3" y="3" width="22" height="22" rx="4" fill="rgba(0,0,0,0.25)"/>
                      <rect x="5" y="5" width="18" height="6" rx="2" fill="white" opacity="0.9"/>
                      <rect x="5" y="14" width="5" height="4" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="11.5" y="14" width="5" height="4" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="18" y="14" width="5" height="4" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="5" y="20" width="5" height="4" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="11.5" y="20" width="5" height="4" rx="1.5" fill="white" opacity="0.9"/>
                      <rect x="18" y="20" width="5" height="8" rx="1.5" fill="rgba(0,0,0,0.3)"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{t("tools.kaufSimulator")}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{t("tools.kaufSimulatorHint")}</div>
                  </div>
                  <span style={{ color: T.textFaint, fontSize: 20 }}>›</span>
                </button>

                {/* Szenario-Rechner */}
                <button onClick={() => setShowSzenarioModal(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, cursor: "pointer", fontFamily: "inherit", marginBottom: 12, textAlign: "left" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>🎯</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{language === "en" ? "Scenario Calculator" : "Szenario-Rechner"}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{language === "en" ? "Portfolio value at target BTC price" : "Portfoliowert bei Ziel-BTC-Kurs berechnen"}</div>
                  </div>
                  <span style={{ color: T.textFaint, fontSize: 20 }}>›</span>
                </button>

                {/* KI-Tools */}
                <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginTop: 24, marginBottom: 12 }}>{t("tools.aiTools")}</div>

                {/* Button: Portfolio analysieren */}
                <button
                  onClick={() => callClaudeAI("portfolio")}
                  disabled={aiLoading || totalBtc === 0}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, cursor: aiLoading || totalBtc === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: 12, textAlign: "left", opacity: aiLoading || totalBtc === 0 ? 0.5 : 1 }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>📊</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{t("tools.aiPortfolioBtn")}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{t("tools.aiPortfolioBtnHint")}</div>
                  </div>
                  <span style={{ color: T.textFaint, fontSize: 20 }}>›</span>
                </button>

                {/* Button: Markt-Kommentar */}
                <button
                  onClick={() => callClaudeAI("market")}
                  disabled={aiLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "inherit", marginBottom: 12, textAlign: "left", opacity: aiLoading ? 0.5 : 1 }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>🌐</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{t("tools.aiMarketBtn")}</div>
                    <div style={{ color: T.textMuted, fontSize: 13, marginTop: 2 }}>{t("tools.aiMarketBtnHint")}</div>
                  </div>
                  <span style={{ color: T.textFaint, fontSize: 20 }}>›</span>
                </button>

                {/* Loading */}
                {aiLoading && (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20, textAlign: "center", color: T.textMuted, fontSize: 15 }}>
                    <div style={{ width: 24, height: 24, border: `3px solid ${T.border}`, borderTopColor: "#f7931a", borderRadius: "50%", animation: "btc-spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                    {t("tools.aiLoading")}
                  </div>
                )}

                {/* Fehler */}
                {!aiLoading && aiResult === "error" && (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
                    <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 10, padding: 14, color: "#ef4444", fontSize: 14 }}>
                      {t("tools.aiError")}
                    </div>
                  </div>
                )}

                {/* Resultat */}
                {!aiLoading && aiResult && aiResult !== "error" && (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
                    {/* Header mit X */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.06em" }}>
                        {aiActiveTool === "portfolio" ? t("tools.aiPortfolioBtn") : t("tools.aiMarketBtn")}
                      </span>
                      <button
                        onClick={() => setAiResult(null)}
                        style={{ background: T.input, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}
                      >✕</button>
                    </div>
                    <div style={{ background: T.input, borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.65, color: T.text }}>
                      {renderMarkdown(aiResult)}
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", color: T.textFaint, fontSize: 11 }}>
                        <span>{t("tools.aiPoweredBy")}</span>
                        <span>{t("tools.aiDisclaimer")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div> {/* zoom div */}
      </div> {/* maxWidth div */}

      {/* Modals ausserhalb zoom — werden nicht mitskaliert */}
      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowSettings(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.bg, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "92vh", overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div style={{ width: 36, height: 4, background: T.border, borderRadius: 2, margin: "12px auto 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
              <div style={{ color: T.text, fontSize: 19, fontWeight: 600 }}>{t("settings.title")}</div>
              <button onClick={() => setShowSettings(false)} style={{ background: T.input, border: `1px solid ${T.inputBorder}`, color: T.textMuted, borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>{t("settings.close")}</button>
            </div>
            <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} T={T} transactions={transactions} userEmail={session?.user?.email} onLogout={() => { setShowSettings(false); handleLogout(); }} currency={currency} setCurrency={setCurrency} usdChf={usdChf} eurUsd={eurUsd} btcChf={btcChf} btcUsd={btcUsd} onResetOnboarding={() => { setShowSettings(false); resetOnboarding(); }} onImport={handleImportTransactions} costMethod={costMethod} setCostMethod={setCostMethod} language={language} setLanguage={setLanguage} secondaryCurrency={secondaryCurrency} setSecondaryCurrency={setSecondaryCurrency} fontScale={fontScale} setFontScale={setFontScale} />
          </div>
        </div>
      )}
      {showOnboarding && <OnboardingScreen onFinish={finishOnboarding} T={T} language={language} />}
      <BottomNav view={view} setView={setView} onAdd={() => { setEditTx(null); setShowModal(true); }} T={T} language={language} />
      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditTx(null); }} onSave={handleSave} editTx={editTx} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />}
    </>
  );
}
