const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const parts = event.path.split("/").filter(Boolean);
  const id = parts[parts.length - 1];
  const hasId = id && !isNaN(id);

  try {
    if (event.httpMethod === "GET") {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const { data, error } = await supabase
        .from("transactions")
        .insert([{
          date: body.date,
          btc:  body.btc,
          chf:  body.chf,
          fee:  body.fee,
          type: body.type,
          note: body.note || "",
        }])
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "PUT" && hasId) {
      const body = JSON.parse(event.body);
      const { data, error } = await supabase
        .from("transactions")
        .update({
          date: body.date,
          btc:  body.btc,
          chf:  body.chf,
          fee:  body.fee,
          type: body.type,
          note: body.note || "",
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "DELETE" && hasId) {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
