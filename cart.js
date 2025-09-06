document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // فتح / قفل الكارت
  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("active");
    });
  }
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // تحديث الكارت
  function updateCart() {
    if (!cartItems || !cartCount) return;

    cartItems.innerHTML = "";
    let count = 0;
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.marginBottom = "8px";

      const info = document.createElement("span");
      info.textContent = `${item.name} - $${item.price} x${item.quantity}`;

      // زرار زيادة
      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.className = "qty-btn";
      plusBtn.onclick = () => {
        item.quantity++;
        updateCart();
      };

      // زرار نقصان
      const minusBtn = document.createElement("button");
      minusBtn.textContent = "-";
      minusBtn.className = "qty-btn";
      minusBtn.onclick = () => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart.splice(index, 1);
        }
        updateCart();
      };

      // زرار حذف
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = () => {
        cart.splice(index, 1);
        updateCart();
      };

      const controls = document.createElement("div");
      controls.appendChild(minusBtn);
      controls.appendChild(plusBtn);
      controls.appendChild(removeBtn);

      li.appendChild(info);
      li.appendChild(controls);
      cartItems.appendChild(li);

      count += item.quantity;
      total += item.price * item.quantity;
    });

    // تحديث العداد
    cartCount.textContent = count;
    cartCount.style.display = count > 0 ? "inline-block" : "none";

    // Total + Checkout
    if (cart.length > 0) {
      const totalDiv = document.createElement("div");
      totalDiv.style.marginTop = "15px";
      totalDiv.style.fontWeight = "bold";
      totalDiv.textContent = `Total: $${total.toFixed(2)}`;

      const checkoutBtn = document.createElement("button");
      checkoutBtn.id = "checkout-btn";
      checkoutBtn.textContent = "Checkout";
      checkoutBtn.style.marginTop = "10px";
      checkoutBtn.style.width = "100%";
      checkoutBtn.style.padding = "10px";
      checkoutBtn.style.background = "#c0392b";
      checkoutBtn.style.color = "#fff";
      checkoutBtn.style.border = "none";
      checkoutBtn.style.cursor = "pointer";
      checkoutBtn.onclick = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "order.html";
      };

      cartItems.appendChild(totalDiv);
      cartItems.appendChild(checkoutBtn);
    }

    // حفظ
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // إضافة منتج للكارت
  function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ name, price: parseFloat(price), quantity: 1 });
    }
    updateCart();
    showAddedMessage();
  }

  // ربط أزرار Add to Cart
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      addToCart(name, price);
    });
  });

  // رسالة "Added to Cart"
  function showAddedMessage() {
    let msg = document.createElement("div");
    msg.textContent = "Added to Cart! ❤️";
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.right = "20px";
    msg.style.background = "#ff99cc"; // بينك
    msg.style.color = "#fff";
    msg.style.padding = "10px 15px";
    msg.style.borderRadius = "8px";
    msg.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    msg.style.zIndex = "3000";
    msg.style.opacity = "0";
    msg.style.transition = "opacity 0.3s ease-in-out";
    document.body.appendChild(msg);

    setTimeout(() => (msg.style.opacity = "1"), 50);

    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 300);
    }, 1500);
  }

  // تحميل الكارت عند فتح الصفحة
  updateCart();
});
