// public/js/customers.js

document.addEventListener('DOMContentLoaded', () => {
    fetchCustomers();
});

// 1. Fetch the Customer Data
async function fetchCustomers() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        const result = await response.json();

        if (result.success) {
            renderCustomersTable(result.data);
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

// 2. Render the Table
function renderCustomersTable(customers) {
    const tableBody = document.getElementById('customer-table-body');
    tableBody.innerHTML = '';

    if (customers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No customers found.</td></tr>`;
        return;
    }

    customers.forEach(customer => {
        // Format the customer type badge nicely
        let typeColor = '#e5e7eb'; // default gray
        if (customer.customer_type === 'wholesale') typeColor = '#dbeafe'; // light blue
        if (customer.customer_type === 'student') typeColor = '#fef08a'; // light yellow

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table__cell">#${customer.customer_id}</td>
            <td class="table__cell"><strong>${customer.first_name} ${customer.last_name}</strong></td>
            <td class="table__cell">
                ${customer.phone}<br>
                <small style="color: gray;">${customer.email || 'N/A'}</small>
            </td>
            <td class="table__cell">
                <span style="background: ${typeColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; text-transform: capitalize;">
                    ${customer.customer_type}
                </span>
            </td>
            <td class="table__cell">${customer.city || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// --- Modal & Form Logic ---
const modal = document.getElementById('addCustomerModal');
const btnOpenModal = document.getElementById('btn-add-customer');
const btnCloseModal = document.getElementById('btn-close-modal');
const addCustomerForm = document.getElementById('add-customer-form');

btnOpenModal.addEventListener('click', () => modal.classList.add('modal--active'));
btnCloseModal.addEventListener('click', () => modal.classList.remove('modal--active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('modal--active');
});

// 3. Handle Form Submission (POST Request)
addCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newCustomerData = {
        first_name: document.getElementById('cust_first_name').value,
        last_name: document.getElementById('cust_last_name').value,
        email: document.getElementById('cust_email').value || null,
        phone: document.getElementById('cust_phone').value,
        customer_type: document.getElementById('cust_type').value,
        city: document.getElementById('cust_city').value || null,
        country: 'Bangladesh' 
    };

    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCustomerData)
        });

        const result = await response.json();

        if (result.success) {
            modal.classList.remove('modal--active');
            addCustomerForm.reset();
            fetchCustomers(); // Refresh the table
            alert('Customer registered successfully!');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Submission failed:', error);
        alert('Failed to connect to the server.');
    }
});