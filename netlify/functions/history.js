// Cache: historische BTC/USD Tageskurse, 24h gueltig
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Stunden

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function fetchCoinGecko() {
  // Versuche mit verschiedenen Parametern
  const urls = [
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=730&interval=daily",
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365&interval=daily",
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: { "Accept": "application/json" },
      });
      if (!r.ok) continue;
      const d = await r.json();
      if (d.prices?.length > 10) return d.prices;
    } catch {}
    // Kurze Pause zwischen Versuchen
    await new Promise(res => setTimeout(res, 1000));
  }
  return null;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const now = Date.now();

  // Cache pruefen
  if (cache && now - cacheTime < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { ...headers, "X-Cache": "HIT" },
      body: JSON.stringify(cache),
    };
  }

  const rawPrices = await fetchCoinGecko();

  if (!rawPrices) {
    // Stale Cache zurueckgeben falls vorhanden
    if (cache) {
      return {
        statusCode: 200,
        headers: { ...headers, "X-Cache": "STALE" },
        body: JSON.stringify(cache),
      };
    }
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: "Keine Preisdaten verfuegbar" }),
    };
  }

  // Formatiere als [[YYYY-MM-DD, priceUsd], ...]
  const prices = rawPrices.map(([ts, price]) => {
    const dt = new Date(ts);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    return [iso, Math.round(price)];
  });

  const result = { prices, timestamp: now };
  cache = result;
  cacheTime = now;

  return {
    statusCode: 200,
    headers: { ...headers, "X-Cache": "MISS" },
    body: JSON.stringify(result),
  };
};
