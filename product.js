document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.getElementById("main-image");
  const thumbs = document.querySelectorAll(".image-thumbs img");
  const stockLabel = document.getElementById("product-stock");
  const quantityInput = document.getElementById("quantity");
  const addToCartBtn = document.querySelector(".add-to-cart");

  // ===== تبديل الصور =====
  if (mainImage && thumbs) {
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        mainImage.src = thumb.src;
      });
    });
  }

  // ===== مثال على إدارة المخزون =====
  // (في الحالة الواقعية، هيتجاب من الداتابيز أو JSON)
  let stock = 5; // مثال: المنتج متاح 5 قطع

  function updateStockDisplay() {
    if (stock > 0) {
      stockLabel.textContent = `In Stock (${stock} available)`;
      stockLabel.className = "in-stock";
      addToCartBtn.disabled = false;
    } else {
      stockLabel.textContent = "Out of Stock";
      stockLabel.className = "out-of-stock";
      addToCartBtn.disabled = true;
    }
  }
  updateStockDisplay();

  // ===== عند الضغط على Add to Cart =====
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const qty = parseInt(quantityInput.value) || 1;

      if (qty <= stock) {
        // استدعاء الكارت جلوبال (من cart.js)
        const name = addToCartBtn.getAttribute("data-name");
        const price = addToCartBtn.getAttribute("data-price");
        for (let i = 0; i < qty; i++) {
          addToCart(name, price); // 👈 الكارت موجودة في cart.js
        }

        stock -= qty;
        updateStockDisplay();
      } else {
        alert("❌ الكمية المطلوبة غير متاحة في المخزون!");
      }
    });
  }
});
