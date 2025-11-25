// cart.js (Fixed & Robust)
document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

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

  function loadCart() {
    return JSON.parse(localStorage.getItem(cartKey())) || [];
  }
  function saveCart(cart) {
    localStorage.setItem(cartKey(), JSON.stringify(cart));
    updateCartCount();
  }

  let cart = loadCart();

  if (cartBtn) cartBtn.addEventListener("click", () => cartSidebar?.classList.add("active"));
  if (closeCart) closeCart.addEventListener("click", () => cartSidebar?.classList.remove("active"));

  function showCartMessage(text) {
    if (!cartMessage) {
      console.log("Cart message:", text);
      return;
    }
    cartMessage.textContent = text || "Added to cart!";
    cartMessage.classList.add("show");
    setTimeout(() => cartMessage.classList.remove("show"), 2000);
  }

  // ---- Add to Cart (robust) ----
  async function addToCart(productId, productName, price) {
    try {
      productId = parseInt(productId);
      price = parseFloat(price);

      if (Number.isNaN(productId) || Number.isNaN(price) || !productName) {
        console.warn("addToCart called with invalid data:", productId, productName, price);
        showCartMessage("❌ Invalid product data");
        return;
      }

      // Fetch real stock from backend
      let stockData;
      try {
        const stockResponse = await fetch(`https://hervana-production.up.railway.app/product/${productId}`);
        stockData = await stockResponse.json();
      } catch (err) {
        console.error("Failed fetching product stock:", err);
        showCartMessage("❌ Couldn't check stock (network)");
        return;
      }

      if (!stockData || !stockData.success) {
        showCartMessage("❌ Product not found");
        return;
      }

      const realStock = stockData.product.stock;
      const existing = cart.find(i => i.id === productId);

      if (existing) {
        if (existing.quantity + 1 > realStock) {
          showCartMessage("❌ Not enough stock");
          return;
        }
        existing.quantity++;
      } else {
        if (realStock <= 0) {
          showCartMessage("❌ Product out of stock");
          return;
        }
        cart.push({ id: productId, name: productName, price, quantity: 1 });
      }

      saveCart(cart);
      renderCart();
      showCartMessage(`${productName} added to cart`);
    } catch (err) {
      console.error("Unexpected error in addToCart:", err);
      showCartMessage("❌ Error adding to cart");
    }
  }

  // ---- Delegated click handler for add-to-cart buttons ----
  document.body.addEventListener("click", (e) => {
    // find nearest element with class 'add-to-cart' (works if you click icon/text inside the button)
    const btn = e.target.closest && e.target.closest(".add-to-cart");
    if (!btn) return;

    // read dataset safely, allow data attributes or data-*
    const id = btn.dataset.id ?? btn.getAttribute("data-id");
    const name = btn.dataset.name ?? btn.getAttribute("data-name");
    const price = btn.dataset.price ?? btn.getAttribute("data-price");

    if (!id || !name || !price) {
      console.warn("add-to-cart missing data attributes on element:", btn);
      showCartMessage("❌ Missing product info");
      return;
    }

    // call addToCart but don't block UI; the function handles errors internally
    addToCart(id, name, price);
  });

  // ---- Modify Quantity (Increase/Decrease) with stock-check on increase ----
  cartItems?.addEventListener("click", async (e) => {
    const btn = e.target;
    const idxAttr = btn.dataset.index;
    if (typeof idxAttr === "undefined") return;
    const idx = parseInt(idxAttr);
    if (Number.isNaN(idx)) return;

    // INCREASE
    if (btn.classList.contains("increase")) {
      const item = cart[idx];
      if (!item) return;

      try {
        const stockResponse = await fetch(`https://hervana-production.up.railway.app/product/${item.id}`);
        const stockData = await stockResponse.json();
        if (!stockData || !stockData.success) {
          showCartMessage("❌ Product not found");
          return;
        }
        const realStock = stockData.product.stock;
        if (item.quantity + 1 > realStock) {
          showCartMessage("❌ Not enough stock");
          return;
        }
        item.quantity++;
        renderCart();
      } catch (err) {
        console.error("Error checking stock for increase:", err);
        showCartMessage("❌ Error checking stock");
      }
    }

    // DECREASE
    else if (btn.classList.contains("decrease")) {
      cart[idx].quantity--;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      renderCart();
    }
  });

  // ---- Render Cart ----
  function renderCart() {
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

    saveCart(cart);
  }

  // ---- Update cart bubble count ----
  function updateCartCount() {
    const countEl = document.getElementById("cart-count");
    const cartData = loadCart();
    const qty = cartData.reduce((s, it) => s + (it.quantity || 0), 0);
    if (countEl) {
      countEl.textContent = qty;
      countEl.style.display = qty ? "inline-block" : "none";
    }
  }

  if (checkoutBtn) checkoutBtn.addEventListener("click", () => window.location.href = "order.html");

  // initial render
  renderCart();
  updateCartCount();
});
