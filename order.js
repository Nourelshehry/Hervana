document.addEventListener("DOMContentLoaded", () => {
  const summary = document.getElementById("order-summary");
  const totalElem = document.getElementById("order-total");
  const form = document.getElementById("order-form");
  const thankYou = document.getElementById("thank-you");
  const backBtn = document.getElementById("thank-back-btn");

  let total = 0;
  let shippingCost = 0;

  // ----------- User ID Management -----------
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

  // ----------- Display Cart Summary -----------
  if (cart.length === 0) {
    summary.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - EGP ${item.price} ×${item.quantity}`;
      summary.appendChild(li);
      total += (parseFloat(item.price) || 0) * (item.quantity || 1);
    });
  }

  totalElem.textContent = `Total: ${total} EGP`;

  // ----------- Shipping Selection -----------
  const shippingOptions = document.querySelectorAll(".shipping-option");
  shippingOptions.forEach(option => {
    option.addEventListener("click", () => {
      shippingOptions.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");
      shippingCost = parseFloat(option.dataset.price) || 0;
      totalElem.textContent = `Total: ${total} EGP + ${shippingCost} EGP (Shipping)`;
    });
  });

  // ----------- Form Submission -----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Collect data
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const finalTotal = total + (shippingCost || 0);

    // Validate required fields
    if (!name || !phone || !email || !address) {
      alert("Please fill in all fields.");
      return;
    }

    // Prepare cart items for backend
    const formattedItems = cart.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    try {
      // ---------- 1) Send order to backend ----------
      const orderResponse = await fetch("http://127.0.0.1:3000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: formattedItems,
          userDetails: { name, phone, email, address },
          total: finalTotal
        })
      });

      const orderResult = await orderResponse.json();
      console.log("Checkout Result:", orderResult);

      if (!orderResult.success) {
        alert("⚠️ " + orderResult.message);
        return;
      }

      // ---------- 2) Send confirmation email ----------
      await fetch("http://127.0.0.1:3000/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          items: cart,
          total: finalTotal
        })
      });

    } catch (err) {
      console.error("❌ Checkout/Email Error:", err);
      alert("An error occurred. Please try again.");
      return;
    }

    // ---------- 3) Clear cart & show Thank You ----------
    localStorage.removeItem(`cart_${userId}`);
    form.style.display = "none";
    document.querySelector("header").style.display = "none";
    document.querySelector("footer").style.display = "none";
    thankYou.classList.add("show");
  });

  // ----------- Back Button -----------
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});
