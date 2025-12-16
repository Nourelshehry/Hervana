document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");

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
    } catch {}
    return [];
  }

  function buildImageURL(path) {
    if (!path) return "images/default.jpg";
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
    const product = products.find(p => String(p.id) === productId);

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
    document.getElementById("product-price").textContent =
      `EGP ${product.price}`;

    /* ===============================
       Image Slider
    =============================== */
    const slider = document.getElementById("slider");
    const dotsContainer = document.getElementById("slider-dots");

    slider.innerHTML = "";
    dotsContainer.innerHTML = "";

    let images = parseImages(product.images);
    if (!images.length) images = ["images/default.jpg"];

    images.forEach((img, index) => {
      const image = document.createElement("img");
      image.src = buildImageURL(img);
      image.alt = product.name;
      image.loading = "lazy";
      image.onerror = () => {
        image.src = "images/default.jpg";
      };

      if (index === 0) image.classList.add("active");
      slider.appendChild(image);

      const dot = document.createElement("span");
      dot.className = "dot" + (index === 0 ? " active" : "");
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
        addBtn.disabled = false;
        addBtn.textContent = "Add to Cart";
        addBtn.classList.remove("out-of-stock");

        addBtn.addEventListener("click", () =>
          addToCart(product, addBtn)
        );
      }
    }
  } catch (err) {
    console.error("Error loading product:", err);
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

  /* Swipe (Mobile) */
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

/* ===============================
   Cart Logic
=============================== */
function addToCart(product, button) {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem("userId", userId);
  }

  const key = `cart_${userId}`;
  const cart = JSON.parse(localStorage.getItem(key)) || [];

  if (product.stock <= 0) {
    if (button) {
      button.disabled = true;
      button.textContent = "Out of Stock";
      button.classList.add("out-of-stock");
    }
    return;
  }

  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    if (existing.quantity + 1 > product.stock) {
      alert("No more items in stock");
      return;
    }
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  localStorage.setItem(key, JSON.stringify(cart));
  updateCartCount(cart);

  const msg = document.getElementById("cart-message");
  if (msg) {
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1500);
  }
}

function updateCartCount(cart) {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}
