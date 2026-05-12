import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Area, AreaChart, Line, LineChart, ComposedChart, ResponsiveContainer, YAxis, XAxis, Tooltip, Legend, ReferenceLine, CartesianGrid } from "recharts";
const TRACKOSHI_ICON = "data:image/png;base64,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";
import { createClient } from "@supabase/supabase-js";
import { translations, tr } from "./i18n";

// ── API Base URL (absolut für Capacitor Native App) ───────────────────────────
// capacitor://localhost = native App (iOS/Android) → absolute URL nötig
// https: = Browser/PWA → relative URLs, kein CORS
const API_BASE = (typeof window !== "undefined" && window.location.protocol.startsWith("capacitor"))
  ? "https://trackoshi.netlify.app"
  : (import.meta.env.VITE_API_BASE ?? "");

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
  textMuted: "#2c2c2e",
  textFaint: "#48484a",
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
          <img src="/icons/icon-192.png" alt="Trackoshi BTC" style={{ width: 64, height: 64, borderRadius: 18, boxShadow: "0 8px 24px rgba(247,147,26,0.35)", marginBottom: 16 }} />
          <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Trackoshi BTC</div>
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
          <img src="/icons/icon-192.png" alt="Trackoshi BTC" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, boxShadow: "0 4px 12px rgba(247,147,26,0.3)" }} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>{t("header.portfolio")}</div>
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 1 }}>
              {loading ? t("header.aktualisiere") : `${t("header.aktualisiert")} ${t2}`}
            </div>
          </div>
        </div>
        <button onClick={onSettingsOpen} style={{ width: 42, height: 42, background: T.input, border: `1px solid ${T.inputBorder}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Portfolio Card ─────────────────────────────────────────────────────────────
function PortfolioCard({ portfolioChf, pnlChf, pnlPct, totalInvested = 0, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, transactions = [], btcChfLive = 0, rawPriceData = [], language, darkMode = false }) {
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
        <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: T.textMuted, marginRight: 3 }}>{sym}</span>
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
      {(() => {
        // Berechne dynamischen Gradient: grün wo Portfolio > Investiert, rot wo darunter
        const data = chartData || [];
        const gradStops = [];
        if (data.length > 1) {
          for (let i = 0; i < data.length; i++) {
            const pct = i / (data.length - 1);
            const val = data[i].portfolio ?? data[i].today ?? 0;
            const inv = data[i].invested ?? 0;
            const isAbove = val >= inv;
            if (i === 0 || isAbove !== ((data[i-1].portfolio ?? data[i-1].today ?? 0) >= (data[i-1].invested ?? 0))) {
              gradStops.push({ offset: `${(pct * 100).toFixed(1)}%`, above: isAbove });
            }
          }
        }
        return null;
      })()}
      <div style={{ height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData || []} margin={{ top: 5, right: 16, left: 0, bottom: 20 }}>
            <defs>
              {(() => {
                const data = chartData || [];
                if (data.length < 2) return (
                  <linearGradient id="gradPortfolio" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={isNeg ? "#ef4444" : "#22c55e"} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isNeg ? "#ef4444" : "#22c55e"} stopOpacity={0.1} />
                  </linearGradient>
                );
                // Berechne Kreuzungspunkte für dynamischen Gradient
                const stops = [];
                for (let i = 0; i < data.length; i++) {
                  const pct = (i / (data.length - 1) * 100).toFixed(1) + "%";
                  const val = data[i].portfolio ?? data[i].today ?? 0;
                  const inv = data[i].invested ?? 0;
                  const above = val >= inv;
                  if (i === 0 || above !== ((data[i-1].portfolio ?? data[i-1].today ?? 0) >= (data[i-1].invested ?? 0))) {
                    if (i > 0) stops.push({ offset: pct, color: above ? "#22c55e" : "#ef4444" });
                    stops.push({ offset: pct, color: above ? "#22c55e" : "#ef4444" });
                  }
                }
                if (stops.length === 0) {
                  const above = (data[data.length-1].portfolio ?? 0) >= (data[data.length-1].invested ?? 0);
                  stops.push({ offset: "0%", color: above ? "#22c55e" : "#ef4444" });
                  stops.push({ offset: "100%", color: above ? "#22c55e" : "#ef4444" });
                } else {
                  stops[stops.length-1].offset = "100%";
                }
                return (
                  <linearGradient id="gradPortfolio" x1="0" y1="0" x2="1" y2="0">
                    {stops.map((s, i) => (
                      <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={0.25} />
                    ))}
                  </linearGradient>
                );
              })()}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth={0.8} vertical={false} />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: T.textFaint }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: "rgba(28,28,30,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 10, padding: "8px 12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginBottom: 5 }}>{label}</div>
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color || p.stroke, flexShrink: 0 }} />
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{p.name === "invested" ? t("portfolio.investiert") : p.name === "portfolio" ? t("portfolio.portfoliowert") : t("portfolio.heute")}</span>
                        <span style={{ color: "#fff", fontSize: 11, fontWeight: 600, marginLeft: "auto", paddingLeft: 8 }}>{sym} {fmtY(p.value)}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="stepAfter" dataKey="invested" stroke="#f7931a" strokeWidth={2.5} strokeDasharray="4 3" fill="none" dot={false} activeDot={{ r: 3 }} />
            {chartData?.[0]?.portfolio !== undefined ? (
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke={isNeg ? "#ef4444" : "#22c55e"}
                strokeWidth={2}
                fill="url(#gradPortfolio)"
                dot={(props) => {
                  const { cx, cy, index } = props;
                  if (index !== (chartData?.length ?? 0) - 1) return null;
                  return (
                    <g key="today-dot">
                      <circle cx={cx} cy={cy} r={8} fill={isNeg ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"} />
                      <circle cx={cx} cy={cy} r={4.5} fill={isNeg ? "#ef4444" : "#22c55e"} />
                      <circle cx={cx} cy={cy} r={2} fill={T.surface} />
                    </g>
                  );
                }}
                activeDot={{ r: 4, fill: isNeg ? "#ef4444" : "#22c55e" }}
              />
            ) : (
              <Area type="monotone" dataKey="today" stroke={isNeg ? "#ef4444" : "#22c55e"} strokeWidth={0} fill="none"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (!payload.today) return null;
                  return (
                    <g key="today-dot">
                      <circle cx={cx} cy={cy} r={8} fill={isNeg ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)"} />
                      <circle cx={cx} cy={cy} r={4.5} fill={isNeg ? "#ef4444" : "#22c55e"} stroke={T.surface} strokeWidth={2} />
                      <circle cx={cx} cy={cy} r={2} fill={T.surface} />
                    </g>
                  );
                }}
                activeDot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legende */}
      <div style={{ display: "flex", gap: 12, padding: "0 16px 12px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 14, height: 2, background: "#f7931a", borderRadius: 1 }} />
          <span style={{ fontSize: 10, color: T.textFaint }}>{t("portfolio.investiert")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {chartData?.[0]?.portfolio !== undefined ? (
            <><div style={{ width: 14, height: 2, background: isNeg ? "#ef4444" : "#22c55e", borderRadius: 1 }} /><span style={{ fontSize: 10, color: T.textFaint }}>{t("portfolio.portfoliowert")}</span></>
          ) : (
            <><div style={{ width: 6, height: 6, borderRadius: "50%", background: isNeg ? "#ef4444" : "#22c55e" }} /><span style={{ fontSize: 10, color: T.textFaint }}>{t("portfolio.heute")}</span></>
          )}
        </div>
      </div>

      {/* Investiert + Gewinn Cards */}
      {totalInvested > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px 16px" }}>
          <div style={{ background: T.input, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ color: T.textFaint, fontSize: 10, fontWeight: 600, marginBottom: 3 }}>{t("portfolio.investiert")}</div>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 500 }}>{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(totalInvested, currency, usdChf, eurUsd))}</div>
            <div style={{ color: T.textFaint, fontSize: 11, marginTop: 1 }}>{sym}</div>
          </div>
          <div style={{ background: isNeg ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${isNeg ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 10, fontWeight: 600, marginBottom: 3, opacity: 0.85 }}>{isNeg ? t("portfolio.verlust") : t("portfolio.gewinn")}</div>
            <div style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 16, fontWeight: 500 }}>{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(Math.abs(pnlChf), currency, usdChf, eurUsd))}</div>
            <div style={{ color: isNeg ? "#ef4444" : "#22c55e", fontSize: 11, marginTop: 1, opacity: 0.8 }}>{sym} · {isNeg ? "" : "+"}{pnlPct.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Position Card ─────────────────────────────────────────────────────────────
function PositionCard({ totalBtc, portfolioChf, totalInvested, avgChf, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language }) {
  const t = tr(translations, language);
  const sym = CURRENCIES[currency].symbol;
  // 4 Nachkommastellen, ausser Bestand < 0.001 → dann 6
  const btcDecimals = totalBtc < 0.001 ? 6 : 4;
  const btcDisplay = totalBtc.toLocaleString("de-CH", { minimumFractionDigits: btcDecimals, maximumFractionDigits: btcDecimals });
  const fmtVal = (v) => new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(v, currency, usdChf, eurUsd));

  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "18px 20px" }}>
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 14 }}>{t("position.title")}</div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{t("position.bestand")}</div>
          <div style={{ color: T.text, fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {btcDisplay} <span style={{ fontSize: 14, fontWeight: 400, color: T.textMuted }}>BTC</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{t("position.einstandspreis")}</div>
          <div style={{ color: T.text, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>{sym} {fmtVal(avgChf)}</div>
          <div style={{ color: T.textFaint, fontSize: 11, marginTop: 3 }}>{t("position.proBtc")}</div>
        </div>
      </div>
    </div>
  );
}

// ── Market Card mit Live Chart ────────────────────────────────────────────────
// ── Fear & Greed Card ─────────────────────────────────────────────────────────
function FearGreedCard({ T, language }) {
  const t = tr(translations, language);
  const [fearGreed, setFearGreed] = useState(null);
  useEffect(() => {
    fetch("https://api.alternative.me/fng/?limit=8")
      .then(r => r.json())
      .then(d => { if (d?.data?.length) setFearGreed(d.data); })
      .catch(() => {});
  }, []);

  const fgCurrent = fearGreed?.[0];
  const fgValue = fgCurrent ? parseInt(fgCurrent.value) : null;
  const fgLabel = fgCurrent ? ({
    "Extreme Fear": t("market.fearGreedExtremeAngst"),
    "Fear": t("market.fearGreedAngst"),
    "Neutral": t("market.fearGreedNeutral"),
    "Greed": t("market.fearGreedGier"),
    "Extreme Greed": t("market.fearGreedExtremeGier"),
  }[fgCurrent.value_classification] || fgCurrent.value_classification) : null;
  const fgPrev = fearGreed?.[7] ? parseInt(fearGreed[7].value) : null;
  const fgColor = fgValue === null ? T.textFaint : fgValue <= 25 ? "#ef4444" : fgValue <= 45 ? "#f97316" : fgValue <= 55 ? "#eab308" : fgValue <= 75 ? "#84cc16" : "#22c55e";
  const fgAngle = fgValue !== null ? 180 - (fgValue / 100) * 180 : 180;
  const cx = 80, cy = 75, r = 60;
  const fgNeedleX = cx + (r - 10) * Math.cos((fgAngle * Math.PI) / 180);
  const fgNeedleY = cy - (r - 10) * Math.sin((fgAngle * Math.PI) / 180);

  if (fgValue === null) return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
      <div style={{ color: T.textFaint, fontSize: 13 }}>{t("market.lade")}</div>
    </div>
  );

  return (
    <div style={{ margin: "0 12px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 20px 16px" }}>
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 14 }}>{t("market.fearGreedLabel")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Grosser Gauge */}
        <svg width="160" height="90" viewBox="0 0 160 90" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="fgGradLarge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444"/>
              <stop offset="25%" stopColor="#f97316"/>
              <stop offset="50%" stopColor="#eab308"/>
              <stop offset="75%" stopColor="#84cc16"/>
              <stop offset="100%" stopColor="#22c55e"/>
            </linearGradient>
          </defs>
          {/* Hintergrund grau */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={T.border} strokeWidth="10" strokeLinecap="round"/>
          {/* Voller Gradient-Bogen */}
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#fgGradLarge)" strokeWidth="10" strokeLinecap="round"/>
          {/* Labels */}
          <text x={cx - r - 4} y={cy + 16} fontSize="9" fill={T.textFaint} textAnchor="middle">0</text>
          <text x={cx + r + 4} y={cy + 16} fontSize="9" fill={T.textFaint} textAnchor="middle">100</text>
          {/* Zeiger */}
          <line x1={cx} y1={cy} x2={fgNeedleX} y2={fgNeedleY} stroke={fgColor} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r="4" fill={fgColor}/>
          <circle cx={cx} cy={cy} r="2" fill={T.surface}/>
        </svg>
        {/* Werte */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: fgColor, lineHeight: 1 }}>{fgValue}</span>
            <span style={{ fontSize: 14, color: fgColor, fontWeight: 600 }}>{fgLabel}</span>
          </div>
          {fgPrev !== null && (
            <div style={{ display: "flex", align: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: T.textFaint }}>7{t("market.fearGreedDaysAgo")}: </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>{fgPrev}</span>
              <span style={{ fontSize: 12, color: fgValue > fgPrev ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                {fgValue > fgPrev ? " ▲" : " ▼"}{Math.abs(fgValue - fgPrev)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Market Card ───────────────────────────────────────────────────────────────
function MarketCard({ btcChf, btcUsd, dayChangePct, T, currency = "CHF", usdChf = 0.9, eurUsd = 0.92, language, secondaryCurrency = "none", showChart = true }) {
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
            <span style={{ color: T.textSub, fontSize: 14 }}>Bitcoin (BTC)</span>
          </div>
          {/* Badge: Tab-%-Änderung statt fix 24h */}
          <div style={{ background: isPos ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3 }}>
            <span>{isPos ? "▲" : "▼"}</span>{Math.abs(tabChangePct).toFixed(2)}% <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 2 }}>{activeTab}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}><span style={{ fontSize: 18, fontWeight: 500, color: T.textMuted }}>{sym}</span> {fmtPrice(btcDisplay, currency)}</div>
          {showSecondary && btcSecondary > 0 && (
            <div style={{ fontSize: 18, fontWeight: 500, color: T.textMuted, letterSpacing: "-0.01em" }}>{symSecondary} {fmtPrice(btcSecondary, secondaryCurrency)}</div>
          )}
          {!showSecondary && currency !== "USD" && <div style={{ color: T.textMuted, fontSize: 16, fontWeight: 500 }}>${fmtUsd(btcUsd)}</div>}
        </div>

        <div style={{ marginBottom: 14 }} />
        {showChart && (
        <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${T.divider}`, paddingBottom: 12 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); try { localStorage.setItem("marketTab", tab); } catch {} }}
              style={{ flex: 1, padding: "5px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", background: activeTab === tab ? T.input : "transparent", color: activeTab === tab ? T.text : T.textFaint }}>{tab}</button>
          ))}
        </div>
        )}
      </div>

      {showChart && <div style={{ height: 180, position: "relative" }}>
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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{ background: "rgba(28,28,30,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 10, padding: "8px 12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginBottom: 4 }}>{label}</div>
                        <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{fmtTooltip(payload[0].value)}</div>
                      </div>
                    );
                  }}
                />
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
      </div>}
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
        <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 2 }}>{t("priceChart.title")}</div>
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
  const color = isAbove ? "#22c55e" : "#ef4444";

  // Needle: 0% = ganz links (180°), 100% = ganz rechts (0°)
  // ratio: -1 = max verlust, +1 = max gewinn, 0 = break-even
  const ratio = Math.max(-1, Math.min(1, diff / (avgChf * 0.8)));
  const fgAngle = 180 - ((ratio + 1) / 2) * 180;
  const cx = 65, cy = 60, r = 50;
  const nx = cx + (r - 8) * Math.cos((fgAngle * Math.PI) / 180);
  const ny = cy - (r - 8) * Math.sin((fgAngle * Math.PI) / 180);

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 16 }}>{t("breakEven.title")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Gauge */}
        <svg width="130" height="72" viewBox="0 0 130 72" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="beGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444"/>
              <stop offset="50%" stopColor="#eab308"/>
              <stop offset="100%" stopColor="#22c55e"/>
            </linearGradient>
          </defs>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={T.border} strokeWidth="8" strokeLinecap="round"/>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#beGrad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={T.text} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <circle cx={cx} cy={cy} r="4" fill={color}/>
          <circle cx={cx} cy={cy} r="2" fill={T.surface}/>
          <text x={cx - r - 2} y={cy + 14} fill={T.textFaint} fontSize="8" textAnchor="middle">-80%</text>
          <text x={cx + r + 2} y={cy + 14} fill={T.textFaint} fontSize="8" textAnchor="middle">+80%</text>
        </svg>
        {/* Werte */}
        <div style={{ flex: 1 }}>
          <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "Current vs. cost basis" : "Aktuell vs. Einstand"}</div>
          <div style={{ color, fontSize: 24, fontWeight: 600, lineHeight: 1, marginBottom: 2 }}>
            {isAbove ? "+" : ""}{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(diff, currency, usdChf, eurUsd))}
            <span style={{ fontSize: 14, marginLeft: 4, fontWeight: 400, opacity: 0.8 }}>{sym}</span>
          </div>
          <div style={{ color, fontSize: 13, opacity: 0.8, marginBottom: 10 }}>{isAbove ? "+" : ""}{diffPct.toFixed(1)}%</div>
          <div style={{ background: isAbove ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${isAbove ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "8px 12px" }}>
            {isAbove ? (
              <>
                <div style={{ color: T.textFaint, fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{language === "en" ? "In profit since" : "Im Gewinn seit"}</div>
                <div style={{ color, fontSize: 15, fontWeight: 500 }}>{fmt(avgChf)}</div>
              </>
            ) : (
              <>
                <div style={{ color: T.textFaint, fontSize: 10, fontWeight: 600, marginBottom: 2 }}>{language === "en" ? "BTC needs to rise" : "BTC muss steigen um"}</div>
                <div style={{ color, fontSize: 15, fontWeight: 500 }}>+{toBreakEvenPct.toFixed(1)}%</div>
                <div style={{ color: T.textFaint, fontSize: 11, marginTop: 2 }}>{language === "en" ? "to" : "auf"} {fmt(avgChf)}</div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ color: T.textFaint, fontSize: 11 }}>{language === "en" ? "Cost basis" : "Einstand"} {fmt(avgChf)}</span>
          <span style={{ color: T.textFaint, fontSize: 11 }}>{language === "en" ? "Current" : "Aktuell"} {fmt(currentChf)}</span>
        </div>
        <div style={{ height: 4, background: T.input, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, Math.max(2, (currentChf / (avgChf * 1.5)) * 100))}%`, background: `linear-gradient(to right, #ef4444, #eab308, ${isAbove ? "#22c55e" : "#ef4444"})`, borderRadius: 2 }} />
        </div>
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
  const [showHilfe, setShowHilfe] = useState(false);

  // DCA-Durchschnittskurs: Mittelwert zwischen heute und Zielkurs
  const btcChfHeute = btcChf;
  const dcaKursChf = zielChf > 0 ? (btcChfHeute + zielChf) / 2 : 0;
  const zusätzlicheBtc = dcaKursChf > 0 && sparTotal > 0 ? sparTotal / dcaKursChf : 0;

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em" }}>
          {language === "en" ? "Scenario Calculator" : "Szenario-Rechner"}
        </div>
        {sparplan !== "kein" && zielChf > 0 && (
          <button onClick={() => setShowHilfe(true)} style={{ background: T.input, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 20, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            {t("tools.szenarioHilfe")}
          </button>
        )}
      </div>

      {showHilfe && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowHilfe(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380 }}>
            <div style={{ color: T.text, fontSize: 17, fontWeight: 600, marginBottom: 14 }}>{t("tools.szenarioHilfeTitle")}</div>
            <div style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{t("tools.szenarioHilfeText")}</div>
            <div style={{ background: T.input, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4 }}>{language === "en" ? "Formula" : "Formel"}</div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 600, fontFamily: "monospace" }}>{t("tools.szenarioHilfeFormel")}</div>
              {zielChf > 0 && btcChf > 0 && (
                <div style={{ color: T.textFaint, fontSize: 12, marginTop: 8 }}>
                  = ({new Intl.NumberFormat("de-CH", {maximumFractionDigits: 0}).format(toDisplay(btcChf, currency, usdChf, eurUsd))} + {new Intl.NumberFormat("de-CH", {maximumFractionDigits: 0}).format(toDisplay(zielChf, currency, usdChf, eurUsd))}) ÷ 2
                  {" = "}<strong>{new Intl.NumberFormat("de-CH", {maximumFractionDigits: 0}).format(toDisplay(dcaKursChf, currency, usdChf, eurUsd))} {sym}</strong>
                </div>
              )}
            </div>
            <button onClick={() => setShowHilfe(false)} style={{ width: "100%", padding: "14px 0", background: "#f7931a", border: "none", color: "#000", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>{t("tools.szenarioHilfeClose")}</button>
          </div>
        </div>
      )}

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
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{language === "en" ? "BTC holdings" : "BTC Bestand"}</div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{gesamtBtc.toFixed(5)} BTC</div>
              {zusätzlicheBtc > 0 && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>+{zusätzlicheBtc.toFixed(5)} Sparplan</div>}
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{language === "en" ? "Portfolio value" : "Portfoliowert"}</div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>{fmt(portfolioWert)}</div>
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{language === "en" ? "Total invested" : "Investiert total"}</div>
              <div style={{ color: T.text, fontSize: 15 }}>{fmt(investiertGesamt)}</div>
              {sparTotal > 0 && <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>+{fmt(sparTotal)} Sparplan</div>}
            </div>
            <div>
              <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{language === "en" ? "Gain / Loss" : "Gewinn / Verlust"}</div>
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
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 16 }}>{t("dca.chartTitle")}</div>
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
        <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 12 }}>{t("realizedPnl.title")}</div>
        <div style={{ color: T.textFaint, fontSize: 14, textAlign: "center", padding: "16px 0" }}>{t("realizedPnl.keinVerkauf")}</div>
      </div>
    );
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "20px 16px", marginBottom: 12 }}>
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 16 }}>{t("realizedPnl.title")}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: isPos ? "#22c55e" : "#ef4444", letterSpacing: "-0.02em" }}>
            <span style={{ fontSize: 18, fontWeight: 500, marginRight: 3, opacity: 0.8 }}>{sym}</span>{new Intl.NumberFormat(CURRENCIES[currency].locale, {minimumFractionDigits:0,maximumFractionDigits:0}).format(toDisplay(realizedPnl, currency, usdChf, eurUsd))}
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
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 4 }}>{language === "en" ? "Purchase price efficiency" : "Kaufpreis-Effizienz"}</div>
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
function OnboardingScreen({ onFinish, T, language, onShowDemo }) {
  const t = tr(translations, language);
  const [slide, setSlide] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const privacyContent = t("privacy.sections");
  const isLast = slide === 4;

  const slidesData = t("onboarding.slides");
  const slides = [
    { title: slidesData[0].title, text: slidesData[0].text, svg: (
        <svg viewBox="0 0 280 200" width="260" style={{ display: "block" }}>
          <circle cx="140" cy="90" r="75" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" opacity="0.6"/>
          <circle cx="140" cy="90" r="95" fill="none" stroke="#f7931a" strokeWidth="0.5" strokeOpacity="0.2"/>
          <image href={TRACKOSHI_ICON} x="90" y="40" width="100" height="100" style={{ borderRadius: 24 }}/>
          <text x="22" y="68" fontSize="11" fill="#f7931a" opacity="0.6" fontFamily="monospace">+89.6%</text>
          <text x="198" y="48" fontSize="10" fill="#555" fontFamily="monospace">CHF 87'914</text>
          <text x="195" y="125" fontSize="10" fill="#f7931a" opacity="0.45" fontFamily="monospace">1.3799 BTC</text>
          <text x="18" y="128" fontSize="10" fill="#555" fontFamily="monospace">↑ +49'032</text>
          <text x="140" y="168" fontSize="22" fontWeight="700" fill="#fff" textAnchor="middle" letterSpacing="-0.5">Trackoshi BTC</text>
          <text x="140" y="188" fontSize="12" fill="#555" textAnchor="middle">Bitcoin Portfolio Tracker</text>
        </svg>
    )},
    { title: slidesData[1].title, text: slidesData[1].text, svg: (
        <svg viewBox="0 0 280 210" width="270" style={{ display: "block" }}>
          <rect x="20" y="10" width="240" height="100" rx="14" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="36" y="32" fontSize="10" fill="#555">BTC Kurs</text>
          <text x="36" y="52" fontSize="20" fontWeight="700" fill="#fff" letterSpacing="-0.5">CHF 63'693</text>
          <text x="36" y="67" fontSize="11" fill="#888">$ 81'849</text>
          <polyline points="36,96 65,81 90,86 120,66 150,71 180,56 210,61 244,49" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="244" cy="49" r="3" fill="#22c55e"/>
          <rect x="188" y="13" width="66" height="20" rx="10" fill="#f7931a" fillOpacity="0.15"/>
          <text x="221" y="26" fontSize="9" fill="#f7931a" textAnchor="middle" fontWeight="600">Fear &amp; Greed 48</text>
          <rect x="20" y="120" width="115" height="78" rx="12" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="32" y="140" fontSize="9" fill="#555">Gesamtwert</text>
          <text x="32" y="158" fontSize="16" fontWeight="700" fill="#fff" letterSpacing="-0.3">87'914</text>
          <text x="32" y="173" fontSize="9" fill="#22c55e">↑ +91.2%</text>
          <text x="32" y="188" fontSize="9" fill="#444">CHF 37'965 investiert</text>
          <rect x="145" y="120" width="115" height="78" rx="12" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="157" y="140" fontSize="9" fill="#555">BTC Bestand</text>
          <text x="157" y="158" fontSize="16" fontWeight="700" fill="#fff" letterSpacing="-0.3">1.3799</text>
          <text x="157" y="173" fontSize="9" fill="#555">BTC</text>
          <text x="157" y="188" fontSize="9" fill="#555">Einstand CHF 35'693</text>
        </svg>
    )},
    { title: slidesData[2].title, text: slidesData[2].text, svg: (
        <svg viewBox="0 0 280 210" width="270" style={{ display: "block" }}>
          <rect x="20" y="10" width="240" height="115" rx="14" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="36" y="30" fontSize="9" fill="#555">Break-even Analyse</text>
          <defs><linearGradient id="beg3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ef4444"/><stop offset="50%" stopColor="#eab308"/><stop offset="100%" stopColor="#22c55e"/></linearGradient></defs>
          <path d="M 48 95 A 52 52 0 0 1 152 95" fill="none" stroke="#222" strokeWidth="9" strokeLinecap="round"/>
          <path d="M 48 95 A 52 52 0 0 1 152 95" fill="none" stroke="url(#beg3)" strokeWidth="9" strokeLinecap="round"/>
          <line x1="100" y1="95" x2="138" y2="62" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="100" cy="95" r="5" fill="#22c55e"/>
          <circle cx="100" cy="95" r="2.5" fill="#1c1c1e"/>
          <text x="165" y="68" fontSize="22" fontWeight="700" fill="#22c55e">+91%</text>
          <text x="165" y="82" fontSize="9" fill="#555">seit Einstand</text>
          <text x="36" y="110" fontSize="9" fill="#444">Einstand CHF 35'693</text>
          <text x="155" y="110" fontSize="9" fill="#444">Aktuell CHF 63'693</text>
          <rect x="20" y="135" width="240" height="65" rx="12" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="36" y="152" fontSize="9" fill="#555">Kursverlauf vs. Einstand</text>
          <polyline points="36,190 65,178 95,183 125,162 155,167 185,150 215,155 244,143" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="36" y1="184" x2="244" y2="184" stroke="#f7931a" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
          <circle cx="244" cy="143" r="3" fill="#22c55e"/>
        </svg>
    )},
    { title: slidesData[3].title, text: slidesData[3].text, svg: (
        <svg viewBox="0 0 280 210" width="270" style={{ display: "block" }}>
          <rect x="20" y="10" width="240" height="130" rx="14" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <rect x="32" y="22" width="32" height="32" rx="8" fill="#f7931a"/>
          <text x="48" y="43" fontSize="14" fill="#000" textAnchor="middle" fontWeight="700">AI</text>
          <text x="72" y="34" fontSize="11" fontWeight="600" fill="#fff">Portfolio-Analyse</text>
          <text x="72" y="48" fontSize="9" fill="#555">Powered by Claude AI</text>
          <rect x="32" y="64" width="185" height="7" rx="3" fill="#2a2a2a"/>
          <rect x="32" y="78" width="155" height="7" rx="3" fill="#2a2a2a"/>
          <rect x="32" y="92" width="200" height="7" rx="3" fill="#2a2a2a"/>
          <rect x="32" y="106" width="125" height="7" rx="3" fill="#2a2a2a"/>
          <rect x="32" y="120" width="165" height="7" rx="3" fill="#f7931a" fillOpacity="0.25"/>
          <rect x="20" y="152" width="74" height="50" rx="10" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="57" y="175" fontSize="20" textAnchor="middle">📊</text>
          <text x="57" y="191" fontSize="9" fill="#555" textAnchor="middle">Portfolio</text>
          <rect x="103" y="152" width="74" height="50" rx="10" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="140" y="175" fontSize="20" textAnchor="middle">🌐</text>
          <text x="140" y="191" fontSize="9" fill="#555" textAnchor="middle">Markt</text>
          <rect x="186" y="152" width="74" height="50" rx="10" fill="#1c1c1e" stroke="#f7931a" strokeWidth="1" strokeOpacity="0.5"/>
          <text x="223" y="175" fontSize="20" textAnchor="middle">📰</text>
          <text x="223" y="191" fontSize="9" fill="#f7931a" textAnchor="middle">BTC-News</text>
        </svg>
    )},
    { title: slidesData[4].title, text: slidesData[4].text, svg: (
        <svg viewBox="0 0 280 210" width="260" style={{ display: "block" }}>
          <path d="M 140 15 L 205 42 L 205 112 C 205 150 140 178 140 178 C 140 178 75 150 75 112 L 75 42 Z" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1.5"/>
          <path d="M 140 27 L 197 51 L 197 110 C 197 143 140 167 140 167 C 140 167 83 143 83 110 L 83 51 Z" fill="#111"/>
          <polyline points="112,95 128,111 168,78" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="140" y="140" fontSize="10" fill="#444" textAnchor="middle">Gespeichert in der EU</text>
          <rect x="14" y="58" width="56" height="22" rx="11" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="42" y="72" fontSize="9" fill="#555" textAnchor="middle">CSV Export</text>
          <rect x="210" y="58" width="56" height="22" rx="11" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="238" y="72" fontSize="9" fill="#555" textAnchor="middle">DSGVO ✓</text>
          <rect x="14" y="98" width="56" height="22" rx="11" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="42" y="112" fontSize="9" fill="#555" textAnchor="middle">Löschbar</text>
          <rect x="210" y="98" width="56" height="22" rx="11" fill="#1c1c1e" stroke="#2a2a2a" strokeWidth="1"/>
          <text x="238" y="112" fontSize="9" fill="#555" textAnchor="middle">Privat ✓</text>
          <text x="140" y="200" fontSize="13" fontWeight="600" fill="#f7931a" textAnchor="middle">{t("onboarding.datenGehoeren")}</text>
        </svg>
    )},
  ];

  const s = slides[slide];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 28 }}>{s.svg}</div>
        <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 14, lineHeight: 1.2, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>{s.title}</div>
        <div style={{ color: "#aaa", fontSize: 15, textAlign: "center", lineHeight: 1.65, maxWidth: 280 }}>{s.text}</div>
      </div>

      {isLast && (
        <button onClick={() => setShowPrivacy(true)} style={{ background: "none", border: "none", color: "#f7931a", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, textDecoration: "underline" }}>
          {t("onboarding.datenschutzLink")}
        </button>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 8, height: 4, borderRadius: 2, background: i === slide ? "#f7931a" : "#333", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isLast ? "1fr" : "1fr 2fr", gap: 12, width: "100%", maxWidth: 360 }}>
        {!isLast && (
          <button onClick={onFinish} style={{ padding: "15px 0", background: "#1c1c1e", border: "1px solid #333", color: "#666", borderRadius: 14, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>{t("onboarding.ueberspringen")}</button>
        )}
        <button onClick={() => isLast ? onFinish() : setSlide(s => s + 1)} style={{ padding: "15px 0", background: "#f7931a", border: "none", color: "#000", borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>
          {isLast ? t("onboarding.loslegen") : t("onboarding.weiter")}
        </button>
      </div>

      {showPrivacy && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }} onClick={() => setShowPrivacy(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1c1c1e", border: "1px solid #2a2a2a", borderRadius: 20, padding: "28px 24px 24px", width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("privacy.title")}</div>
            {privacyContent.map(({ title, text }) => (
              <div key={title} style={{ marginBottom: 16 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                <div style={{ color: "#888", fontSize: 14, lineHeight: 1.5 }}>{text}</div>
              </div>
            ))}
            <button onClick={() => setShowPrivacy(false)} style={{ width: "100%", padding: "15px 0", background: "#2a2a2a", border: "1px solid #333", color: "#888", borderRadius: 12, cursor: "pointer", fontSize: 15, fontFamily: "inherit", marginTop: 8 }}>{t("privacy.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsView({ darkMode, setDarkMode, T, transactions, userEmail, onLogout, currency = "CHF", setCurrency, usdChf = 0.9, eurUsd = 0.92, btcChf = 0, btcUsd = 0, onResetOnboarding, onImport, costMethod = "FIFO", setCostMethod, language, setLanguage, secondaryCurrency = "none", setSecondaryCurrency, fontScale = "M", setFontScale, showFearGreed = false, setShowFearGreed, showMarketChart = true, setShowMarketChart, showPositionCard = true, setShowPositionCard }) {
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

      {/* DARSTELLUNG */}
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

      {/* DASHBOARD */}
      <div style={{ color: T.textMuted, fontSize: 12, letterSpacing: "0.08em", marginBottom: 8, marginTop: 24 }}>{t("settings.dashboard")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>

        {/* Portfolio-Währung */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>{t("settings.portfolioWaehrung")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {["CHF", "EUR", "USD"].map((c) => (
              <button key={c} onClick={() => setCurrency(c)} style={{ padding: "10px 0", background: currency === c ? "#f7931a" : T.input, border: `1px solid ${currency === c ? "#f7931a" : T.border}`, borderRadius: 10, color: currency === c ? "#000" : T.textMuted, fontSize: 14, fontWeight: currency === c ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Sekundärkurs */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{t("settings.sekundaerkurs")}</div>
          <div style={{ color: T.textFaint, fontSize: 11, marginBottom: 8 }}>{t("settings.sekundaerkursHint")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
            {["none", "CHF", "EUR", "USD"].map((c) => {
              const isActive = secondaryCurrency === c;
              const isDisabled = c !== "none" && c === currency;
              const label = c === "none" ? t("settings.sekundaerkursAus") : c;
              return (
                <button key={c} onClick={() => !isDisabled && setSecondaryCurrency(c)}
                  style={{ padding: "10px 0", background: isActive ? "#f7931a" : T.input, border: `1px solid ${isActive ? "#f7931a" : T.border}`, borderRadius: 10, color: isActive ? "#000" : isDisabled ? T.textFaint : T.textMuted, fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: isDisabled ? "default" : "pointer", fontFamily: "inherit", opacity: isDisabled ? 0.35 : 1 }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fear & Greed */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.text, fontSize: 15 }}>{t("market.fearGreedLabel")}</div>
              <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.fearGreedHint")}</div>
            </div>
            <div onClick={() => setShowFearGreed(!showFearGreed)} style={{ width: 51, height: 31, borderRadius: 16, cursor: "pointer", background: showFearGreed ? "#f7931a" : darkMode ? "#3a3a3c" : "#e0e0e0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ width: 27, height: 27, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: showFearGreed ? 22 : 2, transition: "left 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Markt-Chart */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.text, fontSize: 15 }}>{t("settings.marktChart")}</div>
              <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.marktChartHint")}</div>
            </div>
            <div onClick={() => setShowMarketChart(!showMarketChart)} style={{ width: 51, height: 31, borderRadius: 16, cursor: "pointer", background: showMarketChart ? "#f7931a" : darkMode ? "#3a3a3c" : "#e0e0e0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ width: 27, height: 27, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: showMarketChart ? 22 : 2, transition: "left 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Position */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.text, fontSize: 15 }}>{t("settings.positionCard")}</div>
              <div style={{ color: T.textFaint, fontSize: 12, marginTop: 2 }}>{t("settings.positionCardHint")}</div>
            </div>
            <div onClick={() => setShowPositionCard(!showPositionCard)} style={{ width: 51, height: 31, borderRadius: 16, cursor: "pointer", background: showPositionCard ? "#f7931a" : darkMode ? "#3a3a3c" : "#e0e0e0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ width: 27, height: 27, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: showPositionCard ? 22 : 2, transition: "left 0.25s", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Einstandspreis-Methode */}
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600 }}>{t("settings.einstandsMethode")}</div>
            <button onClick={() => setShowCostInfo(true)} style={{ background: T.input, border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: "50%", width: 20, height: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", flexShrink: 0, padding: 0, lineHeight: 1 }}>?</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {["FIFO", "AVCO"].map((key) => (
              <button key={key} onClick={() => setCostMethod(key)} style={{ padding: "10px 0", background: costMethod === key ? "#f7931a" : T.input, border: `1px solid ${costMethod === key ? "#f7931a" : T.border}`, borderRadius: 10, color: costMethod === key ? "#000" : T.textMuted, fontSize: 14, fontWeight: costMethod === key ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>{key}</button>
            ))}
          </div>
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

      {/* SPRACHE — kompakte Pill-Buttons */}
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 8, marginTop: 24 }}>{t("settings.sprache")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: T.textMuted, fontSize: 14 }}>{t("settings.anzeigesprache")}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[["de", "🇩🇪 DE"], ["en", "🇬🇧 EN"]].map(([code, label]) => (
            <button key={code} onClick={() => setLanguage(code)}
              style={{ padding: "7px 16px", background: language === code ? "#f7931a" : T.input, border: `1px solid ${language === code ? "#f7931a" : T.border}`, borderRadius: 20, color: language === code ? "#000" : T.textMuted, fontSize: 13, fontWeight: language === code ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* DATEN */}
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 8, marginTop: 24 }}>{t("settings.daten")}</div>
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
        {[{ label: t("settings.version"), value: "3.4.2" }, { label: t("settings.datenbank"), value: "Supabase" }, { label: t("settings.kursApi"), value: "CoinGecko" }].map(({ label, value }, i, arr) => (
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
      <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 8, marginTop: 24 }}>{t("settings.rechtliches")}</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div onClick={() => setShowAgbModal(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.agb")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: T.textFaint, fontSize: 12 }}>{language === "en" ? "view" : "ansehen"}</span>
            <span style={{ color: T.textMuted, fontSize: 20, lineHeight: 1 }}>›</span>
          </div>
        </div>
        <div onClick={() => setShowPrivacy(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer" }}>
          <span style={{ color: T.text, fontSize: 15 }}>{t("settings.datenschutz")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: T.textFaint, fontSize: 12 }}>{language === "en" ? "view" : "ansehen"}</span>
            <span style={{ color: T.textMuted, fontSize: 20, lineHeight: 1 }}>›</span>
          </div>
        </div>
      </div>

      {/* GEFAHRENZONE */}
      <div style={{ color: "#ef4444", fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", opacity: 0.7, marginBottom: 8, marginTop: 32 }}>{t("settings.kontoLoeschenSection")}</div>
      <div style={{ background: T.surface, border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, overflow: "hidden" }}>
        <div onClick={() => setShowDeleteModal(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer" }}>
          <span style={{ color: "#ef4444", fontSize: 15 }}>{t("settings.kontoLoeschen")}</span>
          <span style={{ color: "#ef4444", fontSize: 20, lineHeight: 1, opacity: 0.6 }}>›</span>
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
  const [showDemoAfterOnboarding, setShowDemoAfterOnboarding] = useState(false);

  const finishOnboarding = () => {
    try { localStorage.setItem("onboardingDone", "true"); } catch {}
    setShowOnboarding(false);
    setShowDemoAfterOnboarding(true);
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

  const [showFearGreed, setShowFearGreedState] = useState(() => {
    try { return localStorage.getItem("showFearGreed") === "true"; } catch { return false; }
  });
  const setShowFearGreed = (v) => { setShowFearGreedState(v); try { localStorage.setItem("showFearGreed", String(v)); } catch {} };

  const [showMarketChart, setShowMarketChartState] = useState(() => {
    try { return localStorage.getItem("showMarketChart") !== "false"; } catch { return true; }
  });
  const setShowMarketChart = (v) => { setShowMarketChartState(v); try { localStorage.setItem("showMarketChart", String(v)); } catch {} };

  const [showPositionCard, setShowPositionCardState] = useState(() => {
    try { return localStorage.getItem("showPositionCard") !== "false"; } catch { return true; }
  });
  const setShowPositionCard = (v) => { setShowPositionCardState(v); try { localStorage.setItem("showPositionCard", String(v)); } catch {} };

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
        body: JSON.stringify({ tool, portfolio: tool === "news" ? null : portfolioPayload, lang: language }),
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
        <img src="/icons/icon-192.png" alt="Trackoshi BTC" style={{ width: 80, height: 80, borderRadius: 22, boxShadow: "0 8px 32px rgba(247,147,26,0.35)", animation: "btc-pulse 1.8s ease-in-out infinite" }} />
        <div style={{ color: T.text, fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>Trackoshi BTC</div>
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
                <MarketCard btcChf={btcChf} btcUsd={btcUsd} dayChangePct={dayChangePct} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} secondaryCurrency={secondaryCurrency} showChart={showMarketChart} />
                {showFearGreed && <FearGreedCard T={T} language={language} />}
                {showPositionCard && <PositionCard totalBtc={totalBtc} portfolioChf={portfolioChf} totalInvested={totalInvested} avgChf={avgChf} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />}
                <PortfolioCard portfolioChf={portfolioChf} pnlChf={pnlChf} pnlPct={pnlPct} totalInvested={totalInvested} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} transactions={transactions} btcChfLive={btcChf} rawPriceData={rawPriceData} language={language} darkMode={darkMode} />
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

                {/* Finanz-Tools */}
                <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginTop: 20, marginBottom: 10 }}>{t("tools.finanzTools")}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 20 }}>

                  {/* Kauf-Simulator */}
                  <button onClick={() => setShowDcaModal(true)} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160, padding: "16px 14px", background: "#fff8f0", border: `1px solid rgba(247,147,26,0.15)`, borderRadius: 18, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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
                    <div>
                      <div style={{ color: "#1c1c1e", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t("tools.kaufSimulator")}</div>
                      <div style={{ color: "#636366", fontSize: 11, lineHeight: 1.4 }}>{t("tools.kaufSimulatorHint")}</div>
                    </div>
                  </button>

                  {/* Szenario-Rechner */}
                  <button onClick={() => setShowSzenarioModal(true)} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160, padding: "16px 14px", background: "#fff8f0", border: `1px solid rgba(247,147,26,0.15)`, borderRadius: 18, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🎯</div>
                    <div>
                      <div style={{ color: "#1c1c1e", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{language === "en" ? "Scenario Calculator" : "Szenario-Rechner"}</div>
                      <div style={{ color: "#636366", fontSize: 11, lineHeight: 1.4 }}>{language === "en" ? "Portfolio value at target price" : "Portfoliowert bei Zielkurs"}</div>
                    </div>
                  </button>
                </div>

                {/* KI-Tools */}
                <div style={{ color: T.textFaint, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 10 }}>{t("tools.aiTools")}</div>

                {/* News-Briefing — volle Breite */}
                <button
                  onClick={() => callClaudeAI("news")}
                  disabled={aiLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px", background: "#fff8f0", border: `1px solid rgba(247,147,26,0.15)`, borderRadius: 18, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: aiLoading ? 0.5 : 1, marginBottom: 10 }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>📰</div>
                  <div>
                    <div style={{ color: "#1c1c1e", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t("tools.aiNewsBtn")}</div>
                    <div style={{ color: "#636366", fontSize: 11, lineHeight: 1.4 }}>{t("tools.aiNewsBtnHint")}</div>
                  </div>
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 20 }}>

                  {/* Portfolio analysieren */}
                  <button
                    onClick={() => callClaudeAI("portfolio")}
                    disabled={aiLoading || totalBtc === 0}
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160, padding: "16px 14px", background: "#fff8f0", border: `1px solid rgba(247,147,26,0.15)`, borderRadius: 18, cursor: aiLoading || totalBtc === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: aiLoading || totalBtc === 0 ? 0.5 : 1 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>📊</div>
                    <div>
                      <div style={{ color: "#1c1c1e", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t("tools.aiPortfolioBtn")}</div>
                      <div style={{ color: "#636366", fontSize: 11, lineHeight: 1.4 }}>{t("tools.aiPortfolioBtnHint")}</div>
                    </div>
                  </button>

                  {/* Markt-Kommentar */}
                  <button
                    onClick={() => callClaudeAI("market")}
                    disabled={aiLoading}
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 160, padding: "16px 14px", background: "#fff8f0", border: `1px solid rgba(247,147,26,0.15)`, borderRadius: 18, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", opacity: aiLoading ? 0.5 : 1 }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: "#f7931a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🌐</div>
                    <div>
                      <div style={{ color: "#1c1c1e", fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t("tools.aiMarketBtn")}</div>
                      <div style={{ color: "#636366", fontSize: 11, lineHeight: 1.4 }}>{t("tools.aiMarketBtnHint")}</div>
                    </div>
                  </button>
                </div>

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
            <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} T={T} transactions={transactions} userEmail={session?.user?.email} onLogout={() => { setShowSettings(false); handleLogout(); }} currency={currency} setCurrency={setCurrency} usdChf={usdChf} eurUsd={eurUsd} btcChf={btcChf} btcUsd={btcUsd} onResetOnboarding={() => { setShowSettings(false); resetOnboarding(); }} onImport={handleImportTransactions} costMethod={costMethod} setCostMethod={setCostMethod} language={language} setLanguage={setLanguage} secondaryCurrency={secondaryCurrency} setSecondaryCurrency={setSecondaryCurrency} fontScale={fontScale} setFontScale={setFontScale} showFearGreed={showFearGreed} setShowFearGreed={setShowFearGreed} showMarketChart={showMarketChart} setShowMarketChart={setShowMarketChart} showPositionCard={showPositionCard} setShowPositionCard={setShowPositionCard} />
          </div>
        </div>
      )}
      {showOnboarding && <OnboardingScreen onFinish={finishOnboarding} T={T} language={language} />}
      {showDemoAfterOnboarding && (
        <DemoImportModal
          key="demo-after-onboarding"
          onClose={() => setShowDemoAfterOnboarding(false)}
          onImport={handleImportTransactions}
          transactions={transactions}
          T={T}
          language={language}
        />
      )}
      <BottomNav view={view} setView={setView} onAdd={() => { setEditTx(null); setShowModal(true); }} T={T} language={language} />
      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditTx(null); }} onSave={handleSave} editTx={editTx} T={T} currency={currency} usdChf={usdChf} eurUsd={eurUsd} language={language} />}
    </>
  );
}
