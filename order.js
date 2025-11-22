// order.js

// === EmailJS init (استبدلي USER ID بالـ actual one) ===
if (window.emailjs) {
  try {
    emailjs.init("7hqQN_HKaAyPHjqYu"); // 👈 استبدليها بالـ User ID بتاعك من EmailJS
  } catch (e) {
    console.warn("EmailJS init warning:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  let total = 0;
  let shippingCost = 0;

  // ========== إدارة المستخدم ==========
  function getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("userId", userId);
    }
    return userId;
  }

  const userId = getUserId();

  // تحميل الكارت الخاص بالمستخدم
  const cart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

  // === عرض تفاصيل الأوردر ===
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

  // === خيارات الشحن ===
  const shippingOptions = document.querySelectorAll(".shipping-option");
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      shippingCost = parseFloat(option.dataset.price) || 0;
      totalElem.textContent = `Total: ${total} EGP + ${shippingCost} EGP (Shipping)`;
    });
  });

  // === عند تأكيد الأوردر ===
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
      id: "order_" + Date.now(),
      userId: userId,
      name,
      phone,
      email,
      address,
      items,
      total: finalTotal.toFixed(2),
      date: new Date().toLocaleString()
    };

    // === تخزين الأوردر في localStorage لكل مستخدم ===
  let orders = JSON.parse(localStorage.getItem(`orders_user_${userId}`)) || [];
    orders.push(orderData);
    localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));

    // === إرسال إيميل بالـ EmailJS ===
    if (window.emailjs && emailjs.send) {
      emailjs.send("service_7bn78p4", "template_1k6yrj9", orderData)
        .then(() => console.log("✅ Confirmation email sent!"))
        .catch(err => console.error("❌ Failed to send email:", err));
    } else {
      console.warn("EmailJS not available — skipping send.");
    }

    // === تحديث المخزون (productStock) ===
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

    // === تصفير الكارت بعد الأوردر ===
    localStorage.removeItem(`cart_${userId}`);

    // === إظهار رسالة الشكر ===
    form.style.display = "none";
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
    thankYou.classList.add("show");
  });

  // زر العودة للهوم
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
