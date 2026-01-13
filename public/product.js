document.addEventListener("DOMContentLoaded", async () => {

  /* ===============================
     Smart Back Button
  =============================== */

  const params = new URLSearchParams(window.location.search);
  const backBtn = document.getElementById("back-btn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      const from = params.get("from");

      if (from) {
        window.location.href = decodeURIComponent(from);
        return;
      }

      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      window.location.href = "all-products.html";
    });
  }

  /* ===============================
     Product Logic
  =============================== */

  const productId = params.get("id");

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
    } catch {
      return [];
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
      "https://hervanastore.nourthranduil.workers.dev/products"
    );

    if (!res.ok) throw new Error("Failed to load products");

    const products = await res.json();

    const product = products.find(
      p => String(p.id) === String(productId)
    );

    if (!product) {
      document.querySelector(".product-details").innerHTML =
        "<p>Product not found.</p>";
      return;
    }

    const addBtn = document.getElementById("add-to-cart");

    /* ===============================
       Stock Logic
    =============================== */

    const stock = Number(product.stock);
    const isOut = isNaN(stock) || stock <= 0;

    if (isOut && addBtn) {
      addBtn.textContent = "Out of stock";
      addBtn.disabled = true;
      addBtn.classList.add("out-of-stock");
    }

    /* ===============================
       Bind Add To Cart  ✅ FIX HERE
    =============================== */

    if (addBtn) {
      const finalPrice =
        product.on_sale && !isOut
          ? product.sale_price
          : product.price;

      addBtn.dataset.id = product.id;
      addBtn.dataset.name = product.name;
      addBtn.dataset.price = finalPrice;

      addBtn.addEventListener("click", e => {
        e.preventDefault();   // 🔴 يمنع reload
        e.stopPropagation(); // 🔴 أمان إضافي

        if (addBtn.disabled) return;

        if (typeof addToCart === "function") {
          addToCart(
            addBtn.dataset.id,
            addBtn.dataset.name,
            addBtn.dataset.price
          );
        } else {
          console.error("❌ addToCart not found");
        }
      });
    }

    /* ===============================
       Product Info
    =============================== */

    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent =
      product.description || "";

    const priceEl = document.getElementById("product-price");

    if (product.on_sale && !isOut) {
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
      if (index === 0) image.classList.add("active");
      slider.appendChild(image);

      const dot = document.createElement("span");
      dot.className = "dot";
      if (index === 0) dot.classList.add("active");
      dotsContainer.appendChild(dot);
    });

    initSlider(slider, dotsContainer);

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
