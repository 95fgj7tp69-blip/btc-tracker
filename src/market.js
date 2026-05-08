// netlify/functions/market.js
// Proxy für MarketCard Chart-Daten — mit Tab-spezifischem Cache
// 1T: 5min Cache / 1W+: 60min Cache

const cache = {};

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const days = parseInt(event.queryStringParameters?.days ?? "1", 10);
  const ttl = days === 1 ? 5 * 60 * 1000 : 60 * 60 * 1000; // 5min oder 60min
  const cacheKey = `market_${days}`;
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].ts < ttl) {
    return { statusCode: 200, headers, body: JSON.stringify(cache[cacheKey].data) };
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const d = await r.json();

    const prices = (d.prices || []).map(([ts, price]) => {
      const dt = new Date(ts);
      let label;
      if (days === 1) {
        label = dt.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
      } else if (days <= 7) {
        label = dt.toLocaleDateString("de-CH", { weekday: "short" });
      } else {
        label = dt.toLocaleDateString("de-CH", { day: "numeric", month: "short" });
      }
      return { t: label, v: Math.round(price) };
    });

    const step = Math.max(1, Math.floor(prices.length / 60));
    const result = { prices: prices.filter((_, i) => i % step === 0 || i === prices.length - 1) };

    cache[cacheKey] = { ts: now, data: result };
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
