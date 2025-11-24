document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  try {
    // جلب المنتجات من السيرفر المحلي
    const response = await fetch("hervana-production.up.railway.app");
    const products = await response.json();

    // دالة العرض
    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";

      const searchLower = filterText.toLowerCase();

      products.forEach(product => {
        let currentStock = product.stock;

        // فلترة محسنة: الاسم + الكاتيجوري + الوصف
        const matchesText =
          product.name.toLowerCase().includes(searchLower) ||
          (product.category && product.category.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower));

        const matchesCategory = filterCategory === "all" || product.category === filterCategory;

        if (matchesText && matchesCategory) {
          const card = document.createElement("div");
          card.classList.add("product-card");
          card.setAttribute("data-category", product.category || "general");

          card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="product-img"/>
            <h3>${product.name}</h3>
            <p>EGP ${product.price}</p>
            <p class="stock ${currentStock > 0 ? "in-stock" : "out-of-stock"}">
              ${currentStock > 0 ? `In Stock: ${currentStock}` : "Out of Stock"}
            </p>
            ${
              currentStock > 0
                ? `<button class="add-to-cart" 
                     data-id="${product.id}" 
                     data-name="${product.name}" 
                     data-price="${product.price}">
                     Add to Cart
                   </button>`
                : `<button disabled>Out of Stock</button>`
            }
            <a href="product.html?id=${product.id}" class="view-btn">View Details</a>
          `;
          productGrid.appendChild(card);
        }
      });
      // cart.js بيسمع أوتوماتيك لأي زرار add-to-cart
    }

    // أول تحميل
    displayProducts();

    // Mobile menu toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }

    // البحث
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        displayProducts(searchInput.value, categorySelect?.value || "all");
      });
    }

    // الفلترة بالكاتيجوري
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        displayProducts(searchInput?.value || "", categorySelect.value);
      });
    }

  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = "<p>⚠️ Error loading products data.</p>";
  }
});
