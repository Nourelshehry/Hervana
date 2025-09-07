document.addEventListener("DOMContentLoaded", function () {
  // Menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // Hero slider
  const slides = document.querySelectorAll(".hero-slider img");
  let current = 0;
  const showSlide = (index) =>
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  const nextSlide = () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  };
  const prevSlide = () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  };
  if (slides.length > 0) {
    setInterval(nextSlide, 3000);
    document.querySelector(".next").onclick = nextSlide;
    document.querySelector(".prev").onclick = prevSlide;
    showSlide(current);
  }

  // Cart toggle
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
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

  // Cart message
  const cartMessage = document.getElementById("cart-message");
  function showCartMessage() {
    if (cartMessage) {
      cartMessage.style.display = "block";
      setTimeout(() => {
        cartMessage.style.display = "none";
      }, 2000);
    }
  }

  // Cart logic
  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCart() {
    if (!cartItems || !cartCount) return;
    cartItems.innerHTML = "";
    let totalCount = 0;

    cart.forEach((item, index) => {
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

  // Bind add-to-cart buttons
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

  // Search bar functionality
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const term = this.value.toLowerCase();
      products.forEach((p) => {
        const name = p.dataset.name.toLowerCase();
        p.style.display = name.includes(term) ? "block" : "none";
      });
    });
  }
});
