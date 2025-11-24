// admin.js
const API_BASE = "http://127.0.0.1:3000";

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status} - ${text}`);
  }
  return res.json();
}

async function loadOrders() {
  const info = document.getElementById("ordersInfo");
  try {
    const orders = await fetchJson(`${API_BASE}/orders`);
    info.textContent = `${orders.length} order(s) found`;
    const tbody = document.querySelector("#ordersTable tbody");
    tbody.innerHTML = "";
    orders.slice().reverse().forEach(o => {
      const itemsCount = (o.items || []).reduce((s,i)=> s + (i.quantity||0), 0);
      const cust = (o.userDetails && o.userDetails.name) || "—";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.date}</td>
        <td>${cust}</td>
        <td>${itemsCount}</td>
        <td>${o.total} EGP</td>
      `;
tr.addEventListener("click", () => {
  window.location.href = `order-details.html?id=${o.id}`;
});
      tbody.appendChild(tr);
    });
  } catch (err) {
    info.textContent = "Failed to load orders";
    console.error(err);
  }
}

function showOrderDetail(order) {
  const itemsHtml = (order.items || []).map(it => `${it.id} × ${it.quantity}`).join("\n");
  alert(
    `Order ${order.id}\nDate: ${order.date}\nCustomer: ${order.userDetails?.name || "—"}\nPhone: ${order.userDetails?.phone || "—"}\nAddress: ${order.userDetails?.address || "—"}\n\nItems:\n${itemsHtml}\n\nTotal: ${order.total} EGP`
  );
}

async function loadProducts() {
  const info = document.getElementById("productsInfo");
  try {
    const products = await fetchJson(`${API_BASE}/products`);
    info.textContent = `${products.length} product(s)`;
    const tbody = document.querySelector("#productsTable tbody");
    tbody.innerHTML = "";
    products.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img class="thumb" src="${p.images?.[0] || ""}" alt="" /></td>
        <td><strong>${p.name}</strong><div class="small">${p.category || ""}</div></td>
        <td>${p.price} EGP</td>
        <td id="stock-${p.id}">${p.stock}</td>
        <td>
          <div class="row">
            <input type="number" id="rest-${p.id}" min="1" placeholder="Amount" />
            <button class="btn" onclick="restockSingle(${p.id})">Restock</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    info.textContent = "Failed to load products";
    console.error(err);
  }
}

async function restockSingle(id) {
  try {
    const input = document.getElementById(`rest-${id}`);
    const amount = parseInt(input.value, 10);

    if (!amount || amount <= 0) 
      return alert("Enter a valid positive number");

    // call backend endpoint for restock + get updated product
    const result = await fetchJson(`${API_BASE}/restock/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    // update UI using actual updated stock
    document.getElementById(`stock-${id}`).textContent = result.product.stock;
    input.value = "";
    alert("Stock updated");
  } catch (err) {
    console.error(err);
    alert("Failed to restock: " + err.message);
  }
}


async function restockAllOutOfStock() {
  try {
    await fetchJson(`${API_BASE}/restock-all`, { method: "POST" });
    await loadProducts();
    alert("Restocked out-of-stock products");
  } catch (err) {
    console.error(err);
    alert("Failed restockAll: " + err.message);
  }
}

document.getElementById("reloadAll").addEventListener("click", () => {
  loadOrders();
  loadProducts();
});
document.getElementById("restockAll").addEventListener("click", restockAllOutOfStock);

// initial load
loadOrders();
loadProducts();
