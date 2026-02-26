// public/js/app.js

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
});

async function fetchProducts() {
    try {
        // Hitting your Node.js API
        const response = await fetch("http://localhost:3000/api/products");
        const result = await response.json();

        if (result.success) {
            renderTable(result.data);
        } else {
            console.error("Failed to fetch products:", result.message);
        }
    } catch (error) {
        console.error("Error connecting to API:", error);
    }
}

function renderTable(products) {
    const tableBody = document.getElementById("product-table-body");
    tableBody.innerHTML = ""; // Clear loading state

    products.forEach((product) => {
        // Logic to determine the stock badge color
        let statusBadge = "";
        if (product.stock_quantity <= product.reorder_level) {
            statusBadge = `<span class="badge badge--critical">Low Stock</span>`;
        } else {
            statusBadge = `<span class="badge badge--healthy">Healthy</span>`;
        }

        // Creating the HTML row (This maps perfectly to JSX later)
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="table__cell">#${product.product_id}</td>
            <td class="table__cell"><strong>${product.product_name}</strong></td>
            <td class="table__cell">${product.sku}</td>
            <td class="table__cell">৳${parseFloat(product.unit_price).toFixed(2)}</td>
            <td class="table__cell">${product.stock_quantity}</td>
            <td class="table__cell">${statusBadge}</td>
        `;
        tableBody.appendChild(row);
    });
}
