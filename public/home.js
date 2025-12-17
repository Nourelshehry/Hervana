console.log("🏠 HOME JS LOADED");

/* ===============================
   Helpers
================================ */

// لو الصورة اسم ملف فقط → نخليها URL
function getImageUrl(img) {
  if (!img) return "/images/placeholder.png";
  return img; // 👈 استخدميه زي ما جاي من السيرفر
}


/* ===============================
   DOMContentLoaded
================================ */
document.addEventListener("DOMContentLoaded", async () => {
  const heroSlider = document.getElementById("hero-slider");
  const dotsContainer = document.querySelector(".slider-dots");
  const featuredGrid = document.getElementById("featured-products");

  let products = [];

  /* ===============================
     Fetch Products
  ============================== */
  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );

    if (!res.ok) throw new Error("Failed to fetch products");

    products = await res.json();
    console.log("✅ PRODUCTS:", products);
  } catch (err) {
    console.error("❌ FETCH ERROR", err);
    return;
  }

  /* ===============================
     HERO SLIDER
  ============================== */
  if (heroSlider && dotsContainer) {
    heroSlider.innerHTML = "";
    dotsContainer.innerHTML = "";

    const slidesData = products
      .filter(p => p.image || (Array.isArray(p.images) && p.images.length))
      .slice(0, 5);

    let current = 0;

    slidesData.forEach((product, index) => {
      const imgSrc = product.image
        ? getImageUrl(product.image)
        : getImageUrl(product.images[0]);

      // slide
      const slide = document.createElement("div");
      slide.className = "slide";
      if (index === 0) slide.classList.add("active");

      slide.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
      `;

      slide.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      heroSlider.appendChild(slide);

      // dot
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
      if (slides.length > 1) {
        goTo((current + 1) % slides.length);
      }
    }, 4000);
  }

  /* ===============================
     FEATURED PRODUCTS
  ============================== */
  if (featuredGrid) {
    featuredGrid.innerHTML = "";

    const featured = products
      .filter(p => p.image || (Array.isArray(p.images) && p.images.length))
      .slice(0, 8);

    featured.forEach(product => {
      const imgSrc = product.image
        ? getImageUrl(product.image)
        : getImageUrl(product.images[0]);

      const card = document.createElement("div");
      card.className = "product-item";

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <span class="price">EGP ${product.price}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      featuredGrid.appendChild(card);
    });
  }

  /* ===============================
     Mobile Menu
  ============================== */
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  menuToggle?.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
});
