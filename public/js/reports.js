// public/js/reports.js

document.addEventListener('DOMContentLoaded', () => {
    fetchMonthlySummary();
    fetchBestSellers();
});

// 1. Fetch the Monthly Summary KPI Data
async function fetchMonthlySummary() {
    try {
        const response = await fetch('http://localhost:3000/api/sales/reports/monthly');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            // Get the most recent month's data (first item in the array)
            const currentMonth = result.data[0];
            
            document.getElementById('kpi-revenue').innerText = `৳${parseFloat(currentMonth.net_revenue).toFixed(2)}`;
            document.getElementById('kpi-transactions').innerText = currentMonth.total_transactions;
            document.getElementById('kpi-aov').innerText = `৳${parseFloat(currentMonth.avg_sale_value).toFixed(2)}`;
        } else {
            document.getElementById('kpi-revenue').innerText = '৳0.00';
            document.getElementById('kpi-transactions').innerText = '0';
        }
    } catch (error) {
        console.error('Error fetching monthly report:', error);
    }
}

// 2. Fetch the Best Selling Products Data
async function fetchBestSellers() {
    try {
        const response = await fetch('http://localhost:3000/api/sales/reports/best-sellers');
        const result = await response.json();

        if (result.success) {
            renderBestSellersTable(result.data);
        }
    } catch (error) {
        console.error('Error fetching best sellers:', error);
    }
}

// 3. Render the Table
function renderBestSellersTable(products) {
    const tableBody = document.getElementById('best-sellers-body');
    tableBody.innerHTML = '';

    if (products.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No sales data available yet.</td></tr>`;
        return;
    }

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="table__cell"><strong>#${index + 1}</strong></td>
            <td class="table__cell">${product.product_name}</td>
            <td class="table__cell">
                <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                    ${product.category}
                </span>
            </td>
            <td class="table__cell" style="font-weight: bold;">${product.total_quantity_sold}</td>
            <td class="table__cell" style="color: var(--color-success); font-weight: bold;">
                ৳${parseFloat(product.total_revenue_generated).toFixed(2)}
            </td>
        `;
        tableBody.appendChild(row);
    });
}