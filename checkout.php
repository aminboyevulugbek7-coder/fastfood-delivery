<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);
    $latitude = $_POST['latitude'] ?? '';
    $longitude = $_POST['longitude'] ?? '';
    $chatId = $_POST['chat_id'] ?? '';
    $cart = json_decode($_POST['cart'], true);
    
    if (empty($name) || empty($phone) || empty($cart)) {
        $error = "Barcha maydonlarni to'ldiring!";
    } else {
        $db = getDB();
        
        // Calculate total
        $total = 0;
        foreach ($cart as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        
        // Create order
        $stmt = $db->prepare("INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssd", $name, $phone, $address, $total);
        $stmt->execute();
        $orderId = $db->insert_id;
        
        // Add order items
        $stmt = $db->prepare("INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($cart as $item) {
            $stmt->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $item['price']);
            $stmt->execute();
        }
        
        // Send Telegram notification
        if (!empty($chatId)) {
            $message = "✅ <b>Buyurtma qabul qilindi!</b>\n\n";
            $message .= "📋 Buyurtma raqami: <b>#$orderId</b>\n";
            $message .= "👤 Ism: <b>$name</b>\n";
            $message .= "📞 Telefon: <b>$phone</b>\n";
            $message .= "📍 Manzil: <b>$address</b>\n\n";
            
            if (!empty($latitude) && !empty($longitude)) {
                $message .= "🗺 <a href='https://www.google.com/maps?q=$latitude,$longitude'>Lokatsiyani ko'rish</a>\n\n";
            }
            
            $message .= "🛒 Buyurtma:\n";
            foreach ($cart as $item) {
                $itemTotal = $item['price'] * $item['quantity'];
                $message .= "• {$item['name']} x{$item['quantity']} = " . number_format($itemTotal, 0, ',', ' ') . " so'm\n";
            }
            $message .= "\n💰 Jami: <b>" . number_format($total, 0, ',', ' ') . " so'm</b>";
            
            sendTelegramMessage($chatId, $message);
        }
        
        // Notify admin
        $adminMessage = "🆕 <b>Yangi buyurtma!</b>\n\n";
        $adminMessage .= "📋 Buyurtma raqami: <b>#$orderId</b>\n";
        $adminMessage .= "👤 Ism: <b>$name</b>\n";
        $adminMessage .= "📞 Telefon: <b>$phone</b>\n";
        $adminMessage .= "📍 Manzil: <b>$address</b>\n\n";
        
        if (!empty($latitude) && !empty($longitude)) {
            $adminMessage .= "🗺 <a href='https://www.google.com/maps?q=$latitude,$longitude'>Lokatsiyani ko'rish</a>\n\n";
        }
        
        $adminMessage .= "💰 Jami: <b>" . number_format($total, 0, ',', ' ') . " so'm</b>";
        
        notifyAdmin($adminMessage);
        
        $success = "Buyurtma qabul qilindi! Buyurtma raqami: #" . $orderId;
    }
}
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buyurtma berish - Food Delivery</title>
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
                </div>
            </div>
        </div>
    </header>

    <main class="container" style="padding: 40px 20px;">
        <?php if (isset($success)): ?>
        <div class="alert alert-success" style="max-width: 500px; margin: 0 auto 20px;">
            <?php echo $success; ?>
            <br><br>
            <a href="orders.php" class="btn btn-primary">Buyurtmalarni ko'rish</a>
        </div>
        <?php else: ?>
        
        <?php if (isset($error)): ?>
        <div class="alert alert-error" style="max-width: 500px; margin: 0 auto 20px;">
            <?php echo $error; ?>
        </div>
        <?php endif; ?>

        <div class="checkout-form">
            <h2 style="text-align: center; margin-bottom: 30px;">📝 Buyurtma berish</h2>
            
            <form method="POST" id="checkoutForm">
                <div class="form-group">
                    <label>Ismingiz *</label>
                    <input type="text" name="name" required placeholder="Ismingizni kiriting">
                </div>
                
                <div class="form-group">
                    <label>Telefon raqamingiz *</label>
                    <input type="tel" name="phone" required placeholder="+998 XX XXX XX XX">
                </div>
                
                <div class="form-group">
                    <label>Yetkazib berish manzili *</label>
                    <textarea name="address" rows="3" required placeholder="Manzilingizni kiriting"></textarea>
                </div>
                
                <div class="form-group">
                    <label>📍 Lokatsiya yuborish</label>
                    <button type="button" class="btn btn-secondary" onclick="getLocation()" style="width: auto; padding: 10px 20px;">
                        📍 Lokatsiyani olish
                    </button>
                    <div id="locationInfo" style="margin-top: 10px; color: #666; font-size: 14px;"></div>
                    <input type="hidden" name="latitude" id="latitude">
                    <input type="hidden" name="longitude" id="longitude">
                </div>
                
                <div class="form-group">
                    <label>Buyurtma summasi:</label>
                    <div id="orderTotal" style="font-size: 24px; font-weight: bold; color: #ff6b6b;">0 so'm</div>
                </div>
                
                <input type="hidden" name="cart" id="cartData">
                <input type="hidden" name="chat_id" id="chatId" value="<?php echo htmlspecialchars($_GET['chat_id'] ?? ''); ?>">
                
                <button type="submit" class="submit-btn">Buyurtma berish</button>
                <a href="index.php" class="btn btn-secondary" style="width: 100%; margin-top: 10px; text-align: center;">Orqaga</a>
            </form>
        </div>
        <?php endif; ?>
    </main>

    <script>
        // Load cart and calculate total
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0 && !document.querySelector('.alert-success')) {
            alert('Savat bo\'sh!');
            window.location.href = 'index.php';
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('orderTotal').textContent = new Intl.NumberFormat('uz-UZ').format(total) + " so'm";
        document.getElementById('cartData').value = JSON.stringify(cart);
        
        // Clear cart after successful order
        <?php if (isset($success)): ?>
        localStorage.removeItem('cart');
        <?php endif; ?>
        
        // Get location
        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        document.getElementById('latitude').value = position.coords.latitude;
                        document.getElementById('longitude').value = position.coords.longitude;
                        document.getElementById('locationInfo').innerHTML = 
                            '✅ Lokatsiya olindi!<br>Lat: ' + position.coords.latitude.toFixed(6) + 
                            '<br>Lng: ' + position.coords.longitude.toFixed(6);
                    },
                    function(error) {
                        document.getElementById('locationInfo').innerHTML = '❌ Xatolik: ' + error.message;
                    }
                );
            } else {
                document.getElementById('locationInfo').innerHTML = '❌ Brauzer lokatsiyani qo\'llab-quvvatlamaydi';
            }
        }
    </script>
</body>
</html>
