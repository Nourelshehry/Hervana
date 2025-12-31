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

function normalizeImages(product) {
  if (!product || !product.images) return [];

  if (typeof product.images === "string") {
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  if (Array.isArray(product.images)) return product.images;
  return [];
}

function getImageUrl(img) {
  if (!img) return "/images/placeholder.png";
  if (img.startsWith("http")) return img;
  return `https://hervana.pages.dev/${img.replace(/^\/+/, "")}`;
}

/* ===============================
   DOMContentLoaded
================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const heroSlider = document.getElementById("hero-slider");
  const dotsContainer = document.querySelector(".slider-dots");
  const featuredGrid = document.getElementById("featured-products");
  const homeSearch = document.getElementById("home-search");

  let products = [];
  let featuredInterval = null;

  /* ===============================
     Fetch Products
  ============================== */
  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/products"
    );

    if (!res.ok) throw new Error("Failed to fetch products");

    products = await res.json();
    console.log("✅ PRODUCTS LOADED:", products.length);
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

    const sliderProducts = shuffleArray(
      products
        .map(p => ({ ...p, imagesArr: normalizeImages(p) }))
        .filter(p => p.imagesArr.length)
    ).slice(0, 5);

    let current = 0;

    sliderProducts.forEach((product, index) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      if (index === 0) slide.classList.add("active");

      slide.innerHTML = `
        <img src="${getImageUrl(product.imagesArr[0])}" alt="${product.name}">
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

    function goTo(i) {
      slides[current].classList.remove("active");
      dots[current].classList.remove("active");
      current = i;
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

  const featuredProducts = products
    .map(p => ({ ...p, imagesArr: normalizeImages(p) }))
    .filter(p => p.imagesArr.length);

  function renderFeatured(list = null) {
    featuredGrid.innerHTML = "";

    const source = list || shuffleArray(featuredProducts).slice(0, 8);

    if (!source.length) {
      featuredGrid.innerHTML = "<p>No products found</p>";
      return;
    }

    source.forEach(product => {
      const imgSrc = getImageUrl(product.imagesArr[0]);

      const isOnSale = Number(product.on_sale) === 1;
      const salePercent = Number(product.sale_percent);

      const card = document.createElement("div");
      card.className = "product-item";

      card.innerHTML = `
        ${
          isOnSale && salePercent
            ? `<span class="sale-badge">-${salePercent}%</span>`
            : ""
        }

        <img src="${imgSrc}" alt="${product.name}">

        <div class="product-info">
          <h3>${product.name}</h3>

          <p class="price">
            ${
              isOnSale
                ? `<span class="old-price">${product.price} EGP</span>
                   <span class="sale-price">${product.sale_price} EGP</span>`
                : `${product.price} EGP`
            }
          </p>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      featuredGrid.appendChild(card);
    });
  }

  renderFeatured();
  featuredInterval = setInterval(renderFeatured, 30000);

  /* ===============================
     SEARCH (HOME)
  ============================== */

  if (homeSearch) {
    homeSearch.addEventListener("input", () => {
      const q = homeSearch.value.trim().toLowerCase();

      if (!q) {
        renderFeatured();
        if (!featuredInterval) {
          featuredInterval = setInterval(renderFeatured, 30000);
        }
        return;
      }

      clearInterval(featuredInterval);
      featuredInterval = null;

      const filtered = featuredProducts.filter(p =>
        p.name.toLowerCase().includes(q)
      );

      renderFeatured(filtered.slice(0, 8));
    });
  }

  /* ===============================
     Mobile Menu ✅ (FIXED)
  ============================== */

  const menu = document.getElementById("side-menu");
  const openBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("close-menu");

  if (!menu || !openBtn || !closeBtn) {
    console.warn("⚠️ Mobile menu elements not found");
  } else {
    openBtn.addEventListener("click", () => {
      menu.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
      menu.classList.remove("active");
    });

    menu.addEventListener("click", e => {
      if (e.target.closest("a")) {
        menu.classList.remove("active");
      }
    });
  }
});
