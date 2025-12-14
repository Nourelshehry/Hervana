document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  try {
    const response = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );
    const products = await response.json();

    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";
      const searchLower = filterText.toLowerCase();

      products.forEach(product => {
        const matchesText =
          product.name.toLowerCase().includes(searchLower) ||
          (product.category &&
            product.category.toLowerCase().includes(searchLower)) ||
          (product.description &&
            product.description.toLowerCase().includes(searchLower));

        const matchesCategory =
          filterCategory === "all" || product.category === filterCategory;

        if (!matchesText || !matchesCategory) return;

        let firstImage = "default.jpg";
        try {
          if (Array.isArray(product.images) && product.images.length > 0) {
            firstImage = product.images[0];
          } else if (typeof product.images === "string") {
            const parsed = JSON.parse(product.images);
            if (parsed.length) firstImage = parsed[0];
          }
        } catch {}

        const imageURL = firstImage.startsWith("http")
          ? firstImage
          : `https://hervana.pages.dev/public/${firstImage}`;

        const safeName = product.name.replace(/'/g, "\\'");

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${imageURL}" alt="${safeName}">
          <h3>${safeName}</h3>
          <p>EGP ${product.price}</p>

          ${
            product.stock > 0
              ? `<button class="add-to-cart"
                   onclick="addToCart('${product.id}', '${safeName}', '${product.price}')">
                   Add to Cart
                 </button>`
              : `<button disabled>Out of Stock</button>`
          }

          <a href="product.html?id=${product.id}" class="view-btn">
            View Details
          </a>
        `;

        productGrid.appendChild(card);
      });
    }

    displayProducts();

    searchInput?.addEventListener("input", () => {
      displayProducts(searchInput.value, categorySelect?.value || "all");
    });

    categorySelect?.addEventListener("change", () => {
      displayProducts(searchInput?.value || "", categorySelect.value);
    });
  } catch (err) {
    console.error(err);
    productGrid.innerHTML = "<p>⚠️ Error loading products.</p>";
  }
});
