document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  if (!summary || !totalElem || !form) {
    console.error("❌ Order page elements missing");
    return;
  }

  let shippingCost = 0;
  let isSubmitting = false;
  let baseTotal = 0;

  /* =========================
     USER
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
     RENDER SUMMARY
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
     SHIPPING
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
     GIFT SUGGESTIONS
  ========================= */
  async function loadGiftSuggestions() {
    const container = document.getElementById("gift-suggestions");

    if (!container) {
      console.warn("⚠️ gift-suggestions container not found");
      return;
    }

    container.innerHTML = "";

    try {
      const res = await fetch(
        "https://hervanastore.nourthranduil.workers.dev/products"
      );
      const products = await res.json();

      const giftProducts = products.filter(
        p => p.category && p.category.toLowerCase() === "gift"
      );

      if (!giftProducts.length) {
        container.innerHTML = "<p>No gift suggestions available.</p>";
        return;
      }

      const selected = giftProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      selected.forEach(product => {
        let images = [];
        try {
          images = JSON.parse(product.images || "[]");
        } catch {}

        const img = images[0] || "/images/placeholder.png";

        const card = document.createElement("div");
        card.className = "gift-card";

        card.innerHTML = `
          <img src="${img}" alt="${product.name}">
          <p>${product.name}</p>
          <strong>${product.price} EGP</strong>
          <button class="add-to-cart"
            data-id="${product.id}"
            data-name="${product.name}"
            data-price="${product.price}">
            + Add
          </button>
        `;

        container.appendChild(card);
      });

      console.log("🎁 Gift suggestions loaded");

    } catch (err) {
      console.error("❌ Gift suggestion error:", err);
    }
  }

  /* =========================
     SUBMIT ORDER
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

      /* ✅ SUCCESS */
      loadGiftSuggestions();

      localStorage.removeItem(cartKey);
      form.style.display = "none";

      const header = document.querySelector("header");
      const footer = document.querySelector("footer");

      if (header) header.style.display = "none";
      if (footer) footer.style.display = "none";

      thankYou.classList.add("show");

    } catch (err) {
      console.error("❌ Order error:", err);
      alert("Network error");
      isSubmitting = false;
    }
  });

  /* =========================
     BACK TO HOME
  ========================= */
  backBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
