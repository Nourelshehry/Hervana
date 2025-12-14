/* ===============================
   User & Keys
=============================== */
function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("userId", userId);
  }
  return userId;
}

const userId = getUserId();
const cartKey = `cart_${userId}`;

/* ===============================
   DOMContentLoaded
=============================== */
document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  if (!productGrid) return;

  /* ===============================
     Fetch products (API الموحد)
  =============================== */
  let products = [];
  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );
    products = await res.json();
  } catch (err) {
    console.error("Failed to load products:", err);
    productGrid.innerHTML = "<p>⚠️ Failed to load products.</p>";
    return;
  }

  /* ===============================
     Fill categories
  =============================== */
  if (categorySelect) {
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });
  }

  /* ===============================
     Display products
  =============================== */
  function displayProducts(filterText = "", filterCategory = "all") {
    productGrid.innerHTML = "";

    products.forEach(product => {
      const isOut = product.stock <= 0;

      if (
        product.name.toLowerCase().includes(filterText.toLowerCase()) &&
        (filterCategory === "all" || product.category === filterCategory)
      ) {
        const card = document.createElement("div");
        card.className = "product-card";

        const img =
          Array.isArray(product.images) && product.images.length
            ? product.images[0]
            : "";

        card.innerHTML = `
          <img src="${img}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>EGP ${product.price}</p>

          <p class="stock ${isOut ? "out-of-stock" : "in-stock"}">
            ${isOut ? "Out of Stock" : `In Stock: ${product.stock}`}
          </p>

          ${
            isOut
              ? `<button disabled class="out-of-stock">Out of Stock</button>`
              : `<button class="add-to-cart">Add to Cart</button>`
          }

          <a href="product.html?id=${product.id}" class="view-btn">
            View Details
          </a>
        `;

        productGrid.appendChild(card);

        /* Add to cart */
        if (!isOut) {
          const btn = card.querySelector(".add-to-cart");
          btn.addEventListener("click", () => {
            addToCart(product, btn);
          });
        }
      }
    });
  }

  displayProducts();

  /* ===============================
     Search & Filter
  =============================== */
  if (searchInput) {
    searchInput.addEventListener("input", () =>
      displayProducts(searchInput.value, categorySelect?.value || "all")
    );
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () =>
      displayProducts(searchInput?.value || "", categorySelect.value)
    );
  }

  updateCartCount();
});

/* ===============================
   Add To Cart (موحد)
=============================== */
function addToCart(product, button) {
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (product.stock <= 0) {
    if (button) {
      button.disabled = true;
      button.textContent = "Out of Stock";
      button.classList.add("out-of-stock");
    }
    return;
  }

  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    if (existing.quantity + 1 > product.stock) {
      alert("No more items in stock");
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();

  const msg = document.getElementById("cart-message");
  if (msg) {
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1500);
  }
}

/* ===============================
   Cart Count
=============================== */
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartCount.style.display = cart.length ? "inline-block" : "none";
  }
}

/* ===============================
   Mobile Menu
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
});
