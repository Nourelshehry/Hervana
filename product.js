document.addEventListener("DOMContentLoaded", async () => {
  const productId = new URLSearchParams(window.location.search).get("id");
  const productContainer = document.getElementById("product-container");

  if (!productId) {
    productContainer.innerHTML = "<p>❌ Product not found.</p>";
    return;
  }

  try {
    // ✅ جلب البيانات من GitHub
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    const products = await response.json();

    const product = products.find(p => p.id == productId);

    if (!product) {
      productContainer.innerHTML = "<p>❌ Product not found.</p>";
      return;
    }

    // 🖼️ عرض البيانات
    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-description").textContent = product.description;
    document.getElementById("product-price").textContent = `EGP ${product.price}`;

    // 🖼️ تحميل الصور للسلايدر
    const slider = document.getElementById("slider");
    const dotsContainer = document.getElementById("slider-dots");

    product.images.forEach((img, i) => {
      const imageEl = document.createElement("img");
      imageEl.src = img;
      slider.appendChild(imageEl);

      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => moveToSlide(i));
      dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    function moveToSlide(index) {
      const slideWidth = slider.querySelector("img").clientWidth;
      slider.style.transform = `translateX(-${index * slideWidth}px)`;
      dotsContainer.querySelectorAll("button").forEach((d, i) => {
        d.classList.toggle("active", i === index);
      });
      currentSlide = index;
    }

    // أزرار السلايدر
    document.querySelector(".slider-btn.prev").addEventListener("click", () => {
      moveToSlide((currentSlide - 1 + product.images.length) % product.images.length);
    });
    document.querySelector(".slider-btn.next").addEventListener("click", () => {
      moveToSlide((currentSlide + 1) % product.images.length);
    });

    // زرار Add to Cart
    document.getElementById("add-to-cart").addEventListener("click", () => {
      if (typeof addToCart === "function") {
        addToCart(product.name, product.price);
      }
    });

    // ✅ Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeLightbox = document.querySelector(".close-lightbox");

    slider.querySelectorAll("img").forEach(img => {
      img.addEventListener("click", () => {
        lightboxImg.src = img.src;
        lightbox.classList.add("show");
      });
    });

    if (closeLightbox) {
      closeLightbox.addEventListener("click", () => {
        lightbox.classList.remove("show");
      });
    }

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove("show");
      }
    });

  } catch (error) {
    console.error("Error loading product data:", error);
    productContainer.innerHTML = "<p>⚠️ Error loading product data.</p>";
  }
});
