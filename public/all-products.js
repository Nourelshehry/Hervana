document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ All Products JS Loaded");

  /* ===============================
     DOM ELEMENTS
  ============================== */
  const grid = document.querySelector(".all-products-grid");
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category");

  /* ===============================
     MOBILE MENU
  ============================== */
  const menu = document.getElementById("side-menu");
  const openBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-menu");

  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener("click", () => {
      menu.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
      menu.classList.remove("active");
    });

    menu.addEventListener("click", e => {
      if (e.target.tagName === "A") {
        menu.classList.remove("active");
      }
    });
  }

  if (!grid) {
    console.error("❌ product grid not found");
    return;
  }

  /* ===============================
     URL PARAMS
  ============================== */
  const params = new URLSearchParams(window.location.search);
  const categoryFromURL = params.get("category");

  if (categoryFromURL && categorySelect) {
    categorySelect.value = categoryFromURL;
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
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
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

  /* ===============================
     FETCH PRODUCTS
  ============================== */
  async function loadProducts() {
    try {
      const res = await fetch(
        "https://hervanastore.nourthranduil.workers.dev/api/products"
      );

      if (!res.ok) throw new Error("Fetch failed");

      allProducts = await res.json();
      console.log("📦 Products:", allProducts.length);

      renderProducts(allProducts);
    } catch (err) {
      console.error("❌ Load error:", err);
      grid.innerHTML = "<p>⚠️ Failed to load products.</p>";
    }
  }

  /* ===============================
     RENDER PRODUCTS
  ============================== */
  function renderProducts(list) {
    grid.innerHTML = "";

    if (!list || !list.length) {
      grid.innerHTML = "<p>No products found.</p>";
      return;
    }

    list.forEach(product => {
      try {
        const images = normalizeImages(product.images);
        const img = getImageUrl(images[0]);

        const isOnSale = Number(product.on_sale) === 1;
        const salePercent = Number(product.sale_percent);

      const stock = Number(product.stock);
const isOutOfStock = isNaN(stock) || stock <= 0;


       const card = document.createElement("div");
card.className = "product-card";

if (isOutOfStock) {
  card.classList.add("out-of-stock");
}


        card.innerHTML = `
         ${isOnSale && salePercent && !isOutOfStock ? `
  <span class="sale-badge">-${salePercent}%</span>
` : ""}


          ${isOutOfStock ? `
            <span class="out-badge">Out of Stock</span>
          ` : ""}

<img src="${img}" alt="${product.name}" loading="lazy">

          <h3>${product.name}</h3>

          <p class="price">
            ${
              isOnSale
                ? `<span class="old-price">${product.price} EGP</span>
                   <span class="sale-price">${product.sale_price} EGP</span>`
                : `${product.price} EGP`
            }
          </p>

       <button
  class="add-to-cart ${isOutOfStock ? "out-of-stock" : ""}"
  ${isOutOfStock ? "disabled" : ""}
  data-id="${product.id}"
  data-name="${product.name}"
  data-price="${isOnSale ? product.sale_price : product.price}"
>
  ${isOutOfStock ? "Out of stock" : "Add to Cart"}
</button>

        `;

        // فتح صفحة المنتج
        card.addEventListener("click", () => {
          window.location.href =
            `product.html?id=${product.id}&category=${product.category}`;
        });

        // Add to cart
        const addBtn = card.querySelector(".add-to-cart");
        addBtn.addEventListener("click", e => {
          e.stopPropagation();
          if (isOutOfStock) return;

          if (typeof addToCart === "function") {
            addToCart(
              addBtn.dataset.id,
              addBtn.dataset.name,
              addBtn.dataset.price
            );
          }
        });

        grid.appendChild(card);
      } catch (err) {
        console.error("❌ Error rendering product:", product, err);
      }
    });
  }

  /* ===============================
     FILTERS
  ============================== */
  function applyFilters() {
    const q = searchInput?.value.trim().toLowerCase() || "";
    const cat = categorySelect?.value.toLowerCase() || "all";

    const filtered = allProducts.filter(p => {
      const matchesSearch =
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      const matchesCategory =
        cat === "all" ||
        p.category?.toLowerCase() === cat;

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

  if (categoryFromURL) {
    applyFilters();
  }
});
