/* ===============================
   User & Cart Key
=============================== */
function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("userId", userId);
  }
  return userId;
}

const userId = getUserId();
const cartKey = `cart_${userId}`;

/* ===============================
   DOMContentLoaded
=============================== */
document.addEventListener("DOMContentLoaded", async () => {
  const heroSlider = document.getElementById("hero-slider");
  const dotsContainer = heroSlider?.querySelector(".dots");
  const featuredGrid = document.getElementById("featured-products");

  let products = [];

  /* ===============================
     Fetch Products
  =============================== */
  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );
    if (!res.ok) throw new Error("Failed to load products");
    products = await res.json();
  } catch (err) {
    console.error(err);
    return;
  }

  /* ===============================
     HERO SLIDER (Dynamic)
  =============================== */
  if (heroSlider && dotsContainer) {
    const slidesData = products
      .filter(p => Array.isArray(p.images) && p.images.length)
      .slice(0, 5);

    let current = 0;
    heroSlider.innerHTML = ""; // clean

    slidesData.forEach((product, index) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      if (index === 0) slide.classList.add("active");

      slide.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}">
      `;

      slide.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      heroSlider.appendChild(slide);

      const dot = document.createElement("span");
      if (index === 0) dot.classList.add("active");

      dot.addEventListener("click", () => goTo(index));

      dotsContainer.appendChild(dot);
    });

    const slides = heroSlider.querySelectorAll(".slide");
    const dots = dotsContainer.querySelectorAll("span");

    function goTo(index) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = index;
      slides[current].classList.add("active");
      dots[current].classList.add("active");
    }

    setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 4000);
  }

  /* ===============================
     FEATURED PRODUCTS (Flat)
  =============================== */
  if (featuredGrid) {
    const featured = products
      .filter(p => Array.isArray(p.images) && p.images.length)
      .slice(0, 8);

    featured.forEach(product => {
      const item = document.createElement("div");
      item.className = "product-item";

      item.innerHTML = `
        <img src="${product.images[0]}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <span class="price">EGP ${product.price}</span>
        </div>
      `;

      item.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      featuredGrid.appendChild(item);
    });
  }

  updateCartCount();
});

/* ===============================
   Cart Count
=============================== */
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cartCount.style.display = cart.length ? "inline-block" : "none";
  }
}

/* ===============================
   Mobile Menu
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
});
