// all-products.js (مُحدث للتكامل مع cart.js المثبت)
document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  try {
    // جلب المنتجات من JSON على GitHub
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    // جلب المخزون من localStorage (لو متخزن)
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

    // دالة العرض
    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";

      products.forEach(product => {
        let currentStock = stockData[product.id] ?? product.stock;

        // فلترة
        if (
          product.name.toLowerCase().includes(filterText.toLowerCase()) &&
          (filterCategory === "all" || product.category === filterCategory)
        ) {
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
      // ✅ مهم: مش محتاجين نعمل eventListeners هنا
      // cart.js بيسمع أوتوماتيك لأي زرار add-to-cart
    }

    // أول تحميل
    displayProducts();

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
