document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  try {
    // جلب المنتجات من JSON على GitHub
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    // جلب المخزون المحدث من localStorage
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

    // عرض المنتجات
    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";

      products.forEach(product => {
        let currentStock = stockData[product.id] ?? product.stock;

        // فلترة بالبحث أو الكاتيجوري
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
                ? `<button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${currentStock}">Add to Cart</button>`
                : `<button disabled>Out of Stock</button>`
            }
            <a href="product.html?id=${product.id}" class="view-btn">View Details</a>
          `;
          productGrid.appendChild(card);
        }
      });

      // تفعيل زرار الكارت بعد العرض
      document.querySelectorAll(".add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          const name = btn.dataset.name;
          const price = parseFloat(btn.dataset.price);
          const stock = parseInt(btn.dataset.stock);
          addToCart(id, name, price, stock);
        });
      });
    }

    // أول تحميل
    displayProducts();

    // البحث
    searchInput.addEventListener("input", () => {
      displayProducts(searchInput.value, categorySelect.value);
    });

    // الفلترة بالكاتيجوري
    categorySelect.addEventListener("change", () => {
      displayProducts(searchInput.value, categorySelect.value);
    });

    // Add to Cart function
    function addToCart(id, name, price, stock) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(item => item.id === id);
      if (existing) {
        if (existing.quantity < stock) existing.quantity++;
      } else {
        cart.push({ id, name, price, quantity: 1, stock });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      showCartMessage();
      updateCartCount();
    }

    // Cart count update
    function updateCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartCount = document.getElementById("cart-count");
      if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
      }
    }

    // Show Added to Cart message
    function showCartMessage() {
      const cartMessage = document.getElementById("cart-message");
      if (cartMessage) {
        cartMessage.style.display = "block";
        setTimeout(() => cartMessage.style.display = "none", 2000);
      }
    }

    updateCartCount();

  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = "<p>⚠️ Error loading products data.</p>";
  }
});
