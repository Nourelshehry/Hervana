<<<<<<< HEAD
// cart.js (final, corrected)
=======
// cart.js
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217

document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  // ✅ جلب الكارت من localStorage
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

  // 🔹 عرض محتوى الكارت
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

    // تحديث عداد الكارت
    if (cartCount) {
      cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
    }

<<<<<<< HEAD
=======
    // تحديث localStorage
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // 🔹 إضافة منتج للكارت
<<<<<<< HEAD
  function addToCart(productId, productName, price, stock) {
    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      if (existing.quantity < stock) existing.quantity++;
    } else {
      cart.push({ id: productId, name: productName, price: parseFloat(price), quantity: 1 });
=======
  function addToCart(id, productName, price, stock) {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      if (existing.quantity < stock) {
        existing.quantity++;
      } else {
        alert("❌ لا يمكن إضافة أكثر من الكمية المتاحة في المخزون.");
      }
    } else {
      cart.push({ id, name: productName, price: parseFloat(price), quantity: 1, stock });
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217
    }
    renderCart();
    showCartMessage();
  }

  // 🔹 التحكم في الكمية
  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      if (e.target.classList.contains("increase")) {
        const index = e.target.dataset.index;
<<<<<<< HEAD
        if (cart[index].quantity < (cart[index].stock ?? Infinity)) cart[index].quantity++;
=======
        if (cart[index].quantity < cart[index].stock) {
          cart[index].quantity++;
        } else {
          alert("❌ وصلت للحد الأقصى من المخزون.");
        }
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217
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
<<<<<<< HEAD
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      const stock = parseInt(btn.dataset.stock) || Infinity;
=======
      const id = parseInt(btn.getAttribute("data-id")); // ✅ ربط الـ id
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      const stock = parseInt(btn.getAttribute("data-stock")) || 99; // fallback لو مفيش stock
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217
      addToCart(id, name, price, stock);
    });
  });

  // 🔹 رسالة "تمت الإضافة للكارت"
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
