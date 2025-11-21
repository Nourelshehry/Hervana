// ✅ إنشاء userId فريد لكل مستخدم (لو مش موجود)
function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("userId", userId);
  }
  return userId;
}

const userId = getUserId();
const cartKey = `cart_${userId}`;
const stockKey = `productStock_${userId}`;
const ordersKey = `orders_${userId}`;

document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.querySelector(".product-grid");
  const searchInput = document.getElementById("search");
  const categorySelect = document.getElementById("category");
  let stockData = JSON.parse(localStorage.getItem(stockKey)) || {};

  // Fetch products.json
  let products = [];
  try {
    const response = await fetch("https://raw.githubusercontent.com/Nourelshehry/Hervana/master/products.json");
    products = await response.json();
  } catch (err) {
    console.error("Failed to load JSON:", err);
    if (productGrid) productGrid.innerHTML = "<p>⚠️ Failed to load products.</p>";
    return;
  }

  // Fill category select if exists
  if (categorySelect) {
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });
  }

  // Display products
  function displayProducts(filterText = "", filterCategory = "all") {
    if (!productGrid) return;
    productGrid.innerHTML = "";

    products.forEach(product => {
      let currentStock = stockData[product.id] ?? product.stock;

      if (
        product.name.toLowerCase().includes(filterText.toLowerCase()) &&
        (filterCategory === "all" || product.category === filterCategory)
      ) {
        const card = document.createElement("div");
        card.classList.add("product-card");
        card.innerHTML = `
          <img src="${product.images[0]}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>EGP ${product.price}</p>
          <p class="stock ${currentStock > 0 ? "in-stock" : "out-of-stock"}">
            ${currentStock > 0 ? `In Stock: ${currentStock}` : "Out of Stock"}
          </p>
          ${
            currentStock > 0
              ? `<button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${currentStock}">Add to Cart</button>`
              : `<button disabled>Out of Stock</button>`
          }
          <a href="product.html?id=${product.id}" class="view-btn">View Details</a>
        `;
        productGrid.appendChild(card);
      }
    });

    // Activate Add to Cart buttons
    document.querySelectorAll(".add-to-cart").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const stock = parseInt(btn.dataset.stock);
        addToCart(id, name, price, stock);
      });
    });
  }

  displayProducts();

  // Search & category filter
  if (searchInput) searchInput.addEventListener("input", () => displayProducts(searchInput.value, categorySelect?.value || "all"));
  if (categorySelect) categorySelect.addEventListener("change", () => displayProducts(searchInput?.value || "", categorySelect.value));
});

// ✅ Add to Cart function
function addToCart(id, name, price, stock) {
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  let existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.quantity < stock) existing.quantity++;
    else return alert("⚠️ No more stock available!");
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));

  // Show cart message
  const cartMessage = document.getElementById("cart-message");
  if (cartMessage) {
    cartMessage.style.display = "block";
    setTimeout(() => { cartMessage.style.display = "none"; }, 2000);
  }

  updateCartCount();
}

// ✅ Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  if (cartCount) {
    cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.style.display = cart.length ? "inline-block" : "none";
  }
}

// Initial cart count
updateCartCount();
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const nextBtn = document.querySelector(".slider-btn.next");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const dotsContainer = document.querySelector(".dots");

  let currentIndex = 0;

  // إنشاء النقاط
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
  const dots = document.querySelectorAll(".dots span");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      dots[i].classList.toggle("active", i === index);
    });
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    showSlide(currentIndex);
  }

  nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
  prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));

  // Auto play
  setInterval(() => goToSlide(currentIndex + 1), 5000);
});
// ✅ Toggle menu on mobile
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }

  /* ▼▼ Dropdown Products ▼▼ */
  const dropBtn = document.querySelector(".dropbtn");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const arrow = document.querySelector(".arrow");

  if (dropBtn && dropdownMenu) {
    dropBtn.addEventListener("click", (e) => {
      e.preventDefault(); // منع الانتقال للرابط
      dropdownMenu.classList.toggle("show");
      arrow.classList.toggle("rotate");
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  let slides = document.querySelectorAll(".hero-slider .slide");
  let nextBtn = document.querySelector(".slider-btn.next");
  let prevBtn = document.querySelector(".slider-btn.prev");
  let dotsContainer = document.querySelector(".hero-slider .dots");
  let currentIndex = 0;

  // إنشاء dots
  slides.forEach((_, i) => {
    let dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });

  let dots = dotsContainer.querySelectorAll("span");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      dots[i].classList.toggle("active", i === index);
    });
    currentIndex = index;
  }

  nextBtn.addEventListener("click", () => {
    let newIndex = (currentIndex + 1) % slides.length;
    showSlide(newIndex);
  });

  prevBtn.addEventListener("click", () => {
    let newIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(newIndex);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  // Auto play
  setInterval(() => {
    let newIndex = (currentIndex + 1) % slides.length;
    showSlide(newIndex);
  }, 5000);
});

