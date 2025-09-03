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


/*Allproducts*/

function filterProducts(category) {
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    if (category === 'all' || product.dataset.category === category) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

// التأكد من أن الضغط على اللوجو يرجع للصفحة الرئيسية بدون مشاكل
document.querySelector('.logo').addEventListener('click', function(e){
  // يمكن تعديل الرابط حسب الصفحة الرئيسية عندك
  window.location.href = 'index.html';
});

