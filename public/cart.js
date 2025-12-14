
// cart.js — Cloudflare compatible & global
document.addEventListener("DOMContentLoaded", () => {

/* =========================
   DOM Elements
========================= */
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const closeCart = document.getElementById("close-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const cartMessage = document.getElementById("cart-message");

/* =========================
   User & Storage
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

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}

let cart = loadCart();

/* =========================
   UI helpers
========================= */
if (cartBtn && cartSidebar) {
  cartBtn.addEventListener("click", () =>
    cartSidebar.classList.add("active")
  );
}

if (closeCart && cartSidebar) {
  closeCart.addEventListener("click", () =>
    cartSidebar.classList.remove("active")
  );
}

function showCartMessage(text) {
  if (!cartMessage) return;
  cartMessage.textContent = text;
  cartMessage.classList.add("show");
  setTimeout(() => cartMessage.classList.remove("show"), 2000);
}

/* =========================
   Add to Cart
========================= */
async function addToCart(id, name, price) {
  cart = loadCart(); // ✅ مهم جدًا علشان أحدث نسخة دايمًا

  id = Number(id);
  price = Number(price);

  if (!id || !name || isNaN(price)) {
    showCartMessage("❌ Invalid product");
    return;
  }

  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );
    const products = await res.json();
    const product = products.find(p => Number(p.id) === id);

    if (!product || product.stock <= 0) {
      showCartMessage("❌ Out of stock");
      return;
    }

    const existing = cart.find(i => i.id === id);

    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        showCartMessage("❌ Not enough stock");
        return;
      }
      existing.quantity++;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1
      });
    }

    saveCart(cart);
    renderCart();
    showCartMessage("Added to cart");
  } catch (err) {
    console.error(err);
    showCartMessage("❌ Error adding to cart");
  }
}

/* =========================
   Global Add-to-cart listener
========================= */
document.body.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  addToCart(
    btn.dataset.id,
    btn.dataset.name,
    btn.dataset.price
  );
});

/* =========================
   Quantity controls
========================= */
cartItems?.addEventListener("click", async (e) => {
  const idx = Number(e.target.dataset.index);
  if (Number.isNaN(idx)) return;

  cart = loadCart();

  if (e.target.classList.contains("increase")) {
    const item = cart[idx];

    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );
    const products = await res.json();
    const product = products.find(p => Number(p.id) === item.id);

    if (item.quantity + 1 > product.stock) {
      showCartMessage("❌ Not enough stock");
      return;
    }

    item.quantity++;
  }

  if (e.target.classList.contains("decrease")) {
    cart[idx].quantity--;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  }

  saveCart(cart);
  renderCart();
});

/* =========================
   Render cart
========================= */
function renderCart() {
  cart = loadCart(); // ✅ حل المشكلة الأساسية

  if (!cartItems) return;
  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
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

  updateCartCount();
}

function updateCartCount() {
  if (!cartCount) return;
  const qty = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCount.textContent = qty;
  cartCount.style.display = qty ? "inline-block" : "none";
}

/* =========================
   Checkout
========================= */
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    window.location.href = "order.html";
  });
}

/* =========================
   Init
========================= */
renderCart();
updateCartCount();
});