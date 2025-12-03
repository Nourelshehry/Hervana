//fake
//server.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//app.use(express.static(path.join(__dirname, "public")));


// ===============================
// 1) إعداد 
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: "hervanacontact@gmail.com",
    pass: "zlupfuqxktdygvhe"  // ← ضيفي الـ App Password
  }
});


app.post("/send-confirmation", async (req, res) => {

    const { email, name, items, total } = req.body;

      res.json({ success: true, message: "Email queued" });

    /*if (!email || !name || !items || !total) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }*/

  try{  // === تعديل هنا لعرض الصور مع التفاصيل ===
   const itemsHtml = items
  .map(
    (item) => `
      <li style="margin-bottom: 15px; list-style: none;">
        <strong>${item.name}</strong><br/>
        Quantity: ${item.quantity}<br/>
        Price: ${item.price} EGP
      </li>`
  )
  .join("");

    const mailOptions = {
      from: "hervanacontact@gmail.com",
      to: email,
      subject: "Order Confirmation",
      html: `
        <h2>Thank you for your order, ${name}!</h2>
        <p>Here are your order details:</p>
        <ul style="padding: 0;">${itemsHtml}</ul>
        <p><strong>Total:</strong> ${total} EGP</p>
        <p>Your order will be delivered within <strong>3-5 business days</strong>.</p>
        <p>We hope you have a great day! 😊</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// ===============================
// 2) Paths + JSON Helpers
// ===============================
const productsPath = path.join(__dirname, "database", "products.json");
const ordersPath = path.join(__dirname, "database", "orders.json");

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===============================
// 3) Get Products
// ===============================
app.get("/products", (req, res) => {
  const products = readJSON(productsPath);
  res.json(products);
});
app.get("/product/:id", (req, res) => {
  const products = readJSON(productsPath); // ✅ المسار الصحيح
  const id = parseInt(req.params.id);

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});

// GET orders (for admin)
app.get("/orders", (req, res) => {
  const orders = readJSON(ordersPath);
  res.json(orders);
});

// RESTOCK single product (manual amount)
app.post("/restock/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;
  if (!Number.isInteger(amount)) return res.status(400).json({ success:false, message:"Invalid amount" });

  const products = readJSON(productsPath);
  const prod = products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ success:false, message:"Product not found" });

  prod.stock = (prod.stock || 0) + amount;
  writeJSON(productsPath, products);
  res.json({ success:true, product:prod });
});

// Optional: restock all out-of-stock to default amount (used by admin page)
app.post("/restock-all", (req, res) => {
  const DEFAULT = 10;
  const products = readJSON(productsPath);
  let count = 0;
  products.forEach(p => { if (!p.stock || p.stock === 0) { p.stock = DEFAULT; count++; }});
  writeJSON(productsPath, products);
  res.json({ success:true, message:`${count} products restocked`});
});

// ===============================
// 4) Checkout (خصم المخزون + حفظ الأوردر)
// ===============================
app.post("/checkout", (req, res) => {
  const { items, userDetails, total } = req.body;

  let products = readJSON(productsPath);
  let orders = readJSON(ordersPath);

  // Check stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found: " + item.id });

    if (product.stock < item.quantity)
      return res.status(400).json({
        success: false,
        message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
      });
  }

  // Deduct stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    product.stock -= item.quantity;
  }

  writeJSON(productsPath, products);

  // Save order
  const newOrder = {
    id: "order_" + Date.now(),
    date: new Date().toLocaleString(),
    items,
    userDetails,
    total,
  };

  orders.push(newOrder);
  writeJSON(ordersPath, orders);

  res.json({ success: true, message: "Order processed", order: newOrder });
});

// ===============================
// 5) Restore stock
// ===============================
app.post("/restore", (req, res) => {
  const { items } = req.body;

  let products = readJSON(productsPath);

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (product) product.stock += item.quantity;
  }

  writeJSON(productsPath, products);

  res.json({ success: true, message: "Stock restored" });
});

// ===============================
// تشغيل السيرفر
// ===============================
// ===============================
// تشغيل السيرفر
// ===============================
// Static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Fallback for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
console.log("CURRENT PORT:", process.env.PORT);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
