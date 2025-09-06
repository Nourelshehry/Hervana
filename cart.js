const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartClose = document.getElementById("cart-close");
const cartItems = document.getElementById("cart-items");

cartBtn.addEventListener("click", () => {
  cartSidebar.style.transform = "translateX(0)";
});

cartClose.addEventListener("click", () => {
  cartSidebar.style.transform = "translateX(100%)";
});

// إضافة منتجات للعربة
document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    const product = button.closest(".product");
    const title = product.querySelector("h3").textContent;
    const item = document.createElement("p");
    item.textContent = title;
    cartItems.appendChild(item);
    cartSidebar.style.transform = "translateX(0)";
  });
});
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

  // ربط أي زرار "Add to Cart" في الصفحة
  const productButtons = document.querySelectorAll(".add-to-cart");
  productButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price");
      addToCart(name, price);
      // افتح الكارت عند إضافة منتج
      cartSidebar.classList.add("active");
      overlay.style.display = "block";
    });
  });

  updateCart();
});
