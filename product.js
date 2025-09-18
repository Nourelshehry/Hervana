// product.js

document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");

  try {
    const response = await fetch("products.json");
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

  showSlide(0);
}
