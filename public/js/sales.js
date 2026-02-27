// public/js/sales.js

let availableProducts = [];
let cart = []; // This array acts as our temporary state

document.addEventListener('DOMContentLoaded', () => {
    fetchAvailableProducts();
});

// 1. Fetch products from the database
async function fetchAvailableProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const result = await response.json();
        if (result.success) {
            availableProducts = result.data;
            renderProductList();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// 2. Render the left side (Product List)
function renderProductList() {
    const listContainer = document.getElementById('pos-product-list');
    listContainer.innerHTML = '';

    availableProducts.forEach(product => {
        // Don't show products that are out of stock
        if (product.stock_quantity <= 0) return; 

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div>
                <strong>${product.product_name}</strong><br>
                <small style="color: gray;">Stock: ${product.stock_quantity} | ৳${product.unit_price}</small>
            </div>
            <button class="btn btn--primary" style="padding: 5px 15px;" onclick="addToCart(${product.product_id})">Add</button>
        `;
        listContainer.appendChild(card);
    });
}

// 3. Add to Cart Logic
window.addToCart = function(productId) {
    const product = availableProducts.find(p => p.product_id === productId);
    
    // Check if it's already in the cart
    const existingItem = cart.find(item => item.product_id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock_quantity) {
            existingItem.quantity += 1;
        } else {
            alert("Not enough stock!");
        }
    } else {
        cart.push({
            product_id: product.product_id,
            product_name: product.product_name,
            unit_price: product.unit_price,
            quantity: 1,
            discount: 0
        });
    }
    renderCart();
};

// 4. Render the right side (The Cart)
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    let subtotal = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color: gray;">Cart is empty</p>';
        document.getElementById('cart-tax').innerText = '৳0.00';
        document.getElementById('cart-total').innerText = '৳0.00';
        return;
    }

    cartContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const lineTotal = item.unit_price * item.quantity;
        subtotal += lineTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <strong>${item.product_name}</strong><br>
                <small>৳${item.unit_price} x ${item.quantity}</small>
            </div>
            <div>
                <strong>৳${lineTotal.toFixed(2)}</strong>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left: 10px;">X</button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    // Calculate Tax and Total (Matching the Node.js backend logic)
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    document.getElementById('cart-tax').innerText = `৳${tax.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `৳${total.toFixed(2)}`;
}

// Remove from cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    renderCart();
};

// 5. Checkout (Trigger the MySQL Transaction)
document.getElementById('btn-checkout').addEventListener('click', async () => {
    if (cart.length === 0) {
        return alert('Cart is empty!');
    }

    try {
        const response = await fetch('http://localhost:3000/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                payment_method: 'cash', // Defaulting to cash for MVP
                items: cart
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Sale completed successfully! Transaction ID: ' + result.data.sale.sale_reference);
            cart = []; // Empty the cart
            renderCart();
            fetchAvailableProducts(); // Refresh stock numbers
        } else {
            alert('Checkout failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error during checkout:', error);
    }
});