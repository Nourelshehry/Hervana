// index.js — FINAL FIXED (Cloudflare Worker API only)

import {
  customerOrderEmail,
  adminOrderEmail
} from "./emailTemplates";

/* ===============================
   Helpers
================================ */

async function sendEmail(env, { to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Hervana <onboarding@resend.dev>",
      to,
      subject,
      html
    })
  });

  const data = await res.text();

  if (!res.ok) {
    console.error("RESEND ERROR:", data);
    throw new Error("Email sending failed");
  }

  return data;
}


const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
     "Access-Control-Allow-Origin": "https://hervana-store.com",
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

    // 👇 IMPORTANT: strip /api
    const pathname = url.pathname.replace(/^\/api/, "");

    /* =========================
       CORS
    ========================= */
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
     "Access-Control-Allow-Origin": "https://hervana-store.com",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    /* =========================
       API ROUTES
    ========================= */

    // GET /api/products
    if (pathname === "/products" && method === "GET") {
      const products = await queryDB(env, "SELECT * FROM products");
      return json(products);
    }

    // GET /api/product/:id
    if (pathname.startsWith("/product/") && method === "GET") {
      const id = Number(pathname.split("/")[2]);
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

    // POST /api/order
  if (pathname === "/order" && method === "POST") {
  try {
    const body = await request.json();
    const { customer, items } = body;

    if (!customer || !Array.isArray(items) || !items.length) {
      return json({ success: false, message: "Invalid order data" }, 400);
    }

    // باقي الكود زي ما هو


        let total = 0;

        for (const item of items) {
          const product = await queryDB(
            env,
            "SELECT * FROM products WHERE id = ?",
            [item.id]
          );

          if (!product.length) {
            return json({ success: false, message: "Product not found" }, 404);
          }

          if (product[0].stock < item.quantity) {
            return json(
              { success: false, message: `Not enough stock for ${product[0].name}` },
              400
            );
          }

          const unitPrice = product[0].on_sale
            ? product[0].sale_price
            : product[0].price;

          total += unitPrice * item.quantity;
        }

        // update stock
        for (const item of items) {
          await env.DB.prepare(
            "UPDATE products SET stock = stock - ? WHERE id = ?"
          )
            .bind(item.quantity, item.id)
            .run();
        }

        const orderId = "order_" + Date.now();

        await env.DB.prepare(
          `INSERT INTO orders
           (id, name, phone, email, address, items, total, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
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

        const orderData = {
          orderId,
          ...customer,
          items,
          total
        };

        await sendEmail(env, {
          to: customer.email,
          subject: "Your Hervana Order 💖",
          html: customerOrderEmail(orderData)
        });

        await sendEmail(env, {
          to: "hervanacontact@gmail.com",
          subject: "🛒 New Order - Hervana",
          html: adminOrderEmail(orderData)
        });

        return json({
          success: true,
          orderId,
          total
        });

      } catch (err) {
        console.error(err);
        return json({ success: false, error: err.message }, 500);
      }
    }

    // POST /api/restock/:id
   if (pathname.startsWith("/restock/") && method === "POST") {
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ success: false, message: "Unauthorized" }, 401);
  }

  const id = Number(pathname.split("/")[2]);
  const body = await request.json();
  const { amount } = body;


      if (!Number.isInteger(amount) || amount <= 0) {
        return json({ success: false, message: "Invalid amount" }, 400);
      }

      await env.DB.prepare(
        "UPDATE products SET stock = stock + ? WHERE id = ?"
      )
        .bind(amount, id)
        .run();

      return json({ success: true, message: "Product restocked" });
    }

    return json({ message: "API route not found" }, 404);
  }
};
