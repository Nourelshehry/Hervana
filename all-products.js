document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("category");
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  
  // Menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }
  // فلترة المنتجات
  function filterProducts() {
    const category = categorySelect.value.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    products.forEach((product) => {
      const productCategory = product.getAttribute("data-category").toLowerCase();
      const productName = product.getAttribute("data-name").toLowerCase();

      if (
        (category === "all" || category === productCategory) &&
        productName.includes(searchTerm)
      ) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  }

  if (categorySelect) categorySelect.addEventListener("change", filterProducts);
  if (searchInput) searchInput.addEventListener("input", filterProducts);

  // ==================== الكارت ====================
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartMessage = document.getElementById("cart-message");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // فتح و قفل الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("active");
    });
  }
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // إظهار رسالة Added to Cart
  function showCartMessage() {
    if (cartMessage) {
      cartMessage.style.display = "block";
      setTimeout(() => {
        cartMessage.style.display = "none";
      }, 2000);
    }
  }

  // تحديث الكارت
  function updateCart() {
    if (!cartItems || !cartCount) return;
    cartItems.innerHTML = "";
    let totalCount = 0;

    cart.forEach((item) => {
      totalCount += item.quantity;
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price} x${item.quantity}`;
      cartItems.appendChild(li);
    });

    if (totalCount > 0) {
      cartCount.style.display = "inline-block";
      cartCount.textContent = totalCount;
    } else {
      cartCount.style.display = "none";
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // إضافة منتج للكارت
  function addToCart(productName, price) {
    const existing = cart.find((item) => item.name === productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: productName, price: parseFloat(price), quantity: 1 });
    }
    updateCart();
    showCartMessage();
  }

  // ربط زرار Add to Cart
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  updateCart();

  // Checkout redirect
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  }
});
