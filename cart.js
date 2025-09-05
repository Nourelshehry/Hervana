document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");

  let cart = [];

  // فتح و قفل الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("active");
    });
  }

  // Function لإضافة منتج
  function addToCart(productName, price) {
    cart.push({ productName, price });
    updateCart();
  }

  // تحديث الكارت
  function updateCart() {
    cartItems.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.productName} - $${item.price}`;
      cartItems.appendChild(li);
    });
    cartCount.textContent = cart.length;
  }

  // ربط أي زرار "Add to Cart" في أي صفحة
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });
});
