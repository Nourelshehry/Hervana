document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");

  try {
    const response = await fetch("https://hervanastore.nourthranduil.workers.dev/products");
    const products = await response.json();

    const product = products.find(p => p.id == productId);
    if (!product) {
      document.querySelector(".product-details").innerHTML = "<p>Product not found.</p>";
      return;
    }

    // =====================
    //   Product Info
    // =====================
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-price").textContent = `EGP ${product.price}`;

    // =====================
    //   Image Slider
    // =====================
    const slider = document.getElementById("slider");
    const dotsContainer = document.getElementById("slider-dots");

    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img, index) => {
        const imgElem = document.createElement("img");
        imgElem.src = img.startsWith("http")
          ? img
          : `https://hervana.pages.dev/public/${img}`;
        imgElem.classList.add("slide");
        if (index === 0) imgElem.classList.add("active");
        slider.appendChild(imgElem);

        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);
      });

      initSlider(slider);
    }

    // =====================
    //   Add To Cart
    // =====================
    const addBtn = document.querySelector(".add-to-cart");
    if (addBtn) {
      addBtn.dataset.id = product.id;
      addBtn.dataset.name = product.name;
      addBtn.dataset.price = product.price;

      addBtn.addEventListener("click", () => addToCart(product));
    }

  } catch (err) {
    console.error("Failed to load product:", err);
  }
});


// =====================
//       Slider Logic
// =====================
function initSlider(slider) {
  let currentIndex = 0;
  const slides = slider.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    currentIndex = index;
  }

  // Buttons (desktop)
  document.querySelector(".prev")?.addEventListener("click", () => {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
    resetAutoSlide();
  });

  document.querySelector(".next")?.addEventListener("click", () => {
    showSlide((currentIndex + 1) % slides.length);
    resetAutoSlide();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      resetAutoSlide();
    });
  });

  // =====================
  //   Auto Slide
  // =====================
  let autoSlide = setInterval(() => {
    showSlide((currentIndex + 1) % slides.length);
  }, 4000);

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      showSlide((currentIndex + 1) % slides.length);
    }, 4000);
  }

  // =====================
  //   Mobile Swipe
  // =====================
  let startX = 0;

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showSlide((currentIndex + 1) % slides.length);
      } else {
        showSlide((currentIndex - 1 + slides.length) % slides.length);
      }
      resetAutoSlide();
    }
  });

  showSlide(0);
}


// =====================
//   Cart Functionality
// =====================
function addToCart(product) {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem("userId", userId);
  }

  const cartKey = `cart_${userId}`;
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));

  const msg = document.getElementById("cart-message");
  if (msg) {
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1500);
  }

  updateCartCount(cart);
}

function updateCartCount(cart) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById("cart-count");
  if (counter) counter.textContent = count;
}
