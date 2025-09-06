document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("category");
  const searchInput = document.getElementById("search");
  const products = document.querySelectorAll(".product-card");

  function filterProducts() {
    const category = categorySelect.value.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    products.forEach(product => {
      const productCategory = product.getAttribute("data-category").toLowerCase();
      const productName = product.getAttribute("data-name").toLowerCase();
      if ((category === "all" || category === productCategory) && productName.includes(searchTerm)) {
        product.style.display = "block";
      } else {
        product.style.display = "none";
      }
    });
  }

  categorySelect.addEventListener("change", filterProducts);
  searchInput.addEventListener("input", filterProducts);
});
