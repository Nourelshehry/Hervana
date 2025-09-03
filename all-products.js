document.addEventListener("DOMContentLoaded", function () {
  // Navbar toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  // Filters
  const categorySelect = document.getElementById("category");
  const priceInput = document.getElementById("price");
  const products = document.querySelectorAll(".product-card");

  function filterProducts() {
    const category = categorySelect.value;
    const maxPrice = priceInput.value ? parseFloat(priceInput.value) : Infinity;

    products.forEach(product => {
      const productCategory = product.getAttribute("data-category");
      const productPrice = parseFloat(product.getAttribute("data-price"));

      if ((category === "all" || category === productCategory) && productPrice <= maxPrice) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  }

  categorySelect.addEventListener("change", filterProducts);
  priceInput.addEventListener("input", filterProducts);
});
