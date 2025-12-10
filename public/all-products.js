document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  try {
    // جلب المنتجات من السيرفر
    const response = await fetch("https://hervana-production.up.railway.app/products");
    const products = await response.json();

    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";

      const searchLower = filterText.toLowerCase();

      products.forEach(product => {
        let currentStock = product.stock;

        const matchesText =
          product.name.toLowerCase().includes(searchLower) ||
          (product.category && product.category.toLowerCase().includes(searchLower)) ||
          (product.description && product.description.toLowerCase().includes(searchLower));

        const matchesCategory =
          filterCategory === "all" || product.category === filterCategory;

        if (matchesText && matchesCategory) {
          const card = document.createElement("div");
          card.classList.add("product-card");
          card.setAttribute("data-category", product.category || "general");

          // ===============================
          //  🔥 إنشاء سلايدر الصور الجديد
          // ===============================
          const imagesHTML = product.images
            .map(img => {
              const imageURL = img.startsWith("http")
                ? img
                : `/public/${img}`; // <-- أهم تعديل
              return `<img src="${imageURL}" class="slide-img">`;
            })
            .join("");

          // محتوى الـ Card بالكامل
          card.innerHTML = `
            <div class="slider">
              ${imagesHTML}
            </div>

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

      attachCartListeners();
    }

    function attachCartListeners() {
      document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const price = btn.dataset.price;

          addToCart({ id, name, price });
        });
      });
    }

    function addToCart(product) {
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = "user_" + Date.now();
        localStorage.setItem("userId", userId);
      }

      const cartKey = `cart_${userId}`;
      let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

      const existing = cart.find(item => item.id == product.id);

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: Number(product.id),
          name: product.name,
          price: Number(product.price),
          quantity: 1
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
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
