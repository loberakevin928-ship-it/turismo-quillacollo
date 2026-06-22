const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// === RUTAS ===

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando', timestamp: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ success: true, result: rows[0].result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NUEVA RUTA: Obtener todos los lugares
app.get('/api/places', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM places p
            JOIN categories c ON p.category_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`📡 DB test: http://localhost:${PORT}/api/db-test`);
    console.log(`📡 Categories: http://localhost:${PORT}/api/categories`);
    console.log(`📡 Places: http://localhost:${PORT}/api/places`);
});