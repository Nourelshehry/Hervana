document.addEventListener("DOMContentLoaded", function () {
  // Menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("show"));

  // Hero slider
  const slides = document.querySelectorAll(".hero-slider img");
  let current = 0;
  const showSlide = (index) => slides.forEach((slide, i) => slide.classList.toggle("active", i===index));
  const nextSlide = () => { current=(current+1)%slides.length; showSlide(current); };
  const prevSlide = () => { current=(current-1+slides.length)%slides.length; showSlide(current); };
  setInterval(nextSlide, 3000);
  document.querySelector(".next").onclick = nextSlide;
  document.querySelector(".prev").onclick = prevSlide;
  showSlide(current);

  // Cart toggle
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const closeCart = document.getElementById("close-cart");
  cartBtn.addEventListener("click", () => cartSidebar.classList.toggle("active"));
  closeCart.addEventListener("click", () => cartSidebar.classList.remove("active"));

  // Cart count visibility
  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");
  const updateCartCount = () => { 
    const count = cartItems.children.length;
    if(count>0){ cartCount.style.display='inline-block'; cartCount.textContent=count; } 
    else { cartCount.style.display='none'; } 
  }
  updateCartCount();

  // Search bar functionality
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  searchInput.addEventListener("input", function(){
    const term = this.value.toLowerCase();
    products.forEach(p => {
      const name = p.dataset.name.toLowerCase();
      p.style.display = name.includes(term) ? "block" : "none";
    });
  });
});
