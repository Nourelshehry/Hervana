// product.js

document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");

  try {
const response = await fetch("http://127.0.0.1:3000/products");
const products = await response.json();
    

    const product = products.find(p => p.id == productId);
    if (!product) {
      document.querySelector(".product-details").innerHTML = "<p>Product not found.</p>";
      return;
    }

    // Fill product details
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-price").textContent = `EGP ${product.price}`;

    // Setup slider
    const slider = document.getElementById("slider");
    const dots = document.getElementById("slider-dots");

    if (product.images && product.images.length > 0) {
      product.images.forEach((img, index) => {
        const imgElem = document.createElement("img");
        imgElem.src = img;
        imgElem.classList.add("slide");
        if (index === 0) imgElem.classList.add("active");
        slider.appendChild(imgElem);

        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active");
        dots.appendChild(dot);
      });

      initSlider();
    }

    // Add-to-cart button
    const addBtn = document.querySelector(".add-to-cart");
    if (addBtn) {
      addBtn.dataset.id = product.id;
      addBtn.dataset.name = product.name;
      addBtn.dataset.price = product.price;

      addBtn.addEventListener("click", () => {
        addToCart(product);
      });
    }
  } catch (err) {
    console.error("Failed to load product:", err);
  }
});

// === Slider Logic ===
// === Slider Logic ===
function initSlider() {
  let currentIndex = 0;
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    currentIndex = index;
  }

  document.querySelector(".prev").addEventListener("click", () => {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  });

  document.querySelector(".next").addEventListener("click", () => {
    showSlide((currentIndex + 1) % slides.length);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  showSlide(0); // أول صورة تبقى ظاهرة
}


//temporary
// === Add to Cart Function ===
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
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));

  // Show "Added to cart!" message
  const msg = document.getElementById("cart-message");
  if (msg) {
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1500);
  }

  // Update cart counter
  updateCartCount(cart);
}

function updateCartCount(cart) {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById("cart-count");
  if (counter) counter.textContent = count;
}
