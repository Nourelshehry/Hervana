document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".hero-slider img");
  let current = 0;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      slide.classList.remove("active");
      if(i === index) slide.classList.add("active");
    });
  }

  const nextSlide = () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  const prevSlide = () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  }

  // Auto Slide every 3s
  let slideInterval = setInterval(nextSlide, 3000);

  // Buttons
  document.querySelector(".next").addEventListener("click", () => {
    nextSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 3000);
  });

  document.querySelector(".prev").addEventListener("click", () => {
    prevSlide();
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 3000);
  });

  // Shop Now button alert
  const shopBtn = document.querySelector(".hero-content button");
  shopBtn.addEventListener("click", function () {
    alert("Welcome to Hervana! Let's start shopping 🛍️");
  });
});
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});
