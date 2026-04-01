const express = require('express');
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple JSON database file
const DB_FILE = path.join(__dirname, 'data.json');

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            categories: [
                { id: 1, name: 'Lavash', icon: '🌯' },
                { id: 2, name: 'Burger', icon: '🍔' },
                { id: 3, name: 'Pizza', icon: '🍕' },
                { id: 4, name: 'Ichimliklar', icon: '🥤' },
                { id: 5, name: 'Osh', icon: '🍚' }
            ],
            foods: [
                { id: 1, name: 'Tovuqli Lavash', description: 'Yumshoq lavash, tovuq goshti, pomidor, bodring, sous', price: 25000, category: 'Lavash', image: '' },
                { id: 2, name: 'Goshtli Lavash', description: 'Yumshoq lavash, mol goshti, pomidor, bodring, sous', price: 28000, category: 'Lavash', image: '' },
                { id: 3, name: 'Cheeseburger', description: 'Bulochka, mol goshti kotleti, pishloq, pomidor, salat bargi', price: 22000, category: 'Burger', image: '' },
                { id: 4, name: 'Chicken Burger', description: 'Bulochka, tovuq kotleti, pishloq, sous, salat', price: 20000, category: 'Burger', image: '' },
                { id: 5, name: 'Pepperoni Pizza', description: 'Pizza xamir, pomidor sous, pepperoni kolbasasi, pishloq', price: 45000, category: 'Pizza', image: '' },
                { id: 6, name: 'Margarita Pizza', description: 'Pizza xamir, pomidor sous, mozzarella pishlogi', price: 38000, category: 'Pizza', image: '' },
                { id: 7, name: 'Coca-Cola 0.5L', description: 'Sovuq gazli ichimlik', price: 8000, category: 'Ichimliklar', image: '' },
                { id: 8, name: 'Fanta 0.5L', description: 'Sovuq gazli ichimlik', price: 8000, category: 'Ichimliklar', image: '' },
                { id: 9, name: 'Osh', description: 'Uzbek milliy taomi - guruch, sabzi, gosht', price: 35000, category: 'Osh', image: '' },
                { id: 10, name: 'Choy', description: 'Issiq qora choy', price: 3000, category: 'Ichimliklar', image: '' }
            ],
            orders: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Routes
app.get('/api/categories', (req, res) => {
    const db = loadDB();
    res.json(db.categories || []);
});

app.get('/api/foods', (req, res) => {
    const db = loadDB();
    const { category } = req.query;
    let foods = db.foods;
    if (category) {
        foods = foods.filter(f => f.category === category);
    }
    res.json(foods);
});

app.get('/api/orders', (req, res) => {
    const db = loadDB();
    const { phone } = req.query;
    let orders = db.orders.sort((a, b) => b.id - a.id);
    if (phone) {
        orders = orders.filter(o => o.customerPhone && o.customerPhone.includes(phone));
    }
    res.json(orders);
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Mini App: http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📊 API: http://localhost:${PORT}/api/foods`);
});
