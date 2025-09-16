// order.js

// === EmailJS init (استبدلي USER ID بالـ actual one) ===
if (window.emailjs) {
  // if the library already loaded, init immediately;
  // otherwise emailjs will be initialised after the library script loads
  try {
    emailjs.init("YOUR_USER_ID");
  } catch (e) {
    console.warn("EmailJS init warning:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  let total = 0;
  let shippingCost = 0;

  // عرض تفاصيل الأوردر (كما كانت في النسخة الأصلية)
  if (cart.length === 0) {
    summary.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - EGP ${item.price} ×${item.quantity}`;
      summary.appendChild(li);
      total += (parseFloat(item.price) || 0) * (item.quantity || 0);
    });
  }

  totalElem.textContent = `Total: ${total} EGP`;

  // Shipping options logic (كما في النسخة الأصلية)
  const shippingOptions = document.querySelectorAll(".shipping-option");
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      shippingCost = parseFloat(option.dataset.price) || 0;
      totalElem.textContent = `Total: ${total} EGP + ${shippingCost} EGP (Shipping)`;
    });
  });

  // عند Confirm Order (نقل كامل لوجيك الإرسال هنا بدلاً من inline)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();

    const items = cart.map(item => `${item.name} ×${item.quantity} - ${item.price} EGP`).join(", ");
    const finalTotal = total + (shippingCost || 0);

    const orderData = {
      name,
      phone,
      email,
      address,
      items,
      total: finalTotal.toFixed(2)
    };

    // تخزين الأوردر في localStorage (كما في النسخة الأصلية)
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({ ...orderData, date: new Date().toLocaleString() });
    localStorage.setItem("orders", JSON.stringify(orders));

    // إرسال إيميل بالـ EmailJS (كما في النسخة الأصلية)
    // تأكدي تستبدلي service ID و template ID و user ID حسب حسابك في EmailJS
    if (window.emailjs && emailjs.send) {
      emailjs.send("service_7bn78p4", "template_3eu20q2", orderData)
        .then(() => {
          console.log("✅ Confirmation email sent!");
        })
        .catch((err) => console.error("❌ Failed to send email:", err));
    } else {
      console.warn("EmailJS not available — skipping send.");
    }

    // تحديث المخزون (productStock) بناءً على item.id
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};
    cart.forEach(item => {
      if (item.id !== undefined) {
        if (stockData[item.id] !== undefined) {
          stockData[item.id] -= item.quantity;
          if (stockData[item.id] < 0) stockData[item.id] = 0;
        } else {
          stockData[item.id] = (item.stock ?? 0) - item.quantity;
          if (stockData[item.id] < 0) stockData[item.id] = 0;
        }
      }
    });
    localStorage.setItem("productStock", JSON.stringify(stockData));

    // تصفير الكارت
    localStorage.removeItem("cart");

    // إظهار رسالة الشكر (كما في النسخة الأصلية)
    form.style.display = "none";
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
    document.getElementById("thank-you").classList.add("show");

    // زر العودة
    const backBtn = document.getElementById("thank-back-btn");
    if (backBtn) backBtn.addEventListener("click", () => window.location.href = "index.html");
  });
});
