document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");
  const productContainer = document.getElementById("product-container");

  if (!productId) {
    productContainer.innerHTML = "<p>❌ Product not found.</p>";
    return;
  }

  try {
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      productContainer.innerHTML = "<p>❌ Product not found.</p>";
      return;
    }

    let currentStock = stockData[product.id] ?? product.stock;

    productContainer.innerHTML = `
      <div class="product-detail">
        <div class="image-slider">
          ${product.images.map(img => `<img src="${img}" alt="${product.name}">`).join("")}
        </div>
        <div class="product-info">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p><strong>Price:</strong> EGP ${product.price}</p>
          <p class="stock ${currentStock > 0 ? "in-stock" : "out-of-stock"}">
            ${currentStock > 0 ? `In Stock: ${currentStock}` : "Out of Stock"}
          </p>
          ${
            currentStock > 0
              ? `<button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${currentStock}">Add to Cart</button>`
              : `<button disabled>Out of Stock</button>`
          }
        </div>
      </div>
    `;

    const addToCartBtn = document.querySelector(".add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        addToCart(product.id, product.name, product.price, currentStock);
      });
    }

  } catch (error) {
    console.error("Error loading product:", error);
    productContainer.innerHTML = "<p>⚠️ Error loading product data.</p>";
  }
});
