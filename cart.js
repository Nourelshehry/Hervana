document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  // استرجاع الكارت من localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // فتح الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("active");
    });
  }

  // قفل الكارت
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // إظهار رسالة Added to Cart
  function showCartMessage() {
    if (cartMessage) {
      cartMessage.style.display = "block";
      setTimeout(() => {
        cartMessage.style.display = "none";
      }, 2000);
    }
  }

  // تحديث الكارت
  function updateCart() {
    if (!cartItems || !cartCount) return;

    cartItems.innerHTML = "";
    let totalCount = 0;

    cart.forEach((item) => {
      totalCount += item.quantity;
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price} x${item.quantity}`;
      cartItems.appendChild(li);
    });

    if (totalCount > 0) {
      cartCount.style.display = "inline-block";
      cartCount.textContent = totalCount;
    } else {
      cartCount.style.display = "none";
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // إضافة منتج
  function addToCart(productName, price) {
    const existing = cart.find((item) => item.name === productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: productName, price: parseFloat(price), quantity: 1 });
    }
    updateCart();
    showCartMessage();
  }

  // ربط الأزرار Add to Cart
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  // زرار Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  }

  // تحميل الكارت عند فتح الصفحة
  updateCart();
});
