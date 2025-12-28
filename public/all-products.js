document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ All Products JS Loaded");

  /* ===============================
     DOM ELEMENTS
  ============================== */
const grid = document.querySelector(".all-products-grid");
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category");

  if (!grid) {
    console.error("❌ product grid not found");
    return;
  }

  /* ===============================
     STATE
  ============================== */
  let allProducts = [];

  /* ===============================
     HELPERS
  ============================== */
  function normalizeImages(images) {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        return JSON.parse(images);
      } catch {
        return [];
      }
    }
    return [];
  }

  function getImageUrl(img) {
    if (!img) return "/images/placeholder.png";
    if (img.startsWith("http")) return img;
    return `https://hervana.pages.dev/${img.replace(/^\/+/, "")}`;
  }

  function priceHTML(product) {
    if (product.on_sale) {
      return `
        <p class="price">
          <span class="old-price">${product.price} EGP</span>
          <span class="sale-price">${product.sale_price} EGP</span>
        </p>
        ${
          product.sale_percent
            ? `<span class="sale-badge">-${product.sale_percent}%</span>`
            : ""
        }
      `;
    }

    return `<p class="price">${product.price} EGP</p>`;
  }

  /* ===============================
     FETCH PRODUCTS
  ============================== */
  async function loadProducts() {
    try {
      const res = await fetch(
        "https://hervanastore.nourthranduil.workers.dev/products"
      );

      if (!res.ok) throw new Error("Fetch failed");

      allProducts = await res.json();
      renderProducts(allProducts);
    } catch (err) {
      console.error("❌ Load error:", err);
      grid.innerHTML = "<p>⚠️ Failed to load products.</p>";
    }
  }

  /* ===============================
     RENDER
  ============================== */
  function renderProducts(list) {
    grid.innerHTML = "";

    if (!list.length) {
      grid.innerHTML = "<p>No products found.</p>";
      return;
    }

    list.forEach(product => {
      const images = normalizeImages(product.images);
      const img = getImageUrl(images[0]);

      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
  ${product.on_sale ? `
    <span class="sale-badge">
      -${product.sale_percent}%
    </span>
  ` : ""}

  <img src="${img}" alt="${product.name}">

  <h3>${product.name}</h3>

  <p class="price">
    ${
      product.on_sale
        ? `<span class="old-price">${product.price} EGP</span>
           <span class="sale-price">${product.sale_price} EGP</span>`
        : `${product.price} EGP`
    }
  </p>

  <button
    class="add-to-cart"
    data-id="${product.id}"
    data-name="${product.name}"
    data-price="${product.on_sale ? product.sale_price : product.price}"
  >
    Add to Cart
  </button>
`;


      // كارت clickable
      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      // Add to cart
      const addBtn = card.querySelector(".add-to-cart");
      addBtn.addEventListener("click", e => {
        e.stopPropagation();
        addToCart(
          addBtn.dataset.id,
          addBtn.dataset.name,
          addBtn.dataset.price
        );
      });

      // View
      const viewBtn = card.querySelector(".view-btn");
      viewBtn.addEventListener("click", e => e.stopPropagation());

      grid.appendChild(card);
    });
  }

  /* ===============================
     FILTERS
  ============================== */
  function applyFilters() {
    const q = searchInput?.value.toLowerCase() || "";
    const cat = categorySelect?.value.toLowerCase() || "all";

    const filtered = allProducts.filter(p => {
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesCategory =
        cat === "all" ||
        p.category?.toLowerCase() === cat.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
  }

  searchInput?.addEventListener("input", applyFilters);
  categorySelect?.addEventListener("change", applyFilters);

  /* ===============================
     INIT
  ============================== */
  loadProducts();
});
