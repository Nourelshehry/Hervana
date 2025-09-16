//all-products.js

document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

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

    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

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
          card.setAttribute("data-category", product.category || "general");

          card.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}"/>
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
