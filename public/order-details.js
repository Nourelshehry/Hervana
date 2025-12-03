const API_BASE = "http://127.0.0.1:3000";

function getOrderId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadOrder() {
  const orderId = getOrderId();
  const box = document.getElementById("orderBox");

  if (!orderId) {
    box.innerHTML = "<p>Invalid order ID.</p>";
    return;
  }

  const orders = await fetch(`${API_BASE}/orders`).then(r => r.json());
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    box.innerHTML = "<p>Order not found.</p>";
    return;
  }

  let productsHtml = order.items
    .map(
      p => `
        <div class="product">
          <img src="${p.image || ''}" />
          <div>
            <strong>${p.name}</strong><br>
            Quantity: ${p.quantity}<br>
            Price: ${p.price} EGP
          </div>
        </div>
      `
    ).join("");

  box.innerHTML = `
    <h2>Order ${order.id}</h2>

    <div class="section">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.userDetails?.name}</p>
      <p><strong>Phone:</strong> ${order.userDetails?.phone}</p>
      <p><strong>Email:</strong> ${order.userDetails?.email || "-"}</p>
      <p><strong>Address:</strong> ${order.userDetails?.address}</p>
    </div>

    <div class="section">
      <h3>Products</h3>
      ${productsHtml}
    </div>

    <div class="section">
      <h3>Total</h3>
      <p><strong>${order.total} EGP</strong></p>
    </div>

    <p><em>Date: ${order.date}</em></p>
  `;
}

loadOrder();
