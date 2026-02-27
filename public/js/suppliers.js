// public/js/suppliers.js

document.addEventListener('DOMContentLoaded', () => {
    fetchSuppliers();
});

// 1. Fetch the Supplier Performance Data
async function fetchSuppliers() {
    try {
        const response = await fetch('http://localhost:3000/api/suppliers/performance');
        const result = await response.json();

        if (result.success) {
            renderSuppliersTable(result.data);
        }
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
}

// 2. Render the Table
function renderSuppliersTable(suppliers) {
    const tableBody = document.getElementById('supplier-table-body');
    tableBody.innerHTML = '';

    if (suppliers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No suppliers found.</td></tr>`;
        return;
    }

    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table__cell">#${supplier.supplier_id}</td>
            <td class="table__cell"><strong>${supplier.supplier_name}</strong></td>
            <td class="table__cell">
                ${supplier.contact_person}<br>
                <small style="color: gray;">${supplier.phone}</small>
            </td>
            <td class="table__cell">
                <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                    ${supplier.total_products_supplied}
                </span>
            </td>
            <td class="table__cell" style="color: var(--color-success); font-weight: bold;">
                ৳${parseFloat(supplier.total_revenue_generated).toFixed(2)}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// --- Modal & Form Logic ---
const modal = document.getElementById('addSupplierModal');
const btnOpenModal = document.getElementById('btn-add-supplier');
const btnCloseModal = document.getElementById('btn-close-modal');
const addSupplierForm = document.getElementById('add-supplier-form');

btnOpenModal.addEventListener('click', () => modal.classList.add('modal--active'));
btnCloseModal.addEventListener('click', () => modal.classList.remove('modal--active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('modal--active');
});

// 3. Handle Form Submission (POST Request)
addSupplierForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newSupplierData = {
        supplier_name: document.getElementById('sup_name').value,
        contact_person: document.getElementById('sup_contact').value,
        email: document.getElementById('sup_email').value,
        phone: document.getElementById('sup_phone').value,
        address_line1: document.getElementById('sup_address').value,
        city: document.getElementById('sup_city').value,
        state: document.getElementById('sup_state').value,
        postal_code: document.getElementById('sup_postal').value,
        country: 'Bangladesh' // Hardcoded for this project
    };

    try {
        const response = await fetch('http://localhost:3000/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSupplierData)
        });

        const result = await response.json();

        if (result.success) {
            modal.classList.remove('modal--active');
            addSupplierForm.reset();
            fetchSuppliers(); // Refresh the table
            alert('Supplier added successfully!');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Failed to connect to the server.');
    }
});