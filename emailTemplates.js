export function customerOrderEmail(order) {
  const itemsHtml = order.items.map(
    i => `<li>${i.name} × ${i.quantity} — ${i.price} EGP</li>`
  ).join("");

  return `
    <div style="font-family:Arial">
      <h2>Thank you for your order 💖</h2>
      <p>Hi ${order.name},</p>

      <p>Your order has been received successfully.</p>

      <ul>
        ${itemsHtml}
      </ul>

      <h3>Total: ${order.total} EGP</h3>

      <p>We’ll contact you soon.</p>
      <p>Hervana 🌸</p>
    </div>
  `;
}

export function adminOrderEmail(order) {
  const itemsHtml = order.items.map(
    i => `<li>${i.name} × ${i.quantity}</li>`
  ).join("");

  return `
    <h2>🛒 New Order</h2>
    <p><strong>Name:</strong> ${order.name}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Address:</strong> ${order.address}</p>

    <ul>${itemsHtml}</ul>

    <h3>Total: ${order.total} EGP</h3>
  `;
}
