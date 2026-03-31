require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Faqat rasm fayllari ruxsat etilgan!'));
        }
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Socket.IO real-time connections
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);
    
    // Admin panelga ulanish
    socket.on('admin-join', () => {
        socket.join('admin-room');
        console.log('👨‍💼 Admin joined:', socket.id);
        // Hozirgi buyurtmalarni yuborish
        const db = loadDB();
        socket.emit('initial-orders', db.orders.sort((a, b) => b.id - a.id));
    });
    
    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

// Real-time xabar yuborish funksiyasi
function broadcastUpdate(event, data) {
    io.to('admin-room').emit(event, data);
    console.log(`📡 Broadcasted ${event} to admin-room`);
}

// Simple JSON database
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

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.get('/api/categories', (req, res) => {
    const db = loadDB();
    res.json(db.categories || []);
});

app.post('/api/categories', (req, res) => {
    const { name, icon } = req.body;
    const db = loadDB();
    if (!db.categories) db.categories = [];
    const newCategory = { id: Date.now(), name, icon };
    db.categories.push(newCategory);
    saveDB(db);
            
    // REAL-TIME: Yangi kategoriya qo'shilganda
    broadcastUpdate('category-added', newCategory);
    res.json({ success: true, category: newCategory });
});

app.put('/api/categories/:id', (req, res) => {
    const { name, icon } = req.body;
    const db = loadDB();
    const category = db.categories.find(c => c.id == req.params.id);
    if (category) {
        category.name = name;
        category.icon = icon;
        saveDB(db);
        
        // REAL-TIME: Kategoriya o'zgarganda
        broadcastUpdate('category-updated', { id: category.id, ...category });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Category not found' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    const db = loadDB();
    const index = db.categories.findIndex(c => c.id == req.params.id);
    if (index !== -1) {
        db.categories.splice(index, 1);
        saveDB(db);
        
        // REAL-TIME: Kategoriya o'chirilganda
        broadcastUpdate('category-deleted', { id: req.params.id });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Category not found' });
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Rasm yuklanmadi' });
    }
    res.json({ 
        success: true, 
        filename: req.file.filename,
        path: '/uploads/' + req.file.filename 
    });
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, customerLocation, items, chatId } = req.body;
        
        const db = loadDB();
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const order = {
            id: Date.now(),
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            status: 'pending',
            chatId,
            createdAt: new Date().toISOString()
        };
        
        db.orders.push(order);
        saveDB(db);
        
        // REAL-TIME: Admin panelga yangi buyurtma haqida xabar
        broadcastUpdate('new-order', order);
        
        let message = `✅ <b>Yangi buyurtma!</b>\n\n`;
        message += `📋 Buyurtma raqami: <b>#${order.id.toString().slice(-6)}</b>\n`;
        message += `👤 Ism: <b>${customerName}</b>\n`;
        message += `📞 Telefon: <b>${customerPhone}</b>\n`;
        message += `📍 Manzil: <b>${customerAddress}</b>\n`;
        
        if (customerLocation) {
            const [lat, lng] = customerLocation.split(',');
            message += `🗺 <a href="https://www.google.com/maps?q=${lat},${lng}">Lokatsiyani ko'rish</a>\n`;
        }
        
        message += `\n🛒 <b>Buyurtma:</b>\n`;
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            message += `• ${item.name} x${item.quantity} = ${itemTotal.toLocaleString()} so'm\n`;
        });
        message += `\n💰 <b>Jami: ${totalAmount.toLocaleString()} so'm</b>`;
        
        if (chatId) {
            await sendTelegramMessage(chatId, message);
        }
        
        if (process.env.ADMIN_CHAT_ID) {
            await sendTelegramMessage(process.env.ADMIN_CHAT_ID, message);
        }
        
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', (req, res) => {
    const db = loadDB();
    const { phone } = req.query;
    let orders = db.orders.sort((a, b) => b.id - a.id);
    if (phone) {
        orders = orders.filter(o => o.customerPhone.includes(phone));
    }
    res.json(orders);
});

app.put('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const db = loadDB();
    const order = db.orders.find(o => o.id == req.params.id);
    if (order) {
        order.status = status;
        saveDB(db);
        
        // REAL-TIME: Buyurtma holati o'zgarganda xabar
        broadcastUpdate('order-status-changed', { orderId: order.id, status: status });
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

app.post('/api/foods', (req, res) => {
    const { name, description, price, category, image } = req.body;
    const db = loadDB();
    const newFood = {
        id: Date.now(),
        name,
        description,
        price: Number(price),
        category,
        image: image || ''
    };
    db.foods.push(newFood);
    saveDB(db);
    
    // REAL-TIME: Yangi taom qo'shilganda
    broadcastUpdate('food-added', newFood);
    res.json({ success: true, food: newFood });
});

app.put('/api/foods/:id', (req, res) => {
    const { name, description, price, category, image } = req.body;
    const db = loadDB();
    const food = db.foods.find(f => f.id == req.params.id);
    if (food) {
        food.name = name;
        food.description = description;
        food.price = Number(price);
        food.category = category;
        if (image !== undefined) food.image = image;
        saveDB(db);
        
        // REAL-TIME: Taom o'zgarganda
        broadcastUpdate('food-updated', { id: food.id, ...food });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Food not found' });
    }
});

app.delete('/api/foods/:id', (req, res) => {
    const db = loadDB();
    const index = db.foods.findIndex(f => f.id == req.params.id);
    if (index !== -1) {
        db.foods.splice(index, 1);
        saveDB(db);
        
        // REAL-TIME: Taom o'chirilganda
        broadcastUpdate('food-deleted', { id: req.params.id });
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Food not found' });
    }
});

// Telegram Bot Webhook
app.post('/bot', async (req, res) => {
    const update = req.body;
    
    if (update.callback_query) {
        const { id: callbackId, message, data } = update.callback_query;
        const chatId = message.chat.id;
        
        if (data === 'order_food') {
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: '🍔 Buyurtma berish uchun quyidagi tugmani bosing:',
                reply_markup: {
                    inline_keyboard: [[{
                        text: '🛒 Taomlarni tanlash',
                        web_app: { url: 'https://fastfood-delivery-1gaw.onrender.com' }
                    }]]
                }
            });
        }
        
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`, {
            callback_query_id: callbackId
        });
    }
    
    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        if (text === '/start') {
            const welcome = `👋 Assalomu alaykum!\n\n🍔 <b>FastFood Delivery</b> botiga xush kelibsiz!\n\n🚀 Tez va oson buyurtma berish uchun quyidagi tugmani bosing:`;
            
            await sendTelegramMessage(chatId, welcome, {
                inline_keyboard: [[{ text: '🍽️ Ovqat buyurtma berish', callback_data: 'order_food' }]]
            });
        }
        
        if (text === '/myid') {
            await sendTelegramMessage(chatId, `Sizning Chat ID: <code>${chatId}</code>`);
        }
    }
    
    res.send('OK');
});

async function sendTelegramMessage(chatId, message, replyMarkup = null) {
    try {
        const data = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        };
        if (replyMarkup) {
            data.reply_markup = JSON.stringify(replyMarkup);
        }
        
        await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, data);
    } catch (err) {
        console.error('Telegram error:', err.message);
    }
}

app.get('/setup-webhook', async (req, res) => {
    try {
        const webhookUrl = `${req.protocol}://${req.get('host')}/bot`;
        const response = await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook`, {
            url: webhookUrl
        });
        res.json({ success: true, webhookUrl, telegram: response.data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/webhook-info', async (req, res) => {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getWebhookInfo`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time updates!`);
    
    if (process.env.RENDER) {
        setInterval(() => {
            axios.get(`https://fastfood-delivery-1gaw.onrender.com/`)
                .then(() => console.log('Keep-alive ping sent'))
                .catch(() => {});
        }, 14 * 60 * 1000);
    }
});
