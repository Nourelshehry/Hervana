document.addEventListener("DOMContentLoaded", () => {
  const ordersList = document.getElementById("orders-list");

  // تحديد userId
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "guest_" + Date.now();
    localStorage.setItem("userId", userId);
  }

  // جلب الأوردرات
  let orders = JSON.parse(localStorage.getItem(`orders_user_${userId}`)) || [];

  if (orders.length === 0) {
    ordersList.innerHTML = "<p>You have no orders yet.</p>";
    return;
  }

  // عرض الأوردرات
  orders.forEach((order, index) => {
    const div = document.createElement("div");
    div.classList.add("order");

    const itemsHtml = order.items.map(item => `
      <li>${item.name} - ${item.price} EGP × ${item.quantity}</li>
    `).join("");

    div.innerHTML = `
      <h2>Order #${index + 1}</h2>
      <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ${order.total} EGP</p>
    `;

    ordersList.appendChild(div);
  });
});