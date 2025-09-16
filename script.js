document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

  try {
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    // Fill category options dynamically
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });

    function displayProducts(filterText = "", filterCategory = "all") {
      productGrid.innerHTML = "";

      products.forEach(product => {
        let currentStock = stockData[product.id] ?? product.stock;

        if (
          product.name.toLowerCase().includes(filterText.toLowerCase()) &&
          (filterCategory === "all" || product.category === filterCategory)
        ) {
          const card = document.createElement("div");
          card.classList.add("product-card");

          card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" />
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

      // Activate Add to Cart buttons
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

    displayProducts();

    // Filters
    searchInput.addEventListener("input", () => {
      displayProducts(searchInput.value, categorySelect.value);
    });

    categorySelect.addEventListener("change", () => {
      displayProducts(searchInput.value, categorySelect.value);
    });

  } catch (error) {
    console.error("Error loading products:", error);
    productGrid.innerHTML = "<p>⚠️ Error loading products data.</p>";
  }
});

// Add to Cart function
function addToCart(id, name, price, stock) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity < stock) {
      existing.quantity++;
    } else {
      alert("⚠️ No more stock available!");
      return;
    }
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Show Added to Cart message
  const cartMessage = document.getElementById("cart-message");
  cartMessage.style.display = "block";
  setTimeout(() => {
    cartMessage.style.display = "none";
  }, 2000);

  updateCartCount();
}

// Update cart count in header
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
}

// Initial count
updateCartCount();

// Cart sidebar toggle
document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");

  if (cartBtn) cartBtn.addEventListener("click", () => cartSidebar.classList.add("active"));
  if (closeCart) closeCart.addEventListener("click", () => cartSidebar.classList.remove("active"));
});
