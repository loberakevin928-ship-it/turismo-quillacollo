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
// Obtener un lugar por ID (con detalles, imágenes y reseñas)
app.get('/api/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener datos del lugar
        const [placeRows] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM places p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (placeRows.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }

        const place = placeRows[0];

        // 2. Obtener imágenes del lugar (si tienes la tabla place_images)
        const [images] = await pool.query(
            'SELECT * FROM place_images WHERE place_id = ? ORDER BY sort_order',
            [id]
        );

        // 3. Obtener reseñas del lugar (si tienes la tabla reviews)
        const [reviews] = await pool.query(`
            SELECT r.*, u.username, u.avatar_url
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
            LIMIT 10
        `, [id]);

        // 4. Calcular promedio de calificación
        const [avgRating] = await pool.query(
            'SELECT AVG(rating) as avg, COUNT(*) as total FROM reviews WHERE place_id = ?',
            [id]
        );

        // Combinar todo
        place.images = images || [];
        place.reviews = reviews || [];
        place.average_rating = avgRating[0]?.avg || 0;
        place.total_reviews = avgRating[0]?.total || 0;

        res.json(place);
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