document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const closeCartBtn = document.getElementById("close-cart");

  const checkoutList = document.getElementById("checkout-list");
  const totalElem = document.getElementById("total");
  const completeBtn = document.getElementById("complete-btn");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ✅ Toast Notification
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => { toast.classList.add("show"); }, 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ✅ تحديث الكارت (Sidebar)
  function updateCart() {
    if (!cartItems) return; // لو مش موجودة في الصفحة

    cartItems.innerHTML = "";
    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="info">
          <span>${item.name}</span>
          <small>$${item.price}</small>
          <div class="qty-controls">
            <button class="minus">-</button>
            <span>${item.quantity}</span>
            <button class="plus">+</button>
          </div>
        </div>
      `;

      li.querySelector(".minus").onclick = () => {
        if (item.quantity > 1) item.quantity -= 1;
        else cart.splice(index, 1);
        saveCart();
        updateCart();
        renderCheckout();
      };

      li.querySelector(".plus").onclick = () => {
        item.quantity += 1;
        saveCart();
        updateCart();
        renderCheckout();
      };

      cartItems.appendChild(li);
    });

    if (cartCount) {
      cartCount.textContent = cart.length;
      cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
    }
  }

  // ✅ تحديث checkout page
  function renderCheckout() {
    if (!checkoutList || !totalElem) return; // لو مش موجودة الصفحة

    checkoutList.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "checkout-item";

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="info">
          <h4>${item.name}</h4>
          <p>$${item.price}</p>
          <div class="qty-controls">
            <button class="minus">-</button>
            <span>${item.quantity}</span>
            <button class="plus">+</button>
          </div>
        </div>
      `;

      div.querySelector(".minus").onclick = () => {
        if (item.quantity > 1) item.quantity -= 1;
        else cart.splice(index, 1);
        saveCart();
        updateCart();
        renderCheckout();
      };

      div.querySelector(".plus").onclick = () => {
        item.quantity += 1;
        saveCart();
        updateCart();
        renderCheckout();
      };

      checkoutList.appendChild(div);
      total += item.price * item.quantity;
    });

    totalElem.textContent = `Total: $${total.toFixed(2)}`;
  }

  // ✅ إضافة منتج
  function addToCart(name, price, image) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, image, quantity: 1 });
    }
    saveCart();
    updateCart();
    renderCheckout();
    showToast(`${name} added to cart`);
  }

  // ربط أزرار Add to Cart
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = parseFloat(btn.getAttribute("data-price"));
      const image = btn.closest(".product-card").querySelector("img").src;
      addToCart(name, price, image);
    });
  });

  // فتح و قفل الكارت
  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", () => cartSidebar.classList.add("active"));
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("active"));
  }

  // الانتقال للـ Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => window.location.href = "checkout.html");
  }

  // تأكيد الأوردر
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      window.location.href = "order.html";
    });
  }

  // تحميل مبدئي
  updateCart();
  renderCheckout();
});
