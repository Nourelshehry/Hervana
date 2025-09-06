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

  // Search bar functionality with debounce
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  let debounceTimeout;
  searchInput.addEventListener("input", function(){
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const term = searchInput.value.toLowerCase();
      products.forEach(p => {
        const name = p.dataset.name.toLowerCase();
        p.style.display = name.includes(term) ? "block" : "none";
      });
    }, 200);
  });
});
  searchInput.addEventListener("input", function(){
    const term = this.value.toLowerCase();
    products.forEach(p => {
      const name = p.dataset.name.toLowerCase();
      p.style.display = name.includes(term) ? "block" : "none";
    });
  });
});
