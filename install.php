<?php
// InfinityFree o'rnatish yordamchisi
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = $_POST['db_host'];
    $dbUser = $_POST['db_user'];
    $dbPass = $_POST['db_pass'];
    $dbName = $_POST['db_name'];
    $siteUrl = $_POST['site_url'];
    
    // Config faylini yangilash
    $configContent = "<?php
// Database configuration - INFINITYFREE
define('DB_HOST', '$dbHost');
define('DB_USER', '$dbUser');
define('DB_PASS', '$dbPass');
define('DB_NAME', '$dbName');
define('ADMIN_PASSWORD', '123');
define('BOT_TOKEN', '8563341646:AAG4Y-jxTJpv3IBUSMUlmgTgRu83ornbW2c');
define('ADMIN_CHAT_ID', '');
define('SITE_URL', '$siteUrl');

function getDB() {
    static \$db = null;
    if (\$db === null) {
        \$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if (\$db->connect_error) {
            die(\"Connection failed: \" . \$db->connect_error);
        }
        \$db->set_charset(\"utf8mb4\");
    }
    return \$db;
}

function formatPrice(\$price) {
    return number_format(\$price, 0, ',', ' ') . \" so'm\";
}

function getFoods(\$category = null) {
    \$db = getDB();
    \$sql = \"SELECT * FROM foods WHERE status = 1\";
    if (\$category) {
        \$sql .= \" AND category = ?\";
        \$stmt = \$db->prepare(\$sql);
        \$stmt->bind_param(\"s\", \$category);
    } else {
        \$stmt = \$db->prepare(\$sql);
    }
    \$stmt->execute();
    return \$stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

function getFoodById(\$id) {
    \$db = getDB();
    \$stmt = \$db->prepare(\"SELECT * FROM foods WHERE id = ?\");
    \$stmt->bind_param(\"i\", \$id);
    \$stmt->execute();
    return \$stmt->get_result()->fetch_assoc();
}

function getCategories() {
    return ['Lavash', 'Burger', 'Pizza', 'Ichimliklar', 'Osh'];
}

function isAdmin() {
    return isset(\$_SESSION['admin']) && \$_SESSION['admin'] === true;
}

function redirect(\$url) {
    header(\"Location: \$url\");
    exit;
}

function sendTelegramMessage(\$chatId, \$message, \$replyMarkup = null) {
    \$url = \"https://api.telegram.org/bot\" . BOT_TOKEN . \"/sendMessage\";
    \$data = [
        'chat_id' => \$chatId,
        'text' => \$message,
        'parse_mode' => 'HTML'
    ];
    if (\$replyMarkup) {
        \$data['reply_markup'] = json_encode(\$replyMarkup);
    }
    
    \$ch = curl_init();
    curl_setopt(\$ch, CURLOPT_URL, \$url);
    curl_setopt(\$ch, CURLOPT_POST, 1);
    curl_setopt(\$ch, CURLOPT_POSTFIELDS, http_build_query(\$data));
    curl_setopt(\$ch, CURLOPT_RETURNTRANSFER, true);
    \$result = curl_exec(\$ch);
    curl_close(\$ch);
    return \$result;
}

function notifyAdmin(\$message) {
    if (!empty(ADMIN_CHAT_ID)) {
        sendTelegramMessage(ADMIN_CHAT_ID, \$message);
    }
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
";
    
    file_put_contents('config.php', $configContent);
    
    // Database jadvallarini yaratish
    $db = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    if ($db->connect_error) {
        $error = "Bazaga ulanishda xatolik: " . $db->connect_error;
    } else {
        $db->set_charset("utf8mb4");
        
        // Foods table
        $db->query("CREATE TABLE IF NOT EXISTS foods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image VARCHAR(255),
            category ENUM('Lavash', 'Burger', 'Pizza', 'Ichimliklar', 'Osh') NOT NULL,
            status TINYINT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
        
        // Orders table
        $db->query("CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            customer_address TEXT,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )");
        
        // Order items table
        $db->query("CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            food_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )");
        
        // Insert sample foods
        $db->query("INSERT IGNORE INTO foods (name, description, price, category) VALUES
            ('Tovuqli Lavash', 'Yumshoq lavash, tovuq go‘shti, pomidor, bodring, sous', 25000, 'Lavash'),
            ('Go‘shtli Lavash', 'Yumshoq lavash, mol go‘shti, pomidor, bodring, sous', 28000, 'Lavash'),
            ('Cheeseburger', 'Bulochka, mol go‘shti kotleti, pishloq, pomidor, salat bargi', 22000, 'Burger'),
            ('Chicken Burger', 'Bulochka, tovuq kotleti, pishloq, sous, salat', 20000, 'Burger'),
            ('Pepperoni Pizza', 'Pizza xamir, pomidor sous, pepperoni kolbasasi, pishloq', 45000, 'Pizza'),
            ('Margarita Pizza', 'Pizza xamir, pomidor sous, mozzarella pishlog‘i', 38000, 'Pizza'),
            ('Coca-Cola 0.5L', 'Sovuq gazli ichimlik', 8000, 'Ichimliklar'),
            ('Fanta 0.5L', 'Sovuq gazli ichimlik', 8000, 'Ichimliklar'),
            ('Osh', 'Uzbek milliy taomi - guruch, sabzi, go‘sht', 35000, 'Osh'),
            ('Choy', 'Issiq qora choy', 3000, 'Ichimliklar')");
        
        $success = "O'rnatish muvaffaqiyatli yakunlandi!";
    }
}
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InfinityFree O'rnatish</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        h1 { color: #ff6b6b; margin-bottom: 10px; }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }
        button {
            width: 100%;
            padding: 15px;
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success { background: #d4edda; color: #155724; }
        .alert-error { background: #f8d7da; color: #721c24; }
        .instructions {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #004085;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 InfinityFree O'rnatish</h1>
        
        <div class="instructions">
            <strong>Qo'llanma:</strong>
            <ol>
                <li>InfinityFree da hisob oching</li>
                <li>MySQL Database yarating</li>
                <li>Quyidagi ma'lumotlarni kiriting:
                    <ul>
                        <li><strong>Host:</strong> sqlXXX.epizy.com</li>
                        <li><strong>User:</strong> epiz_XXXXXX</li>
                        <li><strong>Database:</strong> epiz_XXXXXX_XXX</li>
                    </ul>
                </li>
                <li>Sayt URL: https://sizning-sayt.infinityfreeapp.com</li>
            </ol>
        </div>
        
        <?php if (isset($success)): ?>
        <div class="alert alert-success">
            ✅ <?php echo $success; ?><br><br>
            <a href="index.php" style="color: #155724; font-weight: bold;">Saytga o'tish</a>
        </div>
        <?php endif; ?>
        
        <?php if (isset($error)): ?>
        <div class="alert alert-error">❌ <?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label>MySQL Host</label>
                <input type="text" name="db_host" placeholder="sqlXXX.epizy.com" required>
            </div>
            
            <div class="form-group">
                <label>MySQL Username</label>
                <input type="text" name="db_user" placeholder="epiz_XXXXXX" required>
            </div>
            
            <div class="form-group">
                <label>MySQL Password</label>
                <input type="password" name="db_pass" required>
            </div>
            
            <div class="form-group">
                <label>Database Name</label>
                <input type="text" name="db_name" placeholder="epiz_XXXXXX_food" required>
            </div>
            
            <div class="form-group">
                <label>Sayt URL</label>
                <input type="url" name="site_url" placeholder="https://sizning-sayt.infinityfreeapp.com" required>
            </div>
            
            <button type="submit">O'rnatish</button>
        </form>
    </div>
</body>
</html>
