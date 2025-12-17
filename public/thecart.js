console.log("✅ CART CF VERSION – FINAL CLEAN –", Date.now());

/* =========================
   GLOBAL USER & CART KEY
========================= */
if (!window.cartKey) {
  const id = (() => {
    let stored = localStorage.getItem("userId");
    if (!stored) {
      stored = "user_" + Date.now();
      localStorage.setItem("userId", stored);
    }
    return stored;
  })();

  window.cartKey = `cart_${id}`;
}

/* =========================
   Storage helpers
========================= */
function loadCart() {
  return JSON.parse(localStorage.getItem(window.cartKey)) || [];
}

function saveCart(cart) {
  localStorage.setItem(window.cartKey, JSON.stringify(cart));
  updateCartCount();
}

/* =========================
   UI helpers
========================= */
function showCartMessage(text) {
  const msg = document.getElementById("cart-message");
  if (!msg) return;

  msg.textContent = text;
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 2000);
}

/* =========================
   Add To Cart (GLOBAL)
========================= */
async function addToCart(id, name, price) {
  let cart = loadCart();

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
      cart.push({ id, name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
    showCartMessage("Added to cart ❤️");
  } catch (err) {
    console.error(err);
    showCartMessage("❌ Error adding to cart");
  }
}

window.addToCart = addToCart;

/* =========================
   Render Cart
========================= */
function renderCart() {
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
  const qty = cart.reduce((s, i) => s + i.quantity, 0);

  cartCount.textContent = qty;
  cartCount.style.display = qty ? "inline-block" : "none";
}

/* =========================
   UI EVENTS
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartItems = document.getElementById("cart-items");

  cartBtn?.addEventListener("click", () =>
    cartSidebar.classList.add("active")
  );

  closeCart?.addEventListener("click", () =>
    cartSidebar.classList.remove("active")
  );

  document.body.addEventListener("click", e => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
  });

  cartItems?.addEventListener("click", async e => {
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

  checkoutBtn?.addEventListener("click", () => {
    window.location.href = "order.html";
  });

  renderCart();
  updateCartCount();
});
