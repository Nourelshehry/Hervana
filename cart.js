// cart.js (استبدل الملف بالكامل بهذا المحتوى)
document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  // ==== userId management ====
  function getUserId() {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      localStorage.setItem("userId", userId);
    }
    return userId;
  }
  const userId = getUserId();
  const cartKey = () => `cart_${userId}`;

  // Load / Save
  function loadCart() {
    return JSON.parse(localStorage.getItem(cartKey())) || [];
  }
  function saveCart(cart) {
    localStorage.setItem(cartKey(), JSON.stringify(cart));
    updateCartCount();
  }

  // initial cart
  let cart = loadCart();

  // open/close cart sidebar
  if (cartBtn) cartBtn.addEventListener("click", () => cartSidebar?.classList.add("active"));
  if (closeCart) closeCart.addEventListener("click", () => cartSidebar?.classList.remove("active"));

  // Render cart in sidebar
  function renderCart() {
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
      total += item.price * item.quantity;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="cart-item">
          <span>${item.name} - ${item.price} EGP</span>
          <div class="quantity-controls">
            <button class="decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="increase" data-index="${index}">+</button>
          </div>
        </div>
      `;
      cartItems.appendChild(li);
    });
    saveCart(cart); // keep saved
  }

  // Add to cart (used by click handler below)
  function addToCart(productId, productName, price) {
    productId = parseInt(productId);
    price = parseFloat(price);
    const existing = cart.find(i => i.id === productId);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ id: productId, name: productName, price, quantity: 1 });
    }
    saveCart(cart);
    renderCart();
    showCartMessage(`${productName} added to cart`);
  }

  // Quantity controls inside sidebar
  cartItems?.addEventListener("click", (e) => {
    if (e.target.classList.contains("increase")) {
      const idx = parseInt(e.target.dataset.index);
      cart[idx].quantity++;
      renderCart();
    } else if (e.target.classList.contains("decrease")) {
      const idx = parseInt(e.target.dataset.index);
      cart[idx].quantity--;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      renderCart();
    }
  });

  // Global listener for any add-to-cart button on page
  document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const id = e.target.dataset.id;
      const name = e.target.dataset.name;
      const price = e.target.dataset.price;
      if (!id || !name || !price) {
        console.warn("add-to-cart missing data attributes:", e.target);
        return;
      }
      addToCart(id, name, price);
    }
  });

  // unified toast
  function showCartMessage(text) {
    if (!cartMessage) return;
    cartMessage.textContent = text || "Added to cart!";
    cartMessage.classList.add("show");
    setTimeout(() => cartMessage.classList.remove("show"), 2000);
  }

  // checkout button
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => window.location.href = "order.html");

  // update cart count (sum of quantities)
  function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    const cartData = loadCart();
    const qty = cartData.reduce((s, it) => s + (it.quantity || 0), 0);
    if (countEl) {
      countEl.textContent = qty;
      countEl.style.display = qty ? "inline-block" : "none";
    }
  }

  // initial render
  renderCart();
  updateCartCount();
});