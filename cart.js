document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const closeCart = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartMessage = document.getElementById("cart-message");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // 🔹 فتح وقفل الكارت
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("active");
    });
  }

  if (closeCart) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("active");
    });
  }

  // 🔹 عرض الكارت
  function renderCart() {
    if (!cartItems) return;
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="cart-item">
          <span>${item.name} - ${item.price} EGP</span>
          <div class="quantity-controls">
            <button class="decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="increase" data-index="${index}">+</button>
          </div>
        </div>
      `;
      cartItems.appendChild(li);
    });

    // 🔹 تحديث عدد العناصر
    if (cartCount) {
      cartCount.textContent = cart.length;
      cartCount.style.display = cart.length > 0 ? "inline-block" : "none";
    }

    // حفظ التعديلات
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // 🔹 إضافة منتج للكارت
  function addToCart(productId, productName, price, stock) {
    let existing = cart.find((item) => item.id === productId);
    if (existing) {
      if (existing.quantity < stock) {
        existing.quantity++;
      } else {
        alert("⚠️ Not enough stock available!");
      }
    } else {
      cart.push({
        id: productId,
        name: productName,
        price: parseFloat(price),
        quantity: 1,
        stock: stock
      });
    }
    renderCart();
    showCartMessage();
  }

  // 🔹 التحكم في الكمية
  if (cartItems) {
    cartItems.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      if (e.target.classList.contains("increase")) {
        if (cart[index].quantity < cart[index].stock) {
          cart[index].quantity++;
        } else {
          alert("⚠️ Stock limit reached!");
        }
      } else if (e.target.classList.contains("decrease")) {
        cart[index].quantity--;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      }
      renderCart();
    });
  }

  // 🔹 ربط أزرار Add to Cart
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      const stock = parseInt(btn.getAttribute("data-stock"));
      addToCart(id, name, price, stock);
    });
  });

  // 🔹 رسالة Added to Cart
  function showCartMessage() {
    if (cartMessage) {
      cartMessage.style.display = "block";
      setTimeout(() => {
        cartMessage.style.display = "none";
      }, 2000);
    }
  }

  // 🔹 زرار Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }

  renderCart();
});
