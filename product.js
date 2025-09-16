document.addEventListener("DOMContentLoaded", async () => {
  const productId = parseInt(new URLSearchParams(window.location.search).get("id"));
  const productNameEl = document.getElementById("product-name");
  const productDescEl = document.getElementById("product-description");
  const productPriceEl = document.getElementById("product-price");
  const addToCartBtn = document.getElementById("add-to-cart");
  const sliderContainer = document.getElementById("slider");
  const sliderDots = document.getElementById("slider-dots");

  if (!productId) {
    document.querySelector(".product-page").innerHTML = "<p>❌ Product not found.</p>";
    return;
  }

  try {
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/refs/heads/master/products.json");
    const products = await response.json();
<<<<<<< HEAD
    const product = products.find(p => p.id === productId);

    if (!product) {
      document.querySelector(".product-page").innerHTML = "<p>❌ Product not found.</p>";
      return;
=======

    // ✅ جلب المخزون المحدث من localStorage
    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};

    // ✅ تحويل productId لرقم لأن الـ JSON عندك بالأرقام
  //  const product = products.find(p => p.id === parseInt(productId));
//
//    if (!product) {
//      productContainer.innerHTML = "<p>❌ Product not found.</p>";
  //    return;
>>>>>>> ac9228b89c85f93c4eb6e9a601ad73e38728a217
    }

    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};
    const currentStock = stockData[product.id] ?? product.stock;

    // Populate product info
    productNameEl.textContent = product.name;
    productDescEl.textContent = product.description;
    productPriceEl.textContent = `EGP ${product.price}`;
    addToCartBtn.disabled = currentStock <= 0;
    addToCartBtn.textContent = currentStock > 0 ? "Add to Cart" : "Out of Stock";

    // Image slider
    product.images.forEach((img, i) => {
      const imgEl = document.createElement("img");
      imgEl.src = img;
      imgEl.alt = product.name;
      sliderContainer.appendChild(imgEl);

      const dot = document.createElement("button");
      dot.classList.add(i === 0 ? "active" : "");
      sliderDots.appendChild(dot);
    });

    let currentSlide = 0;
    const slides = sliderContainer.querySelectorAll("img");
    const dots = sliderDots.querySelectorAll("button");

    function showSlide(index) {
      slides.forEach((s, i) => s.style.display = i === index ? "block" : "none");
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
      currentSlide = index;
    }

    showSlide(0);

    sliderDots.addEventListener("click", e => {
      const dotIndex = Array.from(sliderDots.children).indexOf(e.target);
      if (dotIndex >= 0) showSlide(dotIndex);
    });

    document.querySelector(".next").addEventListener("click", () => showSlide((currentSlide + 1) % slides.length));
    document.querySelector(".prev").addEventListener("click", () => showSlide((currentSlide - 1 + slides.length) % slides.length));

    // Add to Cart
    addToCartBtn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity < currentStock) existing.quantity++;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, stock: currentStock });
      }
      localStorage.setItem("cart", JSON.stringify(cart));

      // Show message
      const cartMessage = document.getElementById("cart-message");
      cartMessage.style.display = "block";
      setTimeout(() => cartMessage.style.display = "none", 2000);

      // Update cart count
      const cartCount = document.getElementById("cart-count");
      const totalCart = cart.reduce((acc, item) => acc + item.quantity, 0);
      cartCount.textContent = totalCart;
      cartCount.style.display = totalCart > 0 ? "inline-block" : "none";
    });

  } catch (error) {
    console.error("Error loading product:", error);
    document.querySelector(".product-page").innerHTML = "<p>⚠️ Error loading product data.</p>";
  }
});
