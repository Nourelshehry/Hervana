document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");

  if (!productId) {
    console.error("❌ No product id in URL");
    return;
  }

  /* ===============================
     Helpers
  =============================== */
  function parseImages(images) {
    try {
      if (Array.isArray(images)) return images;
      if (typeof images === "string") {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn("Invalid images JSON", images);
    }
    return [];
  }

  function buildImageURL(path) {
    if (!path) return "/images/placeholder.png";
    if (path.startsWith("http")) return path;
    return `https://hervana.pages.dev/${path.replace(/^\/+/, "")}`;
  }

  /* ===============================
     Fetch Product
  =============================== */
  try {
    const res = await fetch(
      "https://hervanastore.nourthranduil.workers.dev/api/products"
    );

    if (!res.ok) throw new Error("Failed to load products");

    const products = await res.json();
    const product = products.find(p => String(p.id) === String(productId));

    if (!product) {
      document.querySelector(".product-details").innerHTML =
        "<p>Product not found.</p>";
      return;
    }

    /* ===============================
       Product Info
    =============================== */
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent =
      product.description || "";

    const priceEl = document.getElementById("product-price");

    if (product.on_sale) {
  priceEl.innerHTML = `
    <span class="old-price">${product.price} EGP</span>
    <span class="sale-price">${product.sale_price} EGP</span>
    <span class="sale-badge">-${product.sale_percent}%</span>
  `;
} else {
  priceEl.textContent = `${product.price} EGP`;
}

    /* ===============================
       Image Slider
    =============================== */
    const slider = document.getElementById("slider");
    const dotsContainer = document.getElementById("slider-dots");

    slider.innerHTML = "";
    dotsContainer.innerHTML = "";

    let images = parseImages(product.images);
    if (!images.length) images = ["/images/placeholder.png"];

    images.forEach((img, index) => {
      const image = document.createElement("img");
      image.src = buildImageURL(img);
      image.alt = product.name;
      image.loading = "lazy";
      if (index === 0) image.classList.add("active");
      slider.appendChild(image);

      const dot = document.createElement("span");
      dot.className = "dot";
      if (index === 0) dot.classList.add("active");
      dotsContainer.appendChild(dot);
    });

    initSlider(slider, dotsContainer);

    /* ===============================
       Add To Cart
    =============================== */
    const addBtn = document.querySelector(".add-to-cart");

    if (addBtn) {
      if (product.stock <= 0) {
        addBtn.disabled = true;
        addBtn.textContent = "Out of Stock";
        addBtn.classList.add("out-of-stock");
      } else {
        addBtn.dataset.id = product.id;
        addBtn.dataset.name = product.name;
        addBtn.dataset.price = product.on_sale
          ? product.sale_price
          : product.price;
      }
    }
  } catch (err) {
    console.error("❌ Error loading product:", err);
  }
});

/* ===============================
   Slider Logic
=============================== */
function initSlider(slider, dotsContainer) {
  const slides = slider.querySelectorAll("img");
  const dots = dotsContainer.querySelectorAll(".dot");
  let index = 0;
  let autoSlide;

  function show(i) {
    slides.forEach((img, idx) =>
      img.classList.toggle("active", idx === i)
    );
    dots.forEach((d, idx) =>
      d.classList.toggle("active", idx === i)
    );
    index = i;
  }

  function next() {
    show((index + 1) % slides.length);
  }

  function prev() {
    show((index - 1 + slides.length) % slides.length);
  }

  document.querySelector(".next")?.addEventListener("click", () => {
    next();
    resetAuto();
  });

  document.querySelector(".prev")?.addEventListener("click", () => {
    prev();
    resetAuto();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      show(i);
      resetAuto();
    });
  });

  function startAuto() {
    autoSlide = setInterval(next, 4000);
  }

  function resetAuto() {
    clearInterval(autoSlide);
    startAuto();
  }

  let startX = 0;
  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  });

  show(0);
  startAuto();
}
