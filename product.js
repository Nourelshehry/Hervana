document.addEventListener("DOMContentLoaded", async () => {
  const productId = parseInt(new URLSearchParams(window.location.search).get("id"));
  const productNameEl = document.getElementById("product-name");
  const productDescEl = document.getElementById("product-description");
  const productPriceEl = document.getElementById("product-price");
  const addToCartBtn = document.getElementById("add-to-cart");
  const sliderEl = document.getElementById("slider");
  const sliderDots = document.getElementById("slider-dots");

  if (!productId) return;

  try {
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    const product = products.find(p => p.id === productId);
    if (!product) return;

    let stockData = JSON.parse(localStorage.getItem("productStock")) || {};
    let currentStock = stockData[product.id] ?? product.stock;

    // ملء البيانات
    productNameEl.textContent = product.name;
    productDescEl.textContent = product.description;
    productPriceEl.textContent = `EGP ${product.price}`;
    if (currentStock <= 0) addToCartBtn.disabled = true;

    // ربط Add to Cart
    if (addToCartBtn) {
      addToCartBtn.dataset.id = product.id;
      addToCartBtn.dataset.name = product.name;
      addToCartBtn.dataset.price = product.price;
    }

    // Slider الصور
    sliderEl.innerHTML = product.images.map((img, idx) =>
      `<img src="${img}" alt="${product.name}" style="display:${idx===0?'block':'none'};">`
    ).join("");

    sliderDots.innerHTML = product.images.map((_, idx) =>
      `<button class="${idx===0?'active':''}" data-index="${idx}"></button>`
    ).join("");

    let currentIndex = 0;
    function showSlide(index) {
      const slides = sliderEl.querySelectorAll("img");
      slides.forEach((s, i) => s.style.display = i === index ? "block" : "none");
      sliderDots.querySelectorAll("button").forEach((b, i) => b.classList.toggle("active", i === index));
      currentIndex = index;
    }

    document.querySelector(".next")?.addEventListener("click", () => {
      showSlide((currentIndex + 1) % product.images.length);
    });
    document.querySelector(".prev")?.addEventListener("click", () => {
      showSlide((currentIndex - 1 + product.images.length) % product.images.length);
    });
    sliderDots.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => showSlide(parseInt(btn.dataset.index)));
    });

  } catch (err) {
    console.error(err);
  }
});
