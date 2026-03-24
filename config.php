<?php
// Database configuration - LOCALHOST
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'food_delivery');

// Database configuration - INFINITYFREE (o'zgartiring)
// define('DB_HOST', 'sqlXXX.epizy.com'); // InfinityFree MySQL host
// define('DB_USER', 'epiz_XXXXXX'); // InfinityFree username
// define('DB_PASS', 'XXXXXX'); // InfinityFree password
// define('DB_NAME', 'epiz_XXXXXX_food'); // InfinityFree database name
define('ADMIN_PASSWORD', '123');
define('BOT_TOKEN', '8563341646:AAG4Y-jxTJpv3IBUSMUlmgTgRu83ornbW2c');
define('ADMIN_CHAT_ID', ''); // Admin chat ID ni keyin qo'shing

// Create database connection
function getDB() {
    static $db = null;
    if ($db === null) {
        $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($db->connect_error) {
            die("Connection failed: " . $db->connect_error);
        }
        $db->set_charset("utf8mb4");
    }
    return $db;
}

// Format price
function formatPrice($price) {
    return number_format($price, 0, ',', ' ') . " so'm";
}

// Get all foods
function getFoods($category = null) {
    $db = getDB();
    $sql = "SELECT * FROM foods WHERE status = 1";
    if ($category) {
        $sql .= " AND category = ?";
        $stmt = $db->prepare($sql);
        $stmt->bind_param("s", $category);
    } else {
        $stmt = $db->prepare($sql);
    }
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// Get food by ID
function getFoodById($id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM foods WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

// Get categories
function getCategories() {
    return ['Lavash', 'Burger', 'Pizza', 'Ichimliklar', 'Osh'];
}

// Check admin login
function isAdmin() {
    return isset($_SESSION['admin']) && $_SESSION['admin'] === true;
}

// Redirect function
function redirect($url) {
    header("Location: $url");
    exit;
}

// Send Telegram message
function sendTelegramMessage($chatId, $message, $replyMarkup = null) {
    $url = "https://api.telegram.org/bot" . BOT_TOKEN . "/sendMessage";
    $data = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    if ($replyMarkup) {
        $data['reply_markup'] = json_encode($replyMarkup);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

// Send Telegram notification to admin
function notifyAdmin($message) {
    if (!empty(ADMIN_CHAT_ID)) {
        sendTelegramMessage(ADMIN_CHAT_ID, $message);
    }
}

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
