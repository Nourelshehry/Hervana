console.log("✅ checkout.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("order-form");
  const orderSummary = document.getElementById("order-summary");
  const thankYou = document.getElementById("thank-you");
  const thankClose = document.getElementById("thank-close");

  /* =========================
     User
  ========================= */
  function getUserId() {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = "user_" + Date.now();
      localStorage.setItem("userId", id);
    }
    return id;
  }

  const userId = getUserId();
  const cartKey = `cart_${userId}`;

  function loadCart() {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  }

  function clearCart() {
    localStorage.removeItem(cartKey);
  }

  /* =========================
     Render order summary
  ========================= */
  const cart = loadCart();

  if (orderSummary && cart.length) {
    let total = 0;
    orderSummary.innerHTML = "";

    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.textContent = `${item.name} × ${item.quantity} = ${item.price * item.quantity} EGP`;
      orderSummary.appendChild(div);
    });

    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total: ${total} EGP</strong>`;
    orderSummary.appendChild(totalDiv);
  }

  /* =========================
     Submit Order
  ========================= */
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!cart.length) {
        alert("Cart is empty");
        return;
      }

      const formData = new FormData(orderForm);
      const customer = Object.fromEntries(formData.entries());

      const orderPayload = {
        userId,
        customer,
        items: cart,
      };

      try {
        const res = await fetch(
          "https://hervanastore.nourthranduil.workers.dev/order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
          }
        );

        const result = await res.json();

        if (!result.success) {
          alert(result.message || "Order failed");
          return;
        }

        // ✅ نجح → نفرغ الكارت
        clearCart();

        // ✅ نظهر Thank you
        if (thankYou) thankYou.classList.add("show");

      } catch (err) {
        console.error("❌ checkout error:", err);
        alert("Network error, try again");
      }
    });
  }

  /* =========================
     Close Thank You
  ========================= */
  if (thankClose) {
    thankClose.addEventListener("click", () => {
      if (thankYou) thankYou.classList.remove("show");
      window.location.href = "index.html";
    });
  }
});
