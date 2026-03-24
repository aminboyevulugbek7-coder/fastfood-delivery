-- Food Delivery Database Schema

CREATE DATABASE IF NOT EXISTS food_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_delivery;

-- Foods table
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    category ENUM('Lavash', 'Burger', 'Pizza', 'Ichimliklar', 'Osh') NOT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id)
);

-- Insert sample foods
INSERT INTO foods (name, description, price, image, category) VALUES
('Tovuqli Lavash', 'Yumshoq lavash, tovuq go‘shti, pomidor, bodring, sous', 25000, 'lavash_tovuq.jpg', 'Lavash'),
('Go‘shtli Lavash', 'Yumshoq lavash, mol go‘shti, pomidor, bodring, sous', 28000, 'lavash_gosht.jpg', 'Lavash'),
('Cheeseburger', 'Bulochka, mol go‘shti kotleti, pishloq, pomidor, salat bargi', 22000, 'cheeseburger.jpg', 'Burger'),
('Chicken Burger', 'Bulochka, tovuq kotleti, pishloq, sous, salat', 20000, 'chicken_burger.jpg', 'Burger'),
('Pepperoni Pizza', 'Pizza xamir, pomidor sous, pepperoni kolbasasi, pishloq', 45000, 'pizza_pepperoni.jpg', 'Pizza'),
('Margarita Pizza', 'Pizza xamir, pomidor sous, mozzarella pishlog‘i', 38000, 'pizza_margarita.jpg', 'Pizza'),
('Coca-Cola 0.5L', 'Sovuq gazli ichimlik', 8000, 'cola.jpg', 'Ichimliklar'),
('Fanta 0.5L', 'Sovuq gazli ichimlik', 8000, 'fanta.jpg', 'Ichimliklar'),
('Osh', 'Uzbek milliy taomi - guruch, sabzi, go‘sht', 35000, 'osh.jpg', 'Osh'),
('Choy', 'Issiq qora choy', 3000, 'choy.jpg', 'Ichimliklar');
