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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { ...headers, "X-Cache": "HIT" },
      body: JSON.stringify(cache),
    };
  }

  try {
    // 730 Tage taegl. BTC/USD Kurse von CoinGecko
    const r = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=730&interval=daily"
    );
    const d = await r.json();

    if (!d.prices?.length) throw new Error("Keine Preisdaten");

    // Formatiere als [[YYYY-MM-DD, priceUsd], ...]
    const prices = d.prices.map(([ts, price]) => {
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
  } catch (err) {
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
