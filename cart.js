// cart.js

document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartItemsList = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // تحديث شكل الكارت
  function updateCart() {
    cartItemsList.innerHTML = "";
    let totalItems = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - EGP ${item.price} × ${item.quantity}
        <button class="remove-item" data-index="${index}">Remove</button>
      `;
      cartItemsList.appendChild(li);
      totalItems += item.quantity;
    });

    cartCount.textContent = totalItems;

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // إضافة منتج للكارت
  window.addToCart = function (id, name, price, stock = 0) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
      if (existing.quantity < stock) {
        existing.quantity++;
      } else {
        alert("Not enough stock!");
        return;
      }
    } else {
      cart.push({ id, name, price, stock, quantity: 1 });
    }

    updateCart();

    // إظهار رسالة مؤقتة
    if (cartMessage) {
      cartMessage.classList.add("show");
      setTimeout(() => cartMessage.classList.remove("show"), 2000);
    }
  };

  // فتح الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("open");
    });
  }

  // قفل الكارت
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("open");
    });
  }

  // مسح عنصر من الكارت
  cartItemsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
      const index = e.target.dataset.index;
      cart.splice(index, 1);
      updateCart();
    }
  });

  // زر Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }

  updateCart();
});
