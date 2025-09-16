// cart.js (final, corrected)

document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // 🔹 فتح وقفل الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("active");
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // 🔹 عرض الكارت
  function renderCart() {
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="cart-item">
          <span>${item.name} - EGP ${item.price}</span>
          <div class="quantity-controls">
            <button class="decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="increase" data-index="${index}">+</button>
          </div>
        </div>
      `;
      cartItems.appendChild(li);
    });

    if (cartCount) {
      cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // 🔹 إضافة منتج للكارت
  function addToCart(productId, productName, price, stock) {
    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      if (existing.quantity < stock) existing.quantity++;
    } else {
      cart.push({ id: productId, name: productName, price: parseFloat(price), quantity: 1 });
    }
    renderCart();
    showCartMessage();
  }

  // 🔹 التحكم في الكمية
  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      if (e.target.classList.contains("increase")) {
        const index = e.target.dataset.index;
        if (cart[index].quantity < (cart[index].stock ?? Infinity)) cart[index].quantity++;
      } else if (e.target.classList.contains("decrease")) {
        const index = e.target.dataset.index;
        cart[index].quantity--;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      }
      renderCart();
    });
  }

  // 🔹 ربط أزرار Add to Cart في الصفحة
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      const stock = parseInt(btn.dataset.stock) || Infinity;
      addToCart(id, name, price, stock);
    });
  });

  // 🔹 رسالة Added to Cart
  function showCartMessage() {
    if (cartMessage) {
      cartMessage.style.display = "block";
      setTimeout(() => {
        cartMessage.style.display = "none";
      }, 2000);
    }
  }

  // 🔹 زرار Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  }

  renderCart();
});
