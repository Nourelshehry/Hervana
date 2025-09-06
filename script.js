// CART functionality
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartClose = document.getElementById("cart-close");

cartBtn.addEventListener("click", () => {
  cartSidebar.style.transform = "translateX(0)";
});

cartClose.addEventListener("click", () => {
  cartSidebar.style.transform = "translateX(100%)";
});

// SLIDER functionality
let currentSlide = 0;
const slides = document.querySelectorAll("#hero-slider .slide");
const prevBtn = document.querySelector("#hero-slider .prev");
const nextBtn = document.querySelector("#hero-slider .next");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

prevBtn.addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

nextBtn.addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

// Auto slide every 5 seconds
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);

// ADD TO CART functionality (basic)
const addToCartButtons = document.querySelectorAll(".add-to-cart");
const cartItems = document.getElementById("cart-items");

addToCartButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    const product = e.target.closest(".product");
    const title = product.querySelector("h3").textContent;
    const item = document.createElement("p");
    item.textContent = title;
    cartItems.appendChild(item);
    cartSidebar.style.transform = "translateX(0)";
  });
});
