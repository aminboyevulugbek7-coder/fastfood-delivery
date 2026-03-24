// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let foods = [];

// Get chat_id from URL
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('chat_id');
if (chatId) {
    localStorage.setItem('chatId', chatId);
}

// Load foods on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFoods();
    updateCartUI();
});

async function loadFoods() {
    try {
        const response = await fetch('/api/foods');
        foods = await response.json();
        renderFoods(foods);
        renderCategories();
    } catch (err) {
        console.error('Error loading foods:', err);
    }
}

function renderFoods(foodList) {
    const grid = document.getElementById('foodGrid');
    grid.innerHTML = foodList.map(food => `
        <div class="food-card">
            <div class="food-image">🍽️</div>
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-description">${food.description || ''}</div>
                <div class="food-footer">
                    <div class="food-price">${formatPrice(food.price)}</div>
                    <button class="add-to-cart" onclick="addToCart('${food._id}', '${food.name}', ${food.price})">
                        Savatga
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const categories = [...new Set(foods.map(f => f.category))];
    const list = document.getElementById('categoryList');
    list.innerHTML = `
        <button class="category-btn active" onclick="filterFoods()">Hammasi</button>
        ${categories.map(cat => `
            <button class="category-btn" onclick="filterFoods('${cat}')">${cat}</button>
        `).join('')}
    `;
}

function filterFoods(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === (category || 'Hammasi'));
    });
    
    if (category) {
        renderFoods(foods.filter(f => f.category === category));
    } else {
        renderFoods(foods);
    }
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>Savat bo'sh</h3>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">🍽️</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="remove-item" onclick="removeFromCart('${item.id}')">🗑️</div>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
}

function goToCheckout() {
    if (cart.length === 0) {
        alert('Savat bo\'sh!');
        return;
    }
    window.location.href = '/checkout.html';
}

function formatPrice(price) {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}
