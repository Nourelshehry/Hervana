// serverless.js

// ===============================
// Helpers
// ===============================
async function queryDB(env, sql, bindings = []) {
  const res = await env.DB.prepare(sql).bind(...bindings).all();
  return res.results;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });

// ===============================
// Workers Fetch Handler
// ===============================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // ===================================================
    // (0) Handle CORS Preflight (OPTIONS)
    // ===================================================
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // ===================================================
    // (1) محاولة تقديم ملفات الاستاتيك من public أولا
    // ===================================================
    try {
      const staticResponse = await env.ASSETS.fetch(request);
      if (staticResponse.status !== 404) {
        return staticResponse;
      }
    } catch (err) {
      // تجاهل الخطأ ونكمل للـ API
    }

    // ===================================================
    // (2) API ROUTES (كودك الأصلي بالكامل كما هو)
    // ===================================================

    // ------------------------------
    // GET /products
    // ------------------------------
    if (url.pathname === "/products" && method === "GET") {
      const products = await queryDB(env, "SELECT * FROM products");
      return json(products);
    }

    // ------------------------------
    // GET /product/:id
    // ------------------------------
    if (url.pathname.startsWith("/product/") && method === "GET") {
      const id = parseInt(url.pathname.split("/")[2]);
      const products = await queryDB(env, "SELECT * FROM products WHERE id = ?", [id]);

      if (!products.length) {
        return json({ success: false, message: "Product not found" }, 404);
      }

      return json({ success: true, product: products[0] });
    }

    // ------------------------------
    // POST /checkout
    // ------------------------------
    if (url.pathname === "/checkout" && method === "POST") {
      const body = await request.json();
      const { items, userDetails, total } = body;

      // check stock
      for (const item of items) {
        const prod = await queryDB(env, "SELECT * FROM products WHERE id = ?", [item.id]);

        if (!prod.length) {
          return json({ success: false, message: "Product not found" }, 404);
        }

        if (prod[0].stock < item.quantity) {
          return json(
            { success: false, message: `Not enough stock for ${prod[0].name}` },
            400
          );
        }

        await env.DB.prepare(
          "UPDATE products SET stock = stock - ? WHERE id = ?"
        ).bind(item.quantity, item.id).run();
      }

      // save order
      const orderId = "order_" + Date.now();

      await env.DB.prepare(
        "INSERT INTO orders (id, date, items, userDetails, total) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(
          orderId,
          new Date().toISOString(),
          JSON.stringify(items),
          JSON.stringify(userDetails),
          total
        )
        .run();

      return json({ success: true, message: "Order processed", orderId });
    }

    // ------------------------------
    // POST /restock/:id
    // ------------------------------
    if (url.pathname.startsWith("/restock/") && method === "POST") {
      const id = parseInt(url.pathname.split("/")[2]);
      const body = await request.json();
      const { amount } = body;

      if (!Number.isInteger(amount)) {
        return json({ success: false, message: "Invalid amount" }, 400);
      }

      const prod = await queryDB(env, "SELECT * FROM products WHERE id = ?", [id]);
      if (!prod.length) {
        return json({ success: false, message: "Product not found" }, 404);
      }

      await env.DB.prepare(
        "UPDATE products SET stock = stock + ? WHERE id = ?"
      ).bind(amount, id).run();

      return json({
        success: true,
        message: "Product restocked",
        product: { ...prod[0], stock: prod[0].stock + amount }
      });
    }

    // ------------------------------
    // fallback response
    // ------------------------------
    return json({ message: "Not found" }, 404);
  }
};
