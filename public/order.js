// order.js — FINAL (Cloudflare + D1 compatible)
document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  let displayTotal = 0;
  let shippingCost = 0;
  let isSubmitting = false;

  /* =========================
     User
  ========================= */
  function getUserId() {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("userId", id);
    }
    return id;
  }

  const userId = getUserId();
  const cartKey = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  /* =========================
     Render Summary (UI only)
  ========================= */
  if (cart.length === 0) {
    summary.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - EGP ${item.price} × ${item.quantity}`;
      summary.appendChild(li);

      displayTotal +=
        (Number(item.price) || 0) * (Number(item.quantity) || 1);
    });
  }

  totalElem.textContent = `Total: ${displayTotal} EGP`;

  /* =========================
     Shipping (UI only)
  ========================= */
  const shippingOptions = document.querySelectorAll(".shipping-option");
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");

      shippingCost = Number(option.dataset.price) || 0;
      totalElem.textContent =
        `Total: ${displayTotal} EGP + ${shippingCost} EGP (Shipping)`;
    });
  });

  /* =========================
     Submit Order
  ========================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;
    form.querySelector("button[type=submit]").disabled = true;

    if (cart.length === 0) {
      alert("Your cart is empty!");
      isSubmitting = false;
      return;
    }

    const customer = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
    };

    if (Object.values(customer).some(v => !v)) {
      alert("Please fill in all fields.");
      isSubmitting = false;
      return;
    }

    const items = cart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    try {
      const WORKER_BASE = "https://hervana.nourthranduil.workers.dev";

      const res = await fetch(`${WORKER_BASE}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          customer,
          items
        })
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert("⚠️ " + (result.message || "Order failed"));
        isSubmitting = false;
        return;
      }

    } catch (err) {
      console.error("❌ Order Error:", err);
      alert("An error occurred. Please try again.");
      isSubmitting = false;
      return;
    }

    localStorage.removeItem(cartKey);
    form.style.display = "none";
    document.querySelector("header")?.style.display = "none";
    document.querySelector("footer")?.style.display = "none";
    thankYou.classList.add("show");
  });

  /* =========================
     Back to Home
  ========================= */
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
