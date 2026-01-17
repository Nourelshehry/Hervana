/* ===============================
   CUSTOMER ORDER EMAIL
================================ */

export function customerOrderEmail(order) {
  const itemsHtml = order.items.map(i => `
<tr>
  <td style="padding:12px 0; border-bottom:1px solid #eee;">
    <img
      src="${i.image}"
      alt="${i.name}"
      width="80"
      style="border-radius:10px; display:block;"
    />
  </td>
  <td style="padding-left:12px; border-bottom:1px solid #eee;">
    <p style="margin:0; font-weight:600; font-size:15px;">
      ${i.name}
    </p>
    <p style="margin:6px 0 0; color:#777; font-size:14px;">
      Quantity: ${i.quantity}
    </p>
    <p style="margin:6px 0 0; color:#777; font-size:14px;">
      Price: ${i.price} EGP
    </p>
  </td>
</tr>
`).join("");

  return `
  <div style="background:#f9f6f4; padding:20px;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        max-width:600px;
        margin:auto;
        background:#ffffff;
        border-radius:14px;
        padding:24px;
        font-family:Arial, Helvetica, sans-serif;
        color:#333;
      "
    >
      <tr>
        <td style="text-align:center;">
          <h2 style="margin:0 0 8px;">Thank you for your order 💖</h2>
          <p style="margin:0; color:#777;">Hi ${order.name}, we’re so happy you chose Hervana 🌸</p>
        </td>
      </tr>

      <tr><td style="height:20px;"></td></tr>

      <tr>
        <td>
          <p style="margin:0 0 14px;">Your order has been received successfully and is being prepared with love ✨</p>
        </td>
      </tr>

      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${itemsHtml}
          </table>
        </td>
      </tr>

      <tr><td style="height:20px;"></td></tr>

 <tr>
  <td style="text-align:right; padding-top:16px;">
    <p style="margin:4px 0;">
      <strong>Subtotal:</strong> ${order.subtotal} EGP
    </p>
    <p style="margin:4px 0;">
      <strong>Shipping:</strong> ${order.shipping} EGP
    </p>
    <p style="margin:6px 0; font-size:18px; font-weight:700;">
      Total: ${order.total} EGP
    </p>
  </td>
</tr>

      <tr><td style="height:24px;"></td></tr>

      <tr>
        <td>
          <p style="margin:0;">Delivery will take from 3 to 7 work days. Stay Tuned 🌸</p>
          <p style="margin:12px 0 0;">With love,<br/><strong>Hervana</strong> 🌸</p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

/* ===============================
   ADMIN ORDER EMAIL
================================ */

/* ===============================
   ADMIN ORDER EMAIL
================================ */

export function adminOrderEmail(order) {
  const itemsHtml = order.items
    .map(i => {
      const imageUrl =
        i.image || "https://hervana-store.com/images/placeholder.jpg";

      return `
      <tr>
        <td style="padding:6px 0;">
          <img
            src="${imageUrl}"
            alt="${i.name}"
            width="50"
            style="border-radius:6px; display:block;"
          />
          ${i.name}
        </td>
        <td align="center">${i.quantity}</td>
        <td align="right">${i.price} EGP</td>
      </tr>
      `;
    })
    .join("");

  return `
  <div style="font-family:Arial, Helvetica, sans-serif; max-width:600px;">
    <h2>🛒 New Hervana Order</h2>

 <p>
  <strong>Name:</strong> ${order.name}<br/>
  <strong>Phone:</strong> ${order.phone}<br/>
  <strong>Email:</strong> ${order.email}<br/>
  <strong>Governorate:</strong> ${order.governorate}<br/>
  <strong>Area:</strong> ${order.area}<br/>
  <strong>Address:</strong> ${order.address}
</p>


    <table
      width="100%"
      cellpadding="8"
      cellspacing="0"
      border="1"
      style="border-collapse:collapse; font-size:14px;"
    >
      <tr style="background:#f4f4f4;">
        <th align="left">Product</th>
        <th>Qty</th>
        <th align="right">Price</th>
      </tr>

      ${itemsHtml}
    </table>

    <h3 style="text-align:right;">
      Total: ${order.total} EGP
    </h3>
  </div>
  `;
}


