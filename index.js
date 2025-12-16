// index.js — FINAL (Cloudflare Workers + Pages + D1)

/* ===============================
   Helpers
================================ */
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

/* ===============================
   Worker
================================ */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    /* =========================
       CORS
    ========================= */
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

    /* =========================
       API ROUTES (FIRST)
    ========================= */

    // GET /products
    if (url.pathname === "/products" && method === "GET") {
      const products = await queryDB(env, "SELECT * FROM products");
      return json(products);
    }

    // GET /product/:id
    if (url.pathname.startsWith("/product/") && method === "GET") {
      const id = Number(url.pathname.split("/")[2]);
      const prod = await queryDB(
        env,
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (!prod.length) {
        return json({ success: false, message: "Product not found" }, 404);
      }

      return json({ success: true, product: prod[0] });
    }

    // POST /order
    if (url.pathname === "/order" && method === "POST") {
      let body;

      try {
        body = await request.json();
      } catch {
        return json({ success: false, message: "Invalid JSON" }, 400);
      }

      const { userId, customer, items } = body;

      if (!userId || !customer || !Array.isArray(items) || !items.length) {
        return json({ success: false, message: "Invalid order data" }, 400);
      }

      let total = 0;

      try {
        // Validate stock + calculate total
        for (const item of items) {
          const product = await queryDB(
            env,
            "SELECT * FROM products WHERE id = ?",
            [item.id]
          );

          if (!product.length) {
            return json(
              { success: false, message: "Product not found" },
              404
            );
          }

          if (product[0].stock < item.quantity) {
            return json(
              {
                success: false,
                message: `Not enough stock for ${product[0].name}`
              },
              400
            );
          }

          total += product[0].price * item.quantity;
        }

        // Deduct stock
        for (const item of items) {
          await env.DB.prepare(
            "UPDATE products SET stock = stock - ? WHERE id = ?"
          )
            .bind(item.quantity, item.id)
            .run();
        }

        const orderId = "order_" + Date.now();

        // Save order (SAFE SCHEMA)
        await env.DB.prepare(`
          INSERT INTO orders
          (id, name, phone, email, address, items, total, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            orderId,
            customer.name,
            customer.phone,
            customer.email,
            customer.address,
            JSON.stringify(items),
            total,
            new Date().toISOString()
          )
          .run();

        return json({
          success: true,
          message: "Order placed successfully",
          orderId,
          total
        });

      } catch (err) {
        console.error("ORDER ERROR:", err);
        return json(
          { success: false, message: "Internal server error" },
          500
        );
      }
    }

    // POST /restock/:id
    if (url.pathname.startsWith("/restock/") && method === "POST") {
      const id = Number(url.pathname.split("/")[2]);
      const body = await request.json();
      const { amount } = body;

      if (!Number.isInteger(amount) || amount <= 0) {
        return json({ success: false, message: "Invalid amount" }, 400);
      }

      const prod = await queryDB(
        env,
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (!prod.length) {
        return json({ success: false, message: "Product not found" }, 404);
      }

      await env.DB.prepare(
        "UPDATE products SET stock = stock + ? WHERE id = ?"
      )
        .bind(amount, id)
        .run();

      return json({
        success: true,
        message: "Product restocked",
        product: {
          ...prod[0],
          stock: prod[0].stock + amount
        }
      });
    }

    /* =========================
       STATIC ASSETS (PAGES)
    ========================= */
    try {
      const staticResponse = await env.ASSETS.fetch(request);
      if (staticResponse.status !== 404) return staticResponse;
    } catch (_) {}

    /* =========================
       SPA FALLBACK
    ========================= */
    if (request.headers.get("accept")?.includes("text/html")) {
      return env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url))
      );
    }

    return json({ message: "Not found" }, 404);
  }
};
