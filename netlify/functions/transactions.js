const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function getUserId(event) {
  const authHeader = event.headers["authorization"] || event.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const userId = await getUserId(event);
  if (!userId) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const parts = event.path.split("/").filter(Boolean);
  const id = parts[parts.length - 1];
  const hasId = id && !isNaN(id);

  try {
    if (event.httpMethod === "GET") {
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .insert([{
          date:    body.date,
          btc:     body.btc,
          chf:     body.chf,
          fee:     body.fee,
          type:    body.type,
          note:    body.note || "",
          user_id: userId,
        }])
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 201, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "PUT" && hasId) {
      const body = JSON.parse(event.body);
      const { data, error } = await supabaseAdmin
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
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "DELETE" && hasId) {
      const { error } = await supabaseAdmin
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
