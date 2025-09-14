document.addEventListener("DOMContentLoaded", () => {
  const checkoutList = document.getElementById("checkout-list");
  const totalEl = document.getElementById("total");
  const completeBtn = document.getElementById("complete-btn");

  // جلب الكارت من localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCheckout() {
    checkoutList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("checkout-item");
      div.innerHTML = `
        <p>${item.name} - EGP ${item.price} × ${item.quantity}</p>
      `;
      checkoutList.appendChild(div);
      total += item.price * item.quantity;
    });

    totalEl.textContent = `Total: EGP ${total}`;
  }

  renderCheckout();

  // زرار Complete Order
  completeBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // تحديث المخزون في localStorage
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

    cart.forEach(item => {
      // خصم الكمية من المخزون
      if (stockData[item.id] !== undefined) {
        stockData[item.id] -= item.quantity;
        if (stockData[item.id] < 0) stockData[item.id] = 0;
      } else {
        // لو لسه معملناش تخزين للمنتج دا
        stockData[item.id] = item.stock - item.quantity;
      }
    });

    localStorage.setItem("productStock", JSON.stringify(stockData));

    // تفريغ الكارت
    localStorage.removeItem("cart");

    alert("✅ Order completed successfully!");
    window.location.href = "all-products.html"; // يرجع لصفحة المنتجات
  });
});
