document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");
  const confirmBtn = form.querySelector(".confirm-btn");

  if (!summary || !totalElem || !form) {
    console.error("❌ Order page elements missing");
    return;
  }

  /* =========================
     CONSTANTS
  ========================= */
  const SHIPPING_COST = 55;

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

    /* Shipping line */
    const shipLi = document.createElement("li");
    shipLi.textContent = `Shipping Fees - EGP ${SHIPPING_COST}`;
    summary.appendChild(shipLi);

    updateTotal();
  }

  function updateTotal() {
    totalElem.textContent =
      `Total: ${baseTotal + SHIPPING_COST} EGP`;
  }

  renderSummary();

  /* ===============================
     Governorate → Area Dropdown
  ================================ */
  const governorateSelect = document.getElementById("governorate");
  const areaSelect = document.getElementById("area");
  const manualAreaGroup = document.getElementById("manual-area-group");
  const manualAreaInput = document.getElementById("manual-area");

  const areasData = {
    cairo: [
      "Nasr City",
      "New Cairo",
      "Heliopolis",
      "Maadi",
      "Downtown",
      "Other"
    ],
    giza: [
      "Dokki",
      "Mohandessin",
      "Haram",
      "Faisal",
      "Sheikh Zayed",
      "Other"
    ],
    qalyubia: [
     "Obour",
      "Benha",
      "Qalyub",
      "Shubra El Kheima",
      "Tukh",
      "Other"
    ]
  };

  governorateSelect?.addEventListener("change", () => {
    const gov = governorateSelect.value;

    areaSelect.innerHTML = `<option value="">Select Area</option>`;
    manualAreaGroup.style.display = "none";
    manualAreaInput.value = "";

    if (!gov) {
      areaSelect.disabled = true;
      return;
    }

    areasData[gov].forEach(area => {
      const option = document.createElement("option");
      option.value = area.toLowerCase();
      option.textContent = area;
      areaSelect.appendChild(option);
    });

    areaSelect.disabled = false;
  });

  areaSelect?.addEventListener("change", () => {
    if (areaSelect.value === "other") {
      manualAreaGroup.style.display = "block";
      manualAreaInput.required = true;
    } else {
      manualAreaGroup.style.display = "none";
      manualAreaInput.required = false;
    }
  });

  /* =========================
     SUBMIT ORDER
  ========================= */
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    /* 🔥 UX FIX */
    confirmBtn.classList.add("loading");
    confirmBtn.textContent = "Processing...";

    const cart = loadCart();
    if (!cart.length) {
      alert("Your cart is empty");
      isSubmitting = false;
      confirmBtn.classList.remove("loading");
      confirmBtn.textContent = "Confirm Order";
      return;
    }

    const customer = {
      name: document.getElementById("name")?.value.trim(),
      phone: document.getElementById("phone")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      governorate: governorateSelect?.value,
      area:
        areaSelect?.value === "other"
          ? manualAreaInput?.value.trim()
          : areaSelect?.value,
      address: document.getElementById("address")?.value.trim()
    };

    if (Object.values(customer).some(v => !v)) {
      alert("Please fill in all fields");
      isSubmitting = false;
      confirmBtn.classList.remove("loading");
      confirmBtn.textContent = "Confirm Order";
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
            shipping: SHIPPING_COST,
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
        confirmBtn.classList.remove("loading");
        confirmBtn.textContent = "Confirm Order";
        return;
      }

      /* SUCCESS */
      localStorage.removeItem(cartKey);
      form.style.display = "none";

      document.querySelector("header")?.remove();
      document.querySelector("footer")?.remove();

      confirmBtn.classList.remove("loading");
      confirmBtn.textContent = "Confirm Order";

      thankYou.classList.add("show");

    } catch (err) {
      console.error("❌ Order error:", err);
      alert("Network error");
      isSubmitting = false;
      confirmBtn.classList.remove("loading");
      confirmBtn.textContent = "Confirm Order";
    }
  });

  /* =========================
     BACK TO HOME
  ========================= */
  backBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
});
