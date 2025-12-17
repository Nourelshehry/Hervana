console.log("🏠 HOME JS LOADED");

/* ===============================
   Helpers
================================ */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// نحول images لأي شكل Array مضمون
function normalizeImages(product) {
  if (!product || !product.images) return [];

  // لو جاية string JSON
  if (typeof product.images === "string") {
    try {
      return JSON.parse(product.images);
    } catch (e) {
      console.warn("❌ Invalid images JSON:", product.images);
      return [];
    }
  }

  // لو Array أصلًا
  if (Array.isArray(product.images)) {
    return product.images;
  }

  return [];
}

// نخلي الصورة URL مظبوط

function getImageUrl(img) {
  if (!img) return "/images/placeholder.png";

  if (img.startsWith("http")) return img;

  // 👈 الصور على Pages مش Worker
  return `https://hervana.pages.dev/${img}`;
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

const slidesData = shuffleArray(
  products.filter(
    p => p.image || (Array.isArray(p.images) && p.images.length)
  )
).slice(0, 5);


    let current = 0;

    slidesData.forEach((product, index) => {
      const imgSrc = getImageUrl(product.imagesArr[0]);

      const slide = document.createElement("div");
      slide.className = "slide";
      if (index === 0) slide.classList.add("active");

      slide.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}">
      `;

   slide.dataset.id = product.id;

slide.addEventListener("click", (e) => {
  const id = e.currentTarget.dataset.id;
  window.location.href = `product.html?id=${id}`;
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

    if (slides.length > 1) {
      setInterval(() => {
        goTo((current + 1) % slides.length);
      }, 4000);
    }
  }

  /* ===============================
     FEATURED PRODUCTS
  ============================== */
  if (featuredGrid) {
    featuredGrid.innerHTML = "";

    const featured = products
      .map(p => ({ ...p, imagesArr: normalizeImages(p) }))
      .filter(p => p.imagesArr.length)
      .slice(0, 8);

    featured.forEach(product => {
      const imgSrc = getImageUrl(product.imagesArr[0]);

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
