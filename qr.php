<?php
// Simple QR code generator using Google Chart API
$ip = '10.14.86.218';
$url = "http://$ip/food/";
$qrUrl = "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" . urlencode($url);
?>
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Kod - Food Delivery</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            color: white;
        }
        .container {
            text-align: center;
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { margin-bottom: 10px; }
        .qr-code {
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
        }
        .url {
            font-size: 18px;
            color: #ff6b6b;
            word-break: break-all;
            margin: 20px 0;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 10px;
        }
        .instructions {
            margin-top: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍔 Food Delivery</h1>
        <p>Telefoningiz bilan skanerlang</p>
        
        <div class="qr-code">
            <img src="<?php echo $qrUrl; ?>" alt="QR Code" width="300" height="300">
        </div>
        
        <div class="url">
            <?php echo $url; ?>
        </div>
        
        <div class="instructions">
            <p>📱 Kamera ilovasi orqali QR kodni skanerlang</p>
            <p>yoki havolani qo'lda kiriting</p>
        </div>
        
        <a href="index.php" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 25px;">Saytga o'tish</a>
    </div>
</body>
</html>
