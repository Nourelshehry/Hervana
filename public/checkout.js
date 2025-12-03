// checkout.js
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("order-form");
  const orderSummary = document.getElementById("order-summary");
  const thankYou = document.getElementById("thank-you");
  const thankClose = document.getElementById("thank-close");

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
  function loadCart() {
    return JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
  }

  // حفظ الأوردرات الخاصة بالمستخدم
  function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem(`orders_${userId}`)) || [];
    orders.push(order);
    localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
  }

  const cart = loadCart();

  // عرض ملخص الأوردر
  if (orderSummary && cart.length > 0) {
    let total = 0;
    orderSummary.innerHTML = "";
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.textContent = `${item.name} x ${item.quantity} = ${item.price * item.quantity} EGP`;
      orderSummary.appendChild(div);
    });
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total: ${total} EGP</strong>`;
    orderSummary.appendChild(totalDiv);
  }

  // عند إرسال الأوردر
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(orderForm);
      const orderData = Object.fromEntries(formData.entries());

      const order = {
        id: "order_" + Date.now(),
        userId: userId,
        items: cart,
        customer: orderData,
        date: new Date().toLocaleString(),
      };

      // حفظ الأوردر
      saveOrder(order);

      // تفريغ الكارت بعد الأوردر
      localStorage.removeItem(`cart_${userId}`);

      // إظهار رسالة الشكر
      if (thankYou) thankYou.classList.add("show");
    });
  }

  // غلق رسالة الشكر
  if (thankClose) {
    thankClose.addEventListener("click", () => {
      if (thankYou) thankYou.classList.remove("show");
      window.location.href = "index.html"; // رجوع للهوم
    });
  }
});
