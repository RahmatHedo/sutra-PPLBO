const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/connection');
const authRoutes = require('./router/authRoutes');
const userRoutes = require('./router/userRoutes');
const harvestRoutes = require('./router/harvestRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/harvests', harvestRoutes);

// Health check
app.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT 1 + 1 AS result');
        res.json({
            message: "Sutra Backend is Running!",
            db_status: "Connected (PostgreSQL via Supabase)",
            test_result: rows[0].result
        });
    } catch (error) {
        res.status(500).json({ message: "Database Error", error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;