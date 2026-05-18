// netlify/functions/claude.js
// Claude AI Tools: Portfolio-Analyse + Markt-Kommentar + News-Briefing
// Version: 1.23.0 — Variante 2: Qualitative Portfolio-Analyse (keine konkreten Beträge/Prozente)

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "API key not configured" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { tool, portfolio, lang = "de" } = body;

  if (!tool || !["portfolio", "market", "news"].includes(tool)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid tool" }) };
  }

  const p = portfolio || {};

  const portfolioPromptDe = `Du bist ein sachlicher Bitcoin-Portfolio-Analyst. Analysiere das folgende Portfolio und gib eine klare, ehrliche Einschätzung auf Deutsch.

WICHTIG — REGELN FÜR ZAHLEN IN DEINER ANTWORT:
Die User sehen die exakten Beträge bereits in der App. Deine Aufgabe ist eine QUALITATIVE Einordnung.

VERBOTEN in deiner Antwort:
- Konkrete Geldbeträge (z.B. "44'016 CHF", "38'882 EUR", "59'866 USD")
- Konkrete Prozentwerte für Gewinn/Verlust (z.B. "+81.9%", "-12.3%")
- Konkrete Einstandspreise oder BTC-Kurse als Zahl

ERLAUBT in deiner Antwort:
- Anzahl Transaktionen (z.B. "45 Transaktionen")
- Datumsangaben (z.B. "seit Januar 2022")
- Methodenname (z.B. "FIFO", "AVCO")
- Qualitative Beschreibungen ("deutlich im Gewinn", "stark gewachsen", "moderat", "leicht im Minus", "Einstandspreis deutlich unter dem aktuellen Kurs")

Portfolio-Daten (NUR als Kontext für deine Einschätzung — NICHT in deiner Antwort wiederholen):
- BTC-Bestand: ${p.totalBtc} BTC
- Investiert: ${p.invested} ${p.currency}
- Portfoliowert heute: ${p.value} ${p.currency}
- Unrealisierter Gewinn/Verlust: ${p.pnl} ${p.currency} (${p.pnlPct}%)
- Ø Einstandspreis (${p.method}): ${p.breakEven} ${p.currency}/BTC
- Aktueller BTC-Kurs: ${p.btcPrice} ${p.currency}
- Anzahl Transaktionen: ${p.txCount}
- Erste Transaktion: ${p.firstTx}
- Realisierter Gewinn/Verlust: ${p.realizedPnl} ${p.currency}

Strukturiere deine Antwort in genau 3 kurze Abschnitte (je 2-3 Sätze):
1. **Aktuelle Position** — Wo steht das Portfolio qualitativ heute?
2. **Stärken** — Was läuft gut?
3. **Risiken & Hinweise** — Was sollte beachtet werden?

Kein Finanzberatungs-Disclaimer nötig. Direkt und auf den Punkt.`;

  const portfolioPromptEn = `You are a factual Bitcoin portfolio analyst. Analyze the following portfolio and provide a clear, honest assessment in English.

IMPORTANT — RULES FOR NUMBERS IN YOUR RESPONSE:
Users already see the exact amounts in the app. Your task is a QUALITATIVE assessment.

FORBIDDEN in your response:
- Concrete monetary amounts (e.g. "44,016 CHF", "38,882 EUR", "59,866 USD")
- Concrete percentage values for gain/loss (e.g. "+81.9%", "-12.3%")
- Concrete cost basis or BTC prices as a number

ALLOWED in your response:
- Number of transactions (e.g. "45 transactions")
- Dates (e.g. "since January 2022")
- Method name (e.g. "FIFO", "AVCO")
- Qualitative descriptions ("clearly in profit", "strong growth", "moderate", "slightly negative", "cost basis well below current price")

Portfolio data (context for your assessment ONLY — do NOT repeat in your response):
- BTC balance: ${p.totalBtc} BTC
- Invested: ${p.invested} ${p.currency}
- Portfolio value today: ${p.value} ${p.currency}
- Unrealized gain/loss: ${p.pnl} ${p.currency} (${p.pnlPct}%)
- Avg. cost basis (${p.method}): ${p.breakEven} ${p.currency}/BTC
- Current BTC price: ${p.btcPrice} ${p.currency}
- Number of transactions: ${p.txCount}
- First transaction: ${p.firstTx}
- Realized gain/loss: ${p.realizedPnl} ${p.currency}

Structure your response in exactly 3 short sections (2-3 sentences each):
1. **Current Position** — Where does the portfolio stand qualitatively today?
2. **Strengths** — What is going well?
3. **Risks & Notes** — What should be considered?

No financial advice disclaimer needed. Direct and to the point.`;

  const newsPromptDe = `Du bist ein prägnanter Bitcoin-News-Analyst. Fasse die wichtigsten aktuellen BTC-News der letzten 24-48 Stunden auf Deutsch zusammen.

Strukturiere deine Antwort in genau 3 kurze Abschnitte (je 2-3 Sätze):
1. **Top-News** — Was sind die wichtigsten Schlagzeilen?
2. **Markt-Reaktion** — Wie hat der Markt reagiert?
3. **Was beobachten** — Welche Entwicklungen sollte man im Auge behalten?

Bleib sachlich und präzise. Nur verifizierte Informationen.`;

  const newsPromptEn = `You are a concise Bitcoin news analyst. Summarize the most important current BTC news from the last 24-48 hours in English.

Structure your response in exactly 3 short sections (2-3 sentences each):
1. **Top News** — What are the most important headlines?
2. **Market Reaction** — How has the market reacted?
3. **What to Watch** — Which developments should be monitored?

Stay factual and precise. Only verified information.`;

  const marketPromptDe = `Du bist ein prägnanter Bitcoin-Marktbeobachter. Nutze dein aktuelles Wissen über den BTC-Markt und gib einen kurzen Markt-Kommentar auf Deutsch.

Aktueller BTC-Kurs laut App: ${p.btcPrice} ${p.currency} (24h: ${p.change24h}%)

Strukturiere deine Antwort in genau 3 kurze Abschnitte (je 2-3 Sätze):
1. **Marktlage** — Wie ist die aktuelle Situation?
2. **Sentiment** — Was bewegt den Markt gerade?
3. **Kurzfristiger Ausblick** — Was könnte als nächstes passieren?

Bleib sachlich. Kein Finanzberatungs-Disclaimer nötig.`;

  const marketPromptEn = `You are a concise Bitcoin market observer. Provide a brief market commentary in English.

Current BTC price per app: ${p.btcPrice} ${p.currency} (24h: ${p.change24h}%)

Structure your response in exactly 3 short sections (2-3 sentences each):
1. **Market Situation** — What is the current situation?
2. **Sentiment** — What is moving the market right now?
3. **Short-term Outlook** — What could happen next?

Stay factual. No financial advice disclaimer needed.`;

  const prompt =
    tool === "portfolio"
      ? (lang === "de" ? portfolioPromptDe : portfolioPromptEn)
      : tool === "news"
      ? (lang === "de" ? newsPromptDe : newsPromptEn)
      : (lang === "de" ? marketPromptDe : marketPromptEn);

  const useWebSearch = tool === "market" || tool === "news";

  const requestBody = {
    model: "claude-sonnet-4-5",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
    ...(useWebSearch && {
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        ...(useWebSearch && { "anthropic-beta": "web-search-2025-03-05" }),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "AI request failed", detail: err }) };
    }

    const data = await response.json();

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return { statusCode: 200, headers, body: JSON.stringify({ result: text }) };

  } catch (err) {
    console.error("Claude function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
