document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  // ===============================
  // Helpers
  // ===============================
  function getFirstImage(images) {
    try {
      if (Array.isArray(images) && images.length > 0) {
        return images[0];
      }

      if (typeof images === "string") {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.warn("Invalid images field:", images);
    }

    return "images/default.jpg";
  }

  function buildImageURL(path) {
    if (!path) return "images/default.jpg";

    // لو URL كامل
    if (path.startsWith("http")) return path;

    // Cloudflare Pages ما بيستخدمش /public في الرابط
    return `https://hervana.pages.dev/${path.replace(/^\/+/, "")}`;
  }

  // ===============================
  // Fetch Products
  // ===============================
  try {
    const response = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );

    if (!response.ok) throw new Error("Failed to load products");

    const products = await response.json();

    // ===============================
    // Render Products
    // ===============================
   function displayProducts(filterText = "", filterCategory = "all") {
  productGrid.innerHTML = "";

  const searchLower = filterText.toLowerCase();

  products.forEach(product => {
    const matchesText =
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower);

    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;

    if (!matchesText || !matchesCategory) return;

    const firstImagePath = getFirstImage(product.images);
    const imageURL = buildImageURL(firstImagePath);

    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;

    card.innerHTML = `
      <img 
        src="${imageURL}" 
        alt="${product.name}" 
        loading="lazy"
        onerror="this.src='images/default.jpg'"
      >

      <h3>${product.name}</h3>
      <p>EGP ${product.price}</p>

      ${
        product.stock > 0
          ? `<button class="add-to-cart">Add to Cart</button>`
          : `<button disabled>Out of Stock</button>`
      }

      <a href="product.html?id=${product.id}" class="view-btn">
        View Details
      </a>
    `;

    /* ===============================
       Click behaviors
    =============================== */

    // كليك على الكارت كله
    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    // زر Add to Cart
    const addBtn = card.querySelector(".add-to-cart");
    if (addBtn) {
      addBtn.addEventListener("click", e => {
        e.stopPropagation();
        addToCart(product.id, product.name, product.price);
      });
    }

    // زر View Details
    const viewBtn = card.querySelector(".view-btn");
    viewBtn.addEventListener("click", e => {
      e.stopPropagation();
    });

    productGrid.appendChild(card);
  });

  if (!productGrid.children.length) {
    productGrid.innerHTML = "<p>No products found.</p>";
  }
}


    // Initial render
    displayProducts();

    // ===============================
    // Filters
    // ===============================
    searchInput?.addEventListener("input", () => {
      displayProducts(searchInput.value, categorySelect?.value || "all");
    });

    categorySelect?.addEventListener("change", () => {
      displayProducts(searchInput?.value || "", categorySelect.value);
    });
  } catch (err) {
    console.error(err);
    productGrid.innerHTML =
      "<p>⚠️ Error loading products. Please try again later.</p>";
  }
});
