// قائمة الموبايل
const toggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('.nav ul');

toggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

// سلايدر بسيط
let slides = document.querySelectorAll('.slider-item');
let current = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if(i === index) slide.classList.add('active');
  });
}

function nextSlide() {
  current = (current + 1) % slides.length;
  showSlide(current);
}

setInterval(nextSlide, 5000);
