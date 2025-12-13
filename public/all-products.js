document.addEventListener("DOMContentLoaded", async () => {
const productsContainer = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");

  let products = [];

  try {
    const response = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );

    products = await response.json();
    console.log("Loaded products:", products); // 👈 للتأكد

    renderProducts();
  } catch (err) {
    console.error(err);
    productsContainer.innerHTML = "<p>⚠️ Failed to load products</p>";
  }

  function renderProducts(search = "", category = "all") {
    productsContainer.innerHTML = "";

    const searchLower = search.toLowerCase();

    products.forEach(product => {
      const productCategory = (product.category || "").toLowerCase();

      const matchesText =
        product.name.toLowerCase().includes(searchLower) ||
        (product.description || "").toLowerCase().includes(searchLower);

      const matchesCategory =
        category === "all" ||
        productCategory === category.toLowerCase();

      if (!matchesText || !matchesCategory) return;

      const stock = Number(product.stock) || 0;

      // ===============================
      // Image (first only)
      // ===============================
      let image = "default.jpg";

      try {
        if (Array.isArray(product.images) && product.images.length > 0) {
          image = product.images[0];
        } else if (typeof product.images === "string") {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed) && parsed.length > 0) {
            image = parsed[0];
          }
        }
      } catch (e) {
        console.warn("Image parse error", e);
      }

      const imageURL = image.startsWith("http")
        ? image
        : `https://hervana.pages.dev/public/${image}`;

      // ===============================
      // Product layout (NO CARDS)
      // ===============================
      const item = document.createElement("div");
      item.className = "product-item";

      item.innerHTML = `
        <img
          src="${imageURL}"
          alt="${product.name}"
          class="product-thumb"
          loading="lazy"
        />

        <div class="product-info">
          <h3>${product.name}</h3>
          <div class="price">EGP ${product.price}</div>

          <div class="stock ${stock > 0 ? "in-stock" : "out-of-stock"}">
            ${stock > 0 ? `In Stock: ${stock}` : "Out of Stock"}
          </div>

          <div class="product-actions">
            ${
              stock > 0
                ? `<button
                    class="add-to-cart"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}">
                    Add to Cart
                  </button>`
                : `<button disabled>Out of Stock</button>`
            }

            <a href="product.html?id=${product.id}">View</a>
          </div>
        </div>
      `;

      productsContainer.appendChild(item);
    });

    attachCartListeners();
  }

  function attachCartListeners() {
    document.querySelectorAll(".add-to-cart").forEach(btn => {
      btn.onclick = () => {
        addToCart({
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: btn.dataset.price
        });
      };
    });
  }

  function addToCart(product) {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Date.now();
      localStorage.setItem("userId", userId);
    }

    const cartKey = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

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

  // ===============================
  // Filters
  // ===============================
  searchInput?.addEventListener("input", () => {
    renderProducts(searchInput.value, categorySelect.value);
  });

  categorySelect?.addEventListener("change", () => {
    renderProducts(searchInput.value, categorySelect.value);
  });
});
