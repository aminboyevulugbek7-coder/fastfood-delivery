<?php
require_once 'config.php';

// Handle login
if (isset($_POST['login'])) {
    if ($_POST['password'] === ADMIN_PASSWORD) {
        $_SESSION['admin'] = true;
    } else {
        $loginError = "Noto'g'ri parol!";
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    unset($_SESSION['admin']);
    redirect('admin.php');
}

$db = getDB();
$activeTab = isset($_GET['tab']) ? $_GET['tab'] : 'orders';

// Handle order status update
if (isset($_POST['update_status']) && isAdmin()) {
    $orderId = $_POST['order_id'];
    $status = $_POST['status'];
    $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $orderId);
    $stmt->execute();
    redirect('admin.php?tab=orders');
}

// Handle food add/edit
if (isset($_POST['save_food']) && isAdmin()) {
    $id = $_POST['id'] ?? null;
    $name = trim($_POST['name']);
    $description = trim($_POST['description']);
    $price = floatval($_POST['price']);
    $category = $_POST['category'];
    
    if ($id) {
        // Update
        $stmt = $db->prepare("UPDATE foods SET name = ?, description = ?, price = ?, category = ? WHERE id = ?");
        $stmt->bind_param("ssdsi", $name, $description, $price, $category, $id);
    } else {
        // Insert
        $stmt = $db->prepare("INSERT INTO foods (name, description, price, category) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssds", $name, $description, $price, $category);
    }
    $stmt->execute();
    redirect('admin.php?tab=foods');
}

// Handle food delete
if (isset($_GET['delete_food']) && isAdmin()) {
    $id = $_GET['delete_food'];
    $stmt = $db->prepare("DELETE FROM foods WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    redirect('admin.php?tab=foods');
}

// Get data
$orders = [];
$foods = [];

if (isAdmin()) {
    // Get orders
    $result = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
    $orders = $result->fetch_all(MYSQLI_ASSOC);
    
    // Get foods
    $result = $db->query("SELECT * FROM foods ORDER BY category, name");
    $foods = $result->fetch_all(MYSQLI_ASSOC);
}

// Get order items
function getOrderItems($orderId) {
    $db = getDB();
    $stmt = $db->prepare("SELECT oi.*, f.name as food_name FROM order_items oi JOIN foods f ON oi.food_id = f.id WHERE oi.order_id = ?");
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// Get status text
function getStatusText($status) {
    $statuses = [
        'pending' => 'Kutilmoqda',
        'preparing' => 'Tayyorlanmoqda',
        'ready' => 'Tayyor',
        'delivered' => 'Yetkazildi'
    ];
    return $statuses[$status] ?? $status;
}

$categories = getCategories();
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Food Delivery</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="admin-header">
        <div class="container">
            <div class="nav">
                <h1><a href="index.php">🍔 Food Delivery</a></h1>
                <?php if (isAdmin()): ?>
                <div class="nav-links">
                    <a href="index.php">Saytga qaytish</a>
                    <a href="admin.php?logout=1">Chiqish</a>
                </div>
                <?php endif; ?>
            </div>
            <?php if (isAdmin()): ?>
            <div class="admin-nav">
                <a href="?tab=orders" class="<?php echo $activeTab === 'orders' ? 'active' : ''; ?>">📋 Buyurtmalar</a>
                <a href="?tab=foods" class="<?php echo $activeTab === 'foods' ? 'active' : ''; ?>">🍽️ Taomlar</a>
            </div>
            <?php endif; ?>
        </div>
    </header>

    <main class="container" style="padding: 40px 20px;">
        <?php if (!isAdmin()): ?>
        <!-- Login Form -->
        <div class="login-container">
            <h2>🔐 Admin Panel</h2>
            <?php if (isset($loginError)): ?>
            <div class="alert alert-error"><?php echo $loginError; ?></div>
            <?php endif; ?>
            <form method="POST">
                <div class="form-group">
                    <label>Parol</label>
                    <input type="password" name="password" required placeholder="Parolni kiriting">
                </div>
                <button type="submit" name="login" class="submit-btn">Kirish</button>
                <a href="index.php" class="btn btn-secondary" style="width: 100%; margin-top: 10px; text-align: center;">Bosh sahifa</a>
            </form>
        </div>
        
        <?php else: ?>
        
        <?php if ($activeTab === 'orders'): ?>
        <!-- Orders Tab -->
        <div class="admin-section">
            <h2>📋 Buyurtmalar</h2>
            <?php if (empty($orders)): ?>
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Hozircha buyurtmalar yo'q</h3>
            </div>
            <?php else: ?>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mijoz</th>
                        <th>Telefon</th>
                        <th>Buyurtma</th>
                        <th>Summa</th>
                        <th>Holat</th>
                        <th>Sana</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($orders as $order): 
                        $items = getOrderItems($order['id']);
                        $itemsList = array_map(function($item) {
                            return $item['food_name'] . ' x' . $item['quantity'];
                        }, $items);
                    ?>
                    <tr>
                        <td>#<?php echo $order['id']; ?></td>
                        <td><?php echo htmlspecialchars($order['customer_name']); ?></td>
                        <td><?php echo htmlspecialchars($order['customer_phone']); ?></td>
                        <td><?php echo htmlspecialchars(implode(', ', $itemsList)); ?></td>
                        <td><?php echo formatPrice($order['total_amount']); ?></td>
                        <td>
                            <span class="status-badge status-<?php echo $order['status']; ?>">
                                <?php echo getStatusText($order['status']); ?>
                            </span>
                        </td>
                        <td><?php echo date('d.m.Y H:i', strtotime($order['created_at'])); ?></td>
                        <td>
                            <form method="POST" style="display: flex; gap: 5px;">
                                <input type="hidden" name="order_id" value="<?php echo $order['id']; ?>">
                                <select name="status" class="form-control" style="padding: 5px;">
                                    <option value="pending" <?php echo $order['status'] === 'pending' ? 'selected' : ''; ?>>Kutilmoqda</option>
                                    <option value="preparing" <?php echo $order['status'] === 'preparing' ? 'selected' : ''; ?>>Tayyorlanmoqda</option>
                                    <option value="ready" <?php echo $order['status'] === 'ready' ? 'selected' : ''; ?>>Tayyor</option>
                                    <option value="delivered" <?php echo $order['status'] === 'delivered' ? 'selected' : ''; ?>>Yetkazildi</option>
                                </select>
                                <button type="submit" name="update_status" class="btn btn-primary" style="padding: 5px 10px;">Saqlash</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </div>
        
        <?php else: ?>
        <!-- Foods Tab -->
        <div class="admin-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>🍽️ Taomlar</h2>
                <a href="?tab=foods&edit=0" class="btn btn-primary">+ Yangi taom</a>
            </div>
            
            <?php if (isset($_GET['edit'])): 
                $editId = $_GET['edit'];
                $editFood = null;
                if ($editId > 0) {
                    foreach ($foods as $food) {
                        if ($food['id'] == $editId) {
                            $editFood = $food;
                            break;
                        }
                    }
                }
            ?>
            <!-- Food Form -->
            <form method="POST" class="checkout-form" style="max-width: 600px;">
                <h3><?php echo $editFood ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'; ?></h3>
                <input type="hidden" name="id" value="<?php echo $editFood['id'] ?? ''; ?>">
                
                <div class="form-group">
                    <label>Nomi *</label>
                    <input type="text" name="name" required 
                           value="<?php echo htmlspecialchars($editFood['name'] ?? ''); ?>">
                </div>
                
                <div class="form-group">
                    <label>Tavsif</label>
                    <textarea name="description" rows="3"><?php echo htmlspecialchars($editFood['description'] ?? ''); ?></textarea>
                </div>
                
                <div class="form-group">
                    <label>Narxi *</label>
                    <input type="number" name="price" required min="0" step="100"
                           value="<?php echo $editFood['price'] ?? ''; ?>">
                </div>
                
                <div class="form-group">
                    <label>Kategoriya *</label>
                    <select name="category" required>
                        <?php foreach ($categories as $cat): ?>
                        <option value="<?php echo $cat; ?>" 
                                <?php echo ($editFood['category'] ?? '') === $cat ? 'selected' : ''; ?>>
                            <?php echo $cat; ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                
                <button type="submit" name="save_food" class="submit-btn">Saqlash</button>
                <a href="?tab=foods" class="btn btn-secondary" style="width: 100%; margin-top: 10px; text-align: center;">Bekor qilish</a>
            </form>
            <?php else: ?>
            
            <?php if (empty($foods)): ?>
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <h3>Hozircha taomlar yo'q</h3>
            </div>
            <?php else: ?>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nomi</th>
                        <th>Kategoriya</th>
                        <th>Narxi</th>
                        <th>Holat</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($foods as $food): ?>
                    <tr>
                        <td><?php echo $food['id']; ?></td>
                        <td><?php echo htmlspecialchars($food['name']); ?></td>
                        <td><?php echo $food['category']; ?></td>
                        <td><?php echo formatPrice($food['price']); ?></td>
                        <td><?php echo $food['status'] ? 'Faol' : 'Nofaol'; ?></td>
                        <td>
                            <a href="?tab=foods&edit=<?php echo $food['id']; ?>" class="btn btn-edit" style="padding: 5px 10px;">Tahrirlash</a>
                            <a href="?delete_food=<?php echo $food['id']; ?>" 
                               class="btn btn-delete" 
                               style="padding: 5px 10px;"
                               onclick="return confirm('O\'chirishni xohlaysizmi?')">O'chirish</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
            <?php endif; ?>
        </div>
        <?php endif; ?>
        
        <?php endif; ?>
    </main>
</body>
</html>
