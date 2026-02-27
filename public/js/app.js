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
            <td class="table__cell">
                <button class="btn btn--primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="handleRestock(${product.product_id}, '${product.product_name}')">Restock</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- Modal Toggling Logic ---
const modal = document.getElementById("addProductModal");
const btnOpenModal = document.getElementById("btn-add-product");
const btnCloseModal = document.getElementById("btn-close-modal");
const addProductForm = document.getElementById("add-product-form");

// Show the modal
btnOpenModal.addEventListener("click", () => {
    modal.classList.add("modal--active");
});

// Hide the modal
btnCloseModal.addEventListener("click", () => {
    modal.classList.remove("modal--active");
});

// Hide the modal if the user clicks outside the white box
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("modal--active");
    }
});

// --- Form Submission Logic (The POST Request) ---
addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevents the browser from reloading the page

    // 1. Gather the data from the inputs
    const newProductData = {
        product_name: document.getElementById("input_name").value,
        sku: document.getElementById("input_sku").value,
        category: document.getElementById("input_category").value,
        unit: document.getElementById("input_unit").value,
        unit_price: parseFloat(document.getElementById("input_price").value),
        cost_price: parseFloat(document.getElementById("input_cost").value),
        stock_quantity: 0, // Starts at 0 until warehouse restocks it
        reorder_level: 10,
    };

    try {
        // 2. Send the POST request to your Node.js API
        const response = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newProductData),
        });

        const result = await response.json();

        // 3. Handle the response
        if (result.success) {
            // Close the modal, clear the form, and refresh the table!
            modal.classList.remove("modal--active");
            addProductForm.reset();
            fetchProducts();
            alert("Product added successfully!");
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Submission failed:", error);
        alert("Failed to connect to the server.");
    }
});


// --- Restock Logic (Triggers the MySQL Stored Procedure) ---
async function handleRestock(productId, productName) {
    // 1. Ask the user for the quantity using a native prompt
    const quantityInput = prompt(`How many units of "${productName}" are you adding to inventory?`);
    
    // 2. Validate the input
    const quantity = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
        if (quantityInput !== null) alert("Please enter a valid positive number.");
        return;
    }

    try {
        // 3. Send the POST request to the restock route you built earlier
        const response = await fetch('http://localhost:3000/api/products/restock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const result = await response.json();

        // 4. Handle response and refresh the UI instantly
        if (result.success) {
            fetchProducts(); // Instantly re-fetches data so you watch the stock number go up!
        } else {
            alert('Error restocking: ' + result.message);
        }
    } catch (error) {
        console.error('Restock failed:', error);
        alert('Failed to connect to the server.');
    }
}
