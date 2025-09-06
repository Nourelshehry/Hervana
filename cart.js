document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");

  // إنشاء overlay
  const overlay = document.createElement("div");
  overlay.id = "cart-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.4)";
  overlay.style.zIndex = "1500";
  overlay.style.display = "none";
  document.body.appendChild(overlay);

  let cart = [];

  // فتح الكارت مع overlay
  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("active");
    overlay.style.display = "block";
  });

  // إغلاق الكارت
  const closeCart = document.getElementById("close-cart");
  const closeCartSidebar = () => {
    cartSidebar.classList.remove("active");
    overlay.style.display = "none";
  };
  closeCart.addEventListener("click", closeCartSidebar);
  overlay.addEventListener("click", closeCartSidebar);

  // إضافة منتج للكارت
  function addToCart(productName, price) {
    cart.push({ productName, price });
    updateCart();
  }

  // تحديث الكارت والعداد
  function updateCart() {
    cartItems.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.productName} - $${item.price}`;
      cartItems.appendChild(li);
    });
    if(cart.length > 0){
      cartCount.style.display = "inline-block";
      cartCount.textContent = cart.length;
    } else {
      cartCount.style.display = "none";
    }
  }

  // ربط أي زرار "Add to Cart"
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });

  updateCart();
});
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
    });
  });
});
