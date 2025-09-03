document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");  // استخدمي show بدل active
  });

  // كود السلايدر منفصل
  const slides = document.querySelectorAll(".hero-slider img");
  let current = 0;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  };

  const nextSlide = () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  };
  const prevSlide = () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  };

  setInterval(nextSlide, 3000);
  document.querySelector(".next").onclick = nextSlide;
  document.querySelector(".prev").onclick = prevSlide;

  showSlide(current);
});
