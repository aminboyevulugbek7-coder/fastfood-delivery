<?php
require_once 'config.php';

// Check if running in browser for manual update
if (isset($_GET['get_updates'])) {
    // Get last processed update ID from file
    $offsetFile = __DIR__ . '/bot_offset.txt';
    $offset = 0;
    if (file_exists($offsetFile)) {
        $offset = (int)file_get_contents($offsetFile);
    }
    
    // Long polling method - only get new updates
    $url = "https://api.telegram.org/bot" . BOT_TOKEN . "/getUpdates";
    if ($offset > 0) {
        $url .= "?offset=" . ($offset + 1);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    
    $updates = json_decode($result, true);
    $processedCount = 0;
    
    if ($updates['ok'] && !empty($updates['result'])) {
        foreach ($updates['result'] as $update) {
            processUpdate($update);
            $processedCount++;
            // Save the last update ID
            file_put_contents($offsetFile, $update['update_id']);
        }
    }
    
    echo "Updates processed: " . $processedCount;
    exit;
}

// Get update from Telegram (webhook method)
$update = json_decode(file_get_contents('php://input'), true);

if (!$update) {
    die('No update received');
}

processUpdate($update);

function processUpdate($update) {

// Handle callback queries
if (isset($update['callback_query'])) {
    $callbackId = $update['callback_query']['id'];
    $chatId = $update['callback_query']['message']['chat']['id'];
    $data = $update['callback_query']['data'];
    
    if ($data === 'order_food') {
        // Server IP address
        $serverIp = '10.14.86.218';
        $siteUrl = "http://$serverIp/food/?chat_id=$chatId";
        
        // Simple text with URL
        $message = "🍔 Ovqat buyurtma berish uchun havolani bosing:\n\n";
        $message .= "$siteUrl\n\n";
        $message .= "📱 Havolani bosib saytga o'ting va buyurtma bering!";
        
        sendTelegramMessage($chatId, $message);
    }
    
    // Answer callback
    $url = "https://api.telegram.org/bot" . BOT_TOKEN . "/answerCallbackQuery";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(['callback_query_id' => $callbackId]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

// Handle messages
if (isset($update['message'])) {
    $chatId = $update['message']['chat']['id'];
    $text = $update['message']['text'] ?? '';
    
    if ($text === '/start') {
        $welcomeMessage = "👋 Assalomu alaykum!\n\n";
        $welcomeMessage .= "🍔 Food Delivery botiga xush kelibsiz!\n\n";
        $welcomeMessage .= "Bu yerda siz mazali taomlarga buyurtma berishingiz mumkin.\n\n";
        $welcomeMessage .= "📍 Manzil: Toshkent shahri\n";
        $welcomeMessage .= "📞 Telefon: +998 90 123 45 67\n\n";
        $welcomeMessage .= "Ovqat buyurtma berish uchun tugmani bosing:";
        
        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '🍽️ Ovqat buyurtma berish', 'callback_data' => 'order_food']
                ]
            ]
        ];
        
        sendTelegramMessage($chatId, $welcomeMessage, $keyboard);
    }
    
    // Save chat ID for admin
    if ($text === '/myid') {
        sendTelegramMessage($chatId, "Sizning Chat ID: <code>$chatId</code>");
    }
}
}

echo 'OK';
