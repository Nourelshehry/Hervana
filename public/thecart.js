console.log("✅ CART CF VERSION – NO RAILWAY –", Date.now());

/* =========================
   User & Storage (GLOBAL)
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

/* =========================
   UI helpers (GLOBAL)
========================= */
function showCartMessage(text) {
  const cartMessage = document.getElementById("cart-message");
  if (!cartMessage) return;
  cartMessage.textContent = text;
  cartMessage.classList.add("show");
  setTimeout(() => cartMessage.classList.remove("show"), 2000);
}

/* =========================
   Add to Cart (GLOBAL)
========================= */
async function addToCart(id, name, price) {
  console.log("🟡 addToCart called", { id, name, price });

  let cart = loadCart(); // ✅ أحدث نسخة دايمًا

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
        showCartMessage("❌ الكمية المتاحة خلصت");
        return;
      }
      existing.quantity += 1;
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

// 👈 لازم GLOBAL
window.addToCart = addToCart;

/* =========================
   Render Cart (GLOBAL)
========================= */
function renderCart() {
  console.log("🔵 renderCart called");

  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

  const cart = loadCart();
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
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const cart = loadCart();
  const qty = cart.reduce((sum, i) => sum + i.quantity, 0);

  cartCount.textContent = qty;
  cartCount.style.display = qty ? "inline-block" : "none";
}

/* =========================
   DOMContentLoaded (UI فقط)
========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 thecart.js loaded");

  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartItems = document.getElementById("cart-items");

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

  // ✅ add-to-cart (delegation)
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    console.log("🟢 add-to-cart clicked", btn.dataset);

    addToCart(
      btn.dataset.id,
      btn.dataset.name,
      btn.dataset.price
    );
  });

  // ✅ quantity controls
  cartItems?.addEventListener("click", async (e) => {
    const idx = Number(e.target.dataset.index);
    if (Number.isNaN(idx)) return;

    let cart = loadCart();
    const item = cart[idx];
    if (!item) return;

    if (e.target.classList.contains("increase")) {
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
      item.quantity--;
      if (item.quantity <= 0) cart.splice(idx, 1);
    }

    saveCart(cart);
    renderCart();
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  }

  renderCart();
  updateCartCount();
});
