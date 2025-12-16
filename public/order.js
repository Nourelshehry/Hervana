document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  if (!summary || !totalElem || !form) {
    console.error("Order page elements missing");
    return;
  }

  let shippingCost = 0;
  let isSubmitting = false;
  let baseTotal = 0;

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

  function loadCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  }

  /* =========================
     Render Summary
  ========================= */
  function renderSummary() {
    const cart = loadCart();
    summary.innerHTML = "";
    baseTotal = 0;

    if (!cart.length) {
      summary.innerHTML = "<li>Your cart is empty.</li>";
      totalElem.textContent = "Total: 0 EGP";
      return;
    }

    cart.forEach(item => {
      const line =
        Number(item.price || 0) * Number(item.quantity || 1);
      baseTotal += line;

      const li = document.createElement("li");
      li.textContent = `${item.name} - EGP ${item.price} × ${item.quantity}`;
      summary.appendChild(li);
    });

    updateTotal();
  }

  function updateTotal() {
    totalElem.textContent =
      `Total: ${baseTotal + shippingCost} EGP`;
  }

  renderSummary();

  /* =========================
     Shipping
  ========================= */
  document.querySelectorAll(".shipping-option").forEach(option => {
    option.addEventListener("click", () => {
      document
        .querySelectorAll(".shipping-option")
        .forEach(o => o.classList.remove("selected"));

      option.classList.add("selected");
      shippingCost = Number(option.dataset.price) || 0;
      updateTotal();
    });
  });

  /* =========================
   Submit Order
========================= */
form.addEventListener("submit", async e => {
  e.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;

  const cart = loadCart();
  if (!cart.length) {
    alert("Your cart is empty");
    isSubmitting = false;
    return;
  }

  const customer = {
    name: document.getElementById("name")?.value.trim(),
    phone: document.getElementById("phone")?.value.trim(),
    email: document.getElementById("email")?.value.trim(),
    address: document.getElementById("address")?.value.trim()
  };

  if (Object.values(customer).some(v => !v)) {
    alert("Please fill in all fields");
    isSubmitting = false;
    return;
  }

  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          customer,
          items: cart.map(i => ({
            id: i.id,
            quantity: i.quantity
          }))
        })
      }
    );

    const result = await res.json();

    if (!res.ok || !result.success) {
      alert(result.message || "Order failed");
      isSubmitting = false;
      return;
    }

    // ✅ SUCCESS
    localStorage.removeItem(cartKey);

    form.style.display = "none";

    const header = document.querySelector("header");
    const footer = document.querySelector("footer");

    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";

    thankYou.classList.add("show");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2500);

  } catch (err) {
    console.error("Order error:", err);
    alert("Network error");
    isSubmitting = false;
  }
});

  /* =========================
     Back to Home
  ========================= */
  backBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
