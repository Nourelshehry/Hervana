document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const closeCartBtn = document.getElementById("close-cart");

  // جلب الكارت من localStorage أو إنشاء جديد
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // تحديث عرض الكارت وعدد العناصر
  function updateCart() {
    cartItems.innerHTML = "";
    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price}`;

      // زر حذف
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.style.marginLeft = "10px";
      removeBtn.addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        updateCart();
      });

      li.appendChild(removeBtn);
      cartItems.appendChild(li);
    });

    cartCount.textContent = cart.length;
    cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
  }

  // حفظ الكارت في localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // إضافة منتج للكارت
  function addToCart(name, price) {
    cart.push({ name, price });
    saveCart();
    updateCart();
    alert(`${name} added to cart`);
  }

  // ربط أي زر Add to Cart في أي صفحة
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = parseFloat(btn.getAttribute("data-price"));
      addToCart(name, price);
    });
  });

  // فتح وغلق sidebar
  if (cartBtn) cartBtn.addEventListener("click", () => cartSidebar.classList.add("active"));
  if (closeCartBtn) closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("active"));

  // زر checkout يفتح صفحة checkout.html
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });

  // تحميل الكارت عند بدء الصفحة
  updateCart();
});
