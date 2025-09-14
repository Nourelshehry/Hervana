document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");
  const productContainer = document.getElementById("product-container");

  if (!productId) {
    productContainer.innerHTML = "<p>❌ Product not found.</p>";
    return;
  }

  try {
    // جلب البيانات من JSON
    const response = await fetch("products.json");
    const products = await response.json();

    // البحث عن المنتج
    const product = products.find(p => p.id == productId);

    if (!product) {
      productContainer.innerHTML = "<p>❌ Product not found.</p>";
      return;
    }

    // جلب المخزون من localStorage (لو فيه تعديل)
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};
    let currentStock = stockData[product.id] ?? product.stock;

    // عرض بيانات المنتج
    productContainer.innerHTML = `
      <div class="product-details">
        <div class="image-gallery">
          <img id="main-image" src="${product.images[0]}" alt="${product.name}">
          <div class="thumbnails">
            ${product.images
              .map(
                (img, index) =>
                  `<img src="${img}" class="thumbnail ${index === 0 ? "active" : ""}" data-index="${index}">`
              )
              .join("")}
          </div>
        </div>
        <div class="info">
          <h1>${product.name}</h1>
          <p class="price">EGP ${product.price}</p>
          <p class="description">${product.description}</p>
          <p class="stock ${currentStock > 0 ? "in-stock" : "out-of-stock"}">
            ${currentStock > 0 ? `In Stock: ${currentStock}` : "Out of Stock"}
          </p>
          ${
            currentStock > 0
              ? `<button id="add-to-cart" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>`
              : `<button disabled>Out of Stock</button>`
          }
        </div>
      </div>
    `;

    // تبديل الصور
    const thumbnails = document.querySelectorAll(".thumbnail");
    const mainImage = document.getElementById("main-image");
    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        mainImage.src = thumb.src;
        thumbnails.forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
      });
    });

    // إضافة للكارت
    const addToCartBtn = document.getElementById("add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        addToCart(product.name, product.price);
      });
    }
  } catch (error) {
    console.error("Error loading product:", error);
    productContainer.innerHTML = "<p>⚠️ Error loading product data.</p>";
  }
});
fetch('products.json')
  .then(res => res.json())
  .then(products => {
      const container = document.getElementById('products-container');
      products.forEach(product => {
          const div = document.createElement('div');
          div.textContent = product.name + " - " + product.price;
          container.appendChild(div);
      });
  });
