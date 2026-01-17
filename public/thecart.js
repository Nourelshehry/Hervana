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
   PRODUCTS CACHE (NEW)
========================= */
let PRODUCTS_CACHE = null;

async function getProducts() {
  if (PRODUCTS_CACHE) return PRODUCTS_CACHE;

  const res = await fetch(
    "https://hervanastore.nourthranduil.workers.dev/api/products"
  );
  PRODUCTS_CACHE = await res.json();
  return PRODUCTS_CACHE;
}

/* =========================
   Storage helpers
========================= */
function loadCart() {
  return JSON.parse(localStorage.getItem(window.cartKey)) || [];
}

function saveCart(cart) {
  localStorage.setItem(window.cartKey, JSON.stringify(cart));
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

  console.log("ADD", id, name, price);

  if (!Number.isFinite(id) || !name || !Number.isFinite(price) || price <= 0) {
    showCartMessage("❌ Invalid product");
    return;
  }

  try {
    const products = await getProducts();
    console.log("PRODUCTS", products);

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
    console.error("ADD ERROR", err);
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

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = `Total: ${total} EGP`;

  updateCartCount();

  const giftBox = document.querySelector(".cart-gifts");
  if (giftBox) giftBox.style.display = cart.length ? "block" : "none";
}

/* =========================
   Gift Suggestions
========================= */
async function renderGiftSuggestionsInCart() {
  const container = document.getElementById("cart-gift-list");
  if (!container) return;

  container.innerHTML = "";

  try {
    const products = await getProducts();

   const gifts = products.filter(
  p =>
    p.category &&
    p.category.toLowerCase() === "gift" &&
    Number(p.stock) > 0
);


    if (!gifts.length) return;

    const selected = gifts
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    selected.forEach(product => {
      let images = [];
      try {
        images = JSON.parse(product.images || "[]");
      } catch {}

      const img = images[0] || "/images/placeholder.png";
      const isOnSale = Number(product.on_sale) === 1;

      const div = document.createElement("div");
      div.className = "cart-gift-item";
      div.style.cursor = "pointer";

      div.innerHTML = `
        <img src="${img}">
        <div>${product.name}</div>
        <strong>
          ${
            isOnSale
              ? `<span class="old-price">${product.price} EGP</span>
                 <span class="sale-price">${product.sale_price} EGP</span>`
              : `${product.price} EGP`
          }
        </strong>
        <button
          class="add-to-cart"
          data-id="${product.id}"
          data-name="${product.name}"
          data-price="${isOnSale ? product.sale_price : product.price}">
          + Add
        </button>
      `;

      div.addEventListener("click", e => {
        if (e.target.closest(".add-to-cart")) return;
        window.location.href = `product.html?id=${product.id}`;
      });

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Gift cart error:", err);
  }
}

/* =========================
   Cart Count
========================= */
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

  cartBtn?.addEventListener("click", () => {
    cartSidebar.classList.add("active");
    document.body.classList.add("cart-open");
  });

  closeCart?.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
    document.body.classList.remove("cart-open");
  });

  // ✅ SINGLE addToCart HANDLER
  document.body.addEventListener("click", e => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    e.stopPropagation();
    addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
  });

  cartItems?.addEventListener("click", async e => {
    const idx = Number(e.target.dataset.index);
    if (Number.isNaN(idx)) return;

    let cart = loadCart();
    const item = cart[idx];
    if (!item) return;

    if (e.target.classList.contains("increase")) {
      const products = await getProducts();
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
  renderGiftSuggestionsInCart();
  updateCartCount();
});
