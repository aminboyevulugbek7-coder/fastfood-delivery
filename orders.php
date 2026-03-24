<?php
require_once 'config.php';

$db = getDB();

// Search orders by phone
$search = isset($_GET['phone']) ? trim($_GET['phone']) : '';
$orders = [];

if ($search) {
    $stmt = $db->prepare("SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY created_at DESC");
    $searchParam = "%$search%";
    $stmt->bind_param("s", $searchParam);
    $stmt->execute();
    $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
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
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buyurtmalarim - Food Delivery</title>
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
                </div>
            </div>
        </div>
    </header>

    <main class="container" style="padding: 40px 20px;">
        <div class="admin-section">
            <h2>🔍 Buyurtmalarni qidirish</h2>
            <form method="GET" style="display: flex; gap: 10px; margin-bottom: 30px;">
                <input type="tel" name="phone" placeholder="Telefon raqamini kiriting" 
                       value="<?php echo htmlspecialchars($search); ?>" 
                       style="flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                <button type="submit" class="btn btn-primary">Qidirish</button>
            </form>

            <?php if ($search): ?>
                <?php if (empty($orders)): ?>
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3>Bu raqam bo'yicha buyurtmalar topilmadi</h3>
                </div>
                <?php else: ?>
                <h3 style="margin-bottom: 20px;">Topilgan buyurtmalar:</h3>
                <?php foreach ($orders as $order): 
                    $items = getOrderItems($order['id']);
                ?>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <strong>Buyurtma #<?php echo $order['id']; ?></strong>
                            <span class="status-badge status-<?php echo $order['status']; ?>" style="margin-left: 10px;">
                                <?php echo getStatusText($order['status']); ?>
                            </span>
                        </div>
                        <div style="color: #666; font-size: 14px;">
                            <?php echo date('d.m.Y H:i', strtotime($order['created_at'])); ?>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong>Ism:</strong> <?php echo htmlspecialchars($order['customer_name']); ?><br>
                        <strong>Telefon:</strong> <?php echo htmlspecialchars($order['customer_phone']); ?><br>
                        <strong>Manzil:</strong> <?php echo htmlspecialchars($order['customer_address']); ?>
                    </div>
                    
                    <table class="data-table" style="margin-bottom: 15px;">
                        <thead>
                            <tr>
                                <th>Taom</th>
                                <th>Soni</th>
                                <th>Narxi</th>
                                <th>Jami</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($items as $item): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($item['food_name']); ?></td>
                                <td><?php echo $item['quantity']; ?></td>
                                <td><?php echo formatPrice($item['price']); ?></td>
                                <td><?php echo formatPrice($item['price'] * $item['quantity']); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    
                    <div style="text-align: right; font-size: 18px; font-weight: bold; color: #ff6b6b;">
                        Jami: <?php echo formatPrice($order['total_amount']); ?>
                    </div>
                </div>
                <?php endforeach; ?>
                <?php endif; ?>
            <?php else: ?>
            <div class="empty-state">
                <div class="empty-state-icon">📱</div>
                <h3>Buyurtmalarni ko'rish uchun telefon raqamingizni kiriting</h3>
            </div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
