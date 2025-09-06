document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // فتح و قفل الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("active");
    });
  }
  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // دالة عرض رسالة "Added to Cart"
  function showAddedMessage(productName) {
    let msg = document.createElement("div");
    msg.className = "added-message";
    msg.textContent = `${productName} added to cart ✅`;
    document.body.appendChild(msg);

    setTimeout(() => {
      msg.classList.add("show");
    }, 50);

    setTimeout(() => {
      msg.classList.remove("show");
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }

  // Function لإضافة منتج
  function addToCart(productName, price) {
    const existing = cart.find(item => item.name === productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name: productName, price: parseFloat(price), quantity: 1 });
    }
    updateCart();
    showAddedMessage(productName); // ✅ اظهار الرسالة
  }

  // تحديث الكارت
  function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.name} - $${item.price} x 
        <button class="decrease" data-index="${index}">-</button>
        ${item.quantity}
        <button class="increase" data-index="${index}">+</button>
      `;
      cartItems.appendChild(li);
      total += item.price * item.quantity;
    });

    cartCount.textContent = cart.length;
    localStorage.setItem("cart", JSON.stringify(cart));

    // أحداث زيادة/نقصان
    document.querySelectorAll(".increase").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = btn.getAttribute("data-index");
        cart[i].quantity++;
        updateCart();
      });
    });

    document.querySelectorAll(".decrease").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = btn.getAttribute("data-index");
        if (cart[i].quantity > 1) {
          cart[i].quantity--;
        } else {
          cart.splice(i, 1);
        }
        updateCart();
      });
    });
  }

  // ربط أي زرار "Add to Cart" في أي صفحة
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  // أول تحديث
  updateCart();
});
