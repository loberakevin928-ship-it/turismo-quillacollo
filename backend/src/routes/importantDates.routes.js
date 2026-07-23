const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todas las fechas importantes
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM important_dates WHERE is_active = 1 ORDER BY date ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener fechas por año
router.get('/year/:year', async (req, res) => {
    const { year } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM important_dates WHERE YEAR(date) = ? OR is_recurring = 1 ORDER BY date ASC',
            [year]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener fechas por categoría
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM important_dates WHERE category = ? AND is_active = 1 ORDER BY date ASC',
            [category]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;