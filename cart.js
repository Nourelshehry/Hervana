// Robust cart.js - defensive and compatible across pages
// Replaces previous cart.js to avoid errors when some elements are missing.
// Keeps functionality: add to cart (from buttons), sidebar open/close, localStorage persistence.

document.addEventListener("DOMContentLoaded", () => {
  // Query elements (may be missing on some pages)
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartItemsList = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");
  const cartTotalEl = document.getElementById("cart-total"); // optional

  // Load cart from localStorage safely
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    console.warn("Failed to parse cart from localStorage, resetting.", e);
    cart = [];
  }

  // Helpers
  const saveCart = () => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
    updateCartUI();
  };

  const getTotalQty = () => cart.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const getTotalPrice = () => cart.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

  function addToCartItem(name, price, qty = 1) {
    if (!name) return;
    const existing = cart.find((c) => c.name === name);
    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + Number(qty || 1);
    } else {
      cart.push({ id: Date.now(), name, price: Number(price) || 0, qty: Number(qty) || 1 });
    }
    saveCart();
    showCartMessage(`${name} added to cart`);
  }

  function removeFromCart(name) {
    cart = cart.filter((c) => c.name !== name);
    saveCart();
  }

  function updateCartUI() {
    // Count badge
    if (cartCount) cartCount.innerText = getTotalQty();

    // Items list
    if (cartItemsList) {
      cartItemsList.innerHTML = "";
      if (cart.length === 0) {
        const li = document.createElement("li");
        li.className = "cart-empty";
        li.innerText = "Your cart is empty";
        cartItemsList.appendChild(li);
      } else {
        cart.forEach((it) => {
          const li = document.createElement("li");
          li.className = "cart-item";
          li.innerHTML = `
            <div class="cart-item-main">
              <span class="cart-item-name">${escapeHtml(it.name)}</span>
              <span class="cart-item-qty">x${it.qty}</span>
            </div>
            <div class="cart-item-actions">
              <span class="cart-item-price">${(Number(it.price) || 0).toFixed(2)} EGP</span>
              <button class="remove-item" data-name="${escapeHtml(it.name)}">Remove</button>
            </div>
          `;
          cartItemsList.appendChild(li);
        });
        // attach remove handlers
        cartItemsList.querySelectorAll(".remove-item").forEach((btn) => {
          btn.addEventListener("click", (ev) => {
            const name = btn.dataset.name;
            if (name) removeFromCart(name);
          });
        });
      }
    }

    // total
    if (cartTotalEl) cartTotalEl.innerText = getTotalPrice().toFixed(2);
  }

  function openCart() {
    if (cartSidebar) {
      // prefer class toggle (so CSS can manage animations), but keep inline style fallback
      cartSidebar.classList.add("open");
      cartSidebar.style.right = "0";
      updateCartUI();
    } else {
      console.warn("openCart: cartSidebar not found on this page");
    }
  }

  function closeCartFn() {
    if (cartSidebar) {
      cartSidebar.classList.remove("open");
      cartSidebar.style.right = "-400px";
    }
  }

  function showCartMessage(text) {
    if (!cartMessage) return;
    cartMessage.innerText = text;
    cartMessage.classList.add("show");
    setTimeout(() => {
      cartMessage.classList.remove("show");
    }, 1400);
  }

  // Safe event wiring (only if elements exist)
  if (cartBtn) cartBtn.addEventListener("click", (e) => { e.preventDefault(); openCart(); });
  if (closeCart) closeCart.addEventListener("click", (e) => { e.preventDefault(); closeCartFn(); });
  if (checkoutBtn) checkoutBtn.addEventListener("click", (e) => {
    // If checkout page exists, go there. Could be a form in some projects.
    window.location.href = "checkout.html";
  });

  // Add-to-cart buttons (common class used in your markup: "add-to-cart")
  document.querySelectorAll(".add-to-cart, .add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // prefer data attributes
      const name = btn.dataset.name || btn.getAttribute("data-name") || btn.closest(".product-card")?.dataset.name;
      let price = btn.dataset.price || btn.getAttribute("data-price");
      if (!price) {
        // try to parse price from nearby <p> price element
        const priceText = btn.closest(".product-card")?.querySelector("p")?.innerText || "";
        price = priceText.replace(/[^\d.]/g, "");
      }
      addToCartItem(name, Number(price) || 0, 1);
    });
  });

  // Clicking outside the sidebar should close it (optional, only if sidebar exists)
  if (cartSidebar) {
    document.addEventListener("click", (ev) => {
      if (!cartSidebar.classList.contains("open")) return;
      // if click outside of sidebar and not on cart-btn
      if (!ev.target.closest("#cart-sidebar") && !ev.target.closest("#cart-btn")) {
        closeCartFn();
      }
    });
  }

  // expose for debugging in console: _cart.addToCart("Name", 100);
  window._cart = {
    get cart() { return cart; },
    addToCart: addToCartItem,
    removeFromCart,
    openCart,
    closeCart: closeCartFn,
    saveCart,
    updateCartUI
  };

  // small helper to escape text to avoid inserting raw HTML into attributes
  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // initialize UI once
  updateCartUI();
});
