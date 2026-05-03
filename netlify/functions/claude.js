// netlify/functions/claude.js
// Claude AI Tools: Portfolio-Analyse + Markt-Kommentar
// Version: 1.19.0 — CommonJS Format

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

  if (!tool || !["portfolio", "market"].includes(tool)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid tool" }) };
  }

  const portfolioPromptDe = `Du bist ein sachlicher Bitcoin-Portfolio-Analyst. Analysiere das folgende Portfolio und gib eine klare, ehrliche Einschätzung auf Deutsch.

Portfolio-Daten:
- BTC-Bestand: ${portfolio.totalBtc} BTC
- Investiert: ${portfolio.invested} ${portfolio.currency}
- Portfoliowert heute: ${portfolio.value} ${portfolio.currency}
- Unrealisierter Gewinn/Verlust: ${portfolio.pnl} ${portfolio.currency} (${portfolio.pnlPct}%)
- Ø Einstandspreis (${portfolio.method}): ${portfolio.breakEven} ${portfolio.currency}/BTC
- Aktueller BTC-Kurs: ${portfolio.btcPrice} ${portfolio.currency}
- Anzahl Transaktionen: ${portfolio.txCount}
- Erste Transaktion: ${portfolio.firstTx}
- Realisierter Gewinn/Verlust: ${portfolio.realizedPnl} ${portfolio.currency}

Strukturiere deine Antwort in genau 3 kurze Abschnitte (je 2-3 Sätze):
1. **Aktuelle Position** — Wo steht das Portfolio heute?
2. **Stärken** — Was läuft gut?
3. **Risiken & Hinweise** — Was sollte beachtet werden?

Kein Finanzberatungs-Disclaimer nötig. Direkt und auf den Punkt.`;

  const portfolioPromptEn = `You are a factual Bitcoin portfolio analyst. Analyze the following portfolio and provide a clear, honest assessment in English.

Portfolio data:
- BTC balance: ${portfolio.totalBtc} BTC
- Invested: ${portfolio.invested} ${portfolio.currency}
- Portfolio value today: ${portfolio.value} ${portfolio.currency}
- Unrealized gain/loss: ${portfolio.pnl} ${portfolio.currency} (${portfolio.pnlPct}%)
- Avg. cost basis (${portfolio.method}): ${portfolio.breakEven} ${portfolio.currency}/BTC
- Current BTC price: ${portfolio.btcPrice} ${portfolio.currency}
- Number of transactions: ${portfolio.txCount}
- First transaction: ${portfolio.firstTx}
- Realized gain/loss: ${portfolio.realizedPnl} ${portfolio.currency}

Structure your response in exactly 3 short sections (2-3 sentences each):
1. **Current Position** — Where does the portfolio stand today?
2. **Strengths** — What is going well?
3. **Risks & Notes** — What should be considered?

No financial advice disclaimer needed. Direct and to the point.`;

  const marketPromptDe = `Du bist ein prägnanter Bitcoin-Marktbeobachter. Nutze dein aktuelles Wissen über den BTC-Markt und gib einen kurzen Markt-Kommentar auf Deutsch.

Aktueller BTC-Kurs laut App: ${portfolio.btcPrice} ${portfolio.currency} (24h: ${portfolio.change24h}%)

Strukturiere deine Antwort in genau 3 kurze Abschnitte (je 2-3 Sätze):
1. **Marktlage** — Wie ist die aktuelle Situation?
2. **Sentiment** — Was bewegt den Markt gerade?
3. **Kurzfristiger Ausblick** — Was könnte als nächstes passieren?

Bleib sachlich. Kein Finanzberatungs-Disclaimer nötig.`;

  const marketPromptEn = `You are a concise Bitcoin market observer. Provide a brief market commentary in English.

Current BTC price per app: ${portfolio.btcPrice} ${portfolio.currency} (24h: ${portfolio.change24h}%)

Structure your response in exactly 3 short sections (2-3 sentences each):
1. **Market Situation** — What is the current situation?
2. **Sentiment** — What is moving the market right now?
3. **Short-term Outlook** — What could happen next?

Stay factual. No financial advice disclaimer needed.`;

  const prompt =
    tool === "portfolio"
      ? (lang === "de" ? portfolioPromptDe : portfolioPromptEn)
      : (lang === "de" ? marketPromptDe : marketPromptEn);

  const useWebSearch = tool === "market";

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
