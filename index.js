// index.js — FINAL CLEAN & SAFE (Cloudflare Worker API only)

import {
  customerOrderEmail,
  adminOrderEmail
} from "./emailTemplates";

/* ===============================
   Helpers
================================ */

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://hervana-store.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}

async function queryDB(env, sql, params = []) {
  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return results;
}

async function sendEmail(env, { to, subject, html }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Hervana Orders <orders@hervana-store.com>",
        to,
        subject,
        html
      })
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("❌ RESEND ERROR:", text);
      return false;
    }

    return true;
  } catch (err) {
    console.error("❌ RESEND FETCH FAILED:", err);
    return false;
  }
}

/* ===============================
   Worker
================================ */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname.replace(/^\/api/, "");

    /* =========================
       CORS preflight
    ========================= */
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      /* =========================
         GET /api/products
      ========================= */
      if (pathname === "/products" && method === "GET") {
        const products = await queryDB(env, "SELECT * FROM products");
        return json(products);
      }

      /* =========================
         GET /api/product/:id
      ========================= */
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

      /* =========================
         POST /api/order
      ========================= */
      /* =========================
   POST /api/order — FINAL
========================= */
if (pathname === "/order" && method === "POST") {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Invalid JSON body" }, 400);
  }

  const { customer, items, shipping } = body;
  if (!customer || !Array.isArray(items) || !items.length) {
    return json({ success: false, message: "Invalid order data" }, 400);
  }

  const shippingFee = Number(shipping) || 0;
  let subtotal = 0;

  // Prepare email items
  const emailItems = [];
  const BASE_IMAGE_URL = "https://hervana-store.com/";

  for (const item of items) {
    const product = await queryDB(env, "SELECT * FROM products WHERE id = ?", [item.id]);
    if (!product.length) {
      return json({ success: false, message: `Product not found (ID: ${item.id})` }, 404);
    }

    if (product[0].stock < item.quantity) {
      return json({ success: false, message: `Not enough stock for ${product[0].name}` }, 400);
    }

    const unitPrice = product[0].on_sale ? product[0].sale_price : product[0].price;
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    // Parse images safely
    let images = [];
    try {
      images = typeof product[0].images === "string" ? JSON.parse(product[0].images) : Array.isArray(product[0].images) ? product[0].images : [];
    } catch (err) {
      console.error("⚠️ Failed to parse images for product:", product[0].name, err);
      images = [];
    }

    const imageUrl = images.length ? `${BASE_IMAGE_URL}${images[0]}` : `${BASE_IMAGE_URL}images/placeholder.jpg`;

    emailItems.push({
      name: product[0].name,
      quantity: item.quantity,
      price: unitPrice,
      image: imageUrl
    });
  }

  // Total including shipping
  const total = subtotal + shippingFee;

  // Update stock
  for (const item of items) {
    await env.DB.prepare("UPDATE products SET stock = stock - ? WHERE id = ?")
      .bind(item.quantity, item.id)
      .run();
  }

  // Insert order
  const orderId = "order_" + Date.now();
  await env.DB.prepare(
    `INSERT INTO orders
     (id, name, phone, email, address, items, total, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    orderId,
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    JSON.stringify(items),
    total,
    new Date().toISOString()
  ).run();

  const orderData = {
    orderId,
    ...customer,
    items: emailItems,
    subtotal,
    shipping: shippingFee,
    total
  };

  // Send emails (non-blocking, errors won't break the order)
  try {
    const emailResults = await Promise.allSettled([
      sendEmail(env, {
        to: customer.email,
        subject: "Your Hervana Order 💖",
        html: customerOrderEmail(orderData)
      }),
      sendEmail(env, {
        to: "hervanacontact@gmail.com",
        subject: "🛒 New Order - Hervana",
        html: adminOrderEmail(orderData)
      })
    ]);

    emailResults.forEach((res, i) => {
      if (res.status === "rejected" || res.value === false) {
        console.error(
          `📧 Email ${i === 0 ? "customer" : "admin"} failed`,
          res.reason || res.value
        );
      }
    });
  } catch (err) {
    console.error("📧 Email system crashed:", err);
  }

  return json({ success: true, orderId, subtotal, shipping: shippingFee, total });
}


        // Emails (failure won't break order)
       /* =========================
   EMAILS (NON-BLOCKING)
========================= */

      /* =========================
         POST /api/restock/:id
      ========================= */
      if (pathname.startsWith("/restock/") && method === "POST") {
        const auth = request.headers.get("authorization");

        if (auth !== `Bearer ${env.ADMIN_TOKEN}`) {
          return json({ success: false, message: "Unauthorized" }, 401);
        }

        const id = Number(pathname.split("/")[2]);

        let body;
        try {
          body = await request.json();
        } catch {
          return json({ success: false, message: "Invalid JSON body" }, 400);
        }

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
    } catch (err) {
      console.error("🔥 WORKER ERROR:", err);
      return json({ success: false, error: "Internal Server Error" }, 500);
    }
  }
};
