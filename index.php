<?php
require_once 'config.php';

$category = isset($_GET['category']) ? $_GET['category'] : null;
$foods = getFoods($category);
$categories = getCategories();
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Food Delivery - Bosh Sahifa</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <div class="nav">
                <h1><a href="index.php">🍔 Food Delivery</a></h1>
                <div class="nav-links">
                    <a href="index.php">Bosh Sahifa</a>
                    <a href="orders.php">Buyurtmalarim</a>
                    <a href="admin.php">Admin</a>
                    <div class="cart-icon" onclick="toggleCart()">
                        🛒 Savat
                        <span class="cart-count" id="cartCount">0</span>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="categories">
        <div class="container">
            <div class="category-list">
                <button class="category-btn <?php echo !$category ? 'active' : ''; ?>" 
                        onclick="window.location.href='index.php'">
                    Hammasi
                </button>
                <?php foreach ($categories as $cat): ?>
                <button class="category-btn <?php echo $category === $cat ? 'active' : ''; ?>" 
                        onclick="window.location.href='?category=<?php echo urlencode($cat); ?>'">
                    <?php echo htmlspecialchars($cat); ?>
                </button>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <main class="container">
        <div class="food-grid">
            <?php foreach ($foods as $food): ?>
            <div class="food-card">
                <div class="food-image">
                    🍽️
                </div>
                <div class="food-info">
                    <div class="food-name"><?php echo htmlspecialchars($food['name']); ?></div>
                    <div class="food-description"><?php echo htmlspecialchars($food['description']); ?></div>
                    <div class="food-footer">
                        <div class="food-price"><?php echo formatPrice($food['price']); ?></div>
                        <button class="add-to-cart" onclick="addToCart(<?php echo $food['id']; ?>, '<?php echo htmlspecialchars(addslashes($food['name'])); ?>', <?php echo $food['price']; ?>)">
                            Savatga
                        </button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <?php if (empty($foods)): ?>
        <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3>Bu kategoriyada taomlar yo'q</h3>
        </div>
        <?php endif; ?>
    </main>

    <!-- Cart Sidebar -->
    <div class="overlay" id="overlay" onclick="toggleCart()"></div>
    <div class="cart-sidebar" id="cartSidebar">
        <div class="cart-header">
            <h2>🛒 Savat</h2>
            <button class="close-cart" onclick="toggleCart()">×</button>
        </div>
        <div class="cart-items" id="cartItems">
            <!-- Cart items will be loaded here -->
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Jami:</span>
                <span id="cartTotal">0 so'm</span>
            </div>
            <button class="checkout-btn" onclick="goToCheckout()">
                Buyurtma berish
            </button>
        </div>
    </div>

    <script>
        // Cart functionality
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
                        <p>Taomlarni qo'shing</p>
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
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                        </div>
                        <div class="remove-item" onclick="removeFromCart(${item.id})">🗑️</div>
                    </div>
                `).join('');
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = formatPrice(total);
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
            
            // Show cart
            document.getElementById('cartSidebar').classList.add('open');
            document.getElementById('overlay').classList.add('show');
        }

        function updateQuantity(id, change) {
            const item = cart.find(item => item.id === id);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromCart(id);
                } else {
                    saveCart();
                    updateCartUI();
                }
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

        function toggleCart() {
            document.getElementById('cartSidebar').classList.toggle('open');
            document.getElementById('overlay').classList.toggle('show');
        }

        function goToCheckout() {
            if (cart.length === 0) {
                alert('Savat bo\'sh!');
                return;
            }
            window.location.href = 'checkout.php';
        }

        function formatPrice(price) {
            return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
        }

        // Initialize cart UI
        updateCartUI();
    </script>
</body>
</html>
