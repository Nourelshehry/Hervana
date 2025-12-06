import { D1 } from '@cloudflare/d1'; // افترض ان D1 متوصل
const RESEND_API_KEY = YOUR_RESEND_API_KEY;

// Helpers
async function queryDB(sql, bindings = []) {
  const res = await D1.prepare(sql).bind(...bindings).all();
  return res.results;
}

// ===============================
// 1) Send Confirmation Email
// ===============================
async function sendConfirmationEmail({ email, name, items, total }) {
  const itemsHtml = items.map(item => `
    <li style="margin-bottom: 15px; list-style: none;">
      <strong>${item.name}</strong><br/>
      Quantity: ${item.quantity}<br/>
      Price: ${item.price} EGP
    </li>`).join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "hervanacontact@gmail.com",
      to: email,
      subject: "Order Confirmation",
      html: `
        <h2>Thank you for your order, ${name}!</h2>
        <p>Here are your order details:</p>
        <ul style="padding:0;">${itemsHtml}</ul>
        <p><strong>Total:</strong> ${total} EGP</p>
        <p>Your order will be delivered within <strong>3-5 business days</strong>.</p>
      `
    })
  });
}

// ===============================
// 2) Handlers
// ===============================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // GET /products
    if (url.pathname === "/products" && method === "GET") {
      const products = await queryDB("SELECT * FROM products");
      return new Response(JSON.stringify(products), { status: 200 });
    }

    // GET /product/:id
    if (url.pathname.startsWith("/product/") && method === "GET") {
      const id = parseInt(url.pathname.split("/")[2]);
      const products = await queryDB("SELECT * FROM products WHERE id = ?", [id]);
      if (!products.length) return new Response(JSON.stringify({ success:false, message:"Product not found" }), {status:404});
      return new Response(JSON.stringify({ success:true, product: products[0] }), { status: 200 });
    }

    // POST /checkout
    if (url.pathname === "/checkout" && method === "POST") {
      const body = await request.json();
      const { items, userDetails, total } = body;

      // Check stock and deduct
      for (const item of items) {
        const prod = await queryDB("SELECT * FROM products WHERE id = ?", [item.id]);
        if (!prod.length) return new Response(JSON.stringify({ success:false, message:"Product not found" }), {status:404});
        if (prod[0].stock < item.quantity)
          return new Response(JSON.stringify({ success:false, message:`Not enough stock for ${prod[0].name}` }), {status:400});
        await D1.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").bind(item.quantity, item.id).run();
      }

      // Save order
      const orderId = "order_" + Date.now();
      await D1.prepare("INSERT INTO orders (id, date, items, userDetails, total) VALUES (?, ?, ?, ?, ?)")
        .bind(orderId, new Date().toISOString(), JSON.stringify(items), JSON.stringify(userDetails), total)
        .run();

      // Send email
      await sendConfirmationEmail({ email: userDetails.email, name: userDetails.name, items, total });

      return new Response(JSON.stringify({ success:true, message:"Order processed", orderId }), { status: 200 });
    }

    return new Response("Not found", { status: 404 });
  }
};
