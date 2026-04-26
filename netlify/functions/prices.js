// Cache: gespeicherte Preise + Zeitstempel
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 Sekunden

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Cache prüfen
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { ...headers, "X-Cache": "HIT" },
      body: JSON.stringify(cache),
    };
  }

  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf,eur&include_24hr_change=true"
    );
    const d = await r.json();

    if (!d.bitcoin) {
      throw new Error("Ungültige API-Antwort");
    }

    const result = {
      usd: d.bitcoin.usd,
      chf: d.bitcoin.chf,
      eur: d.bitcoin.eur,
      usd_24h_change: d.bitcoin.usd_24h_change ?? 0,
      usdChf: d.bitcoin.chf / d.bitcoin.usd,
      eurUsd: d.bitcoin.eur / d.bitcoin.usd,
      timestamp: now,
    };

    // Cache aktualisieren
    cache = result;
    cacheTime = now;

    return {
      statusCode: 200,
      headers: { ...headers, "X-Cache": "MISS" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    // Bei Fehler: alten Cache zurückgeben falls vorhanden
    if (cache) {
      return {
        statusCode: 200,
        headers: { ...headers, "X-Cache": "STALE" },
        body: JSON.stringify(cache),
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
