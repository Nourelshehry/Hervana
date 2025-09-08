document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("category");
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");
  
  // Menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }
  // فلترة المنتجات
  function filterProducts() {
    const category = categorySelect.value.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    products.forEach((product) => {
      const productCategory = product.getAttribute("data-category").toLowerCase();
      const productName = product.getAttribute("data-name").toLowerCase();

      if (
        (category === "all" || category === productCategory) &&
        productName.includes(searchTerm)
      ) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  }

  if (categorySelect) categorySelect.addEventListener("change", filterProducts);
  if (searchInput) searchInput.addEventListener("input", filterProducts);

});

  