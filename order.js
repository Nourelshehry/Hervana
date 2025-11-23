document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  let total = 0;
  let shippingCost = 0;

  function getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("userId", userId);
    }
    return userId;
  }

  const userId = getUserId();
  const cart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];

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

  const shippingOptions = document.querySelectorAll(".shipping-option");
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      shippingCost = parseFloat(option.dataset.price) || 0;
      totalElem.textContent = `Total: ${total} EGP + ${shippingCost} EGP (Shipping)`;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();

    const orderItems = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));

    const finalTotal = total + (shippingCost || 0);

    const orderData = {
      id: "order_" + Date.now(),
      userId,
      name,
      phone,
      email,
      address,
      items: orderItems,
      total: finalTotal.toFixed(2),
      date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem(`orders_${userId}`)) || [];
    orders.push(orderData);
    localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));

    try {
      const response = await fetch("http://127.0.0.1:3000/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: orderData.email,
          name: orderData.name,
          items: orderData.items,
          total: orderData.total
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Confirmation email sent via backend!");
      } else {
        console.error("❌ Email sending failed:", result.message);
      }
    } catch (err) {
      console.error("❌ Error sending email:", err);
    }

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

    localStorage.removeItem(`cart_${userId}`);
    form.style.display = "none";
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
    thankYou.classList.add("show");
  });

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});