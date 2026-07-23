const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const pool = require('../config/db');

// ===== TODAS LAS RUTAS DE ADMIN REQUIEREN AUTENTICACIÓN Y ROL ADMIN O EDITOR =====
router.use(authenticate);
router.use(authorize('admin', 'editor'));

// ===== ESTADÍSTICAS =====
router.get('/stats', async (req, res) => {
    try {
        const [totalPlaces] = await pool.query('SELECT COUNT(*) as count FROM places');
        const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [totalEvents] = await pool.query('SELECT COUNT(*) as count FROM events');
        const [totalImages] = await pool.query('SELECT COUNT(*) as count FROM place_images');
        res.json({
            totalSites: totalPlaces[0].count || 0,
            totalUsers: totalUsers[0].count || 0,
            totalEvents: totalEvents[0].count || 0,
            totalImages: totalImages[0].count || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ACTIVIDAD RECIENTE =====
router.get('/recent-activity', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            (SELECT 'Nuevo sitio turístico' as activity, u.username as user, p.created_at as date
             FROM places p
             JOIN users u ON p.created_by = u.id
             ORDER BY p.created_at DESC
             LIMIT 5)
            UNION ALL
            (SELECT 'Nuevo evento' as activity, u.username as user, e.created_at as date
             FROM events e
             JOIN users u ON e.created_by = u.id
             ORDER BY e.created_at DESC
             LIMIT 5)
            ORDER BY date DESC
            LIMIT 10
        `);
        res.json(rows || []);
    } catch (error) {
        // Si la tabla events no existe, devolver solo lugares
        try {
            const [rows] = await pool.query(`
                SELECT 'Nuevo sitio turístico' as activity, u.username as user, p.created_at as date
                FROM places p
                JOIN users u ON p.created_by = u.id
                ORDER BY p.created_at DESC
                LIMIT 10
            `);
            res.json(rows || []);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
});

// ===== CRUD DE LUGARES (places) =====
router.get('/places', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM places p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM places p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Lugar no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/places', async (req, res) => {
    const { name, description, category_id, lat, lng, address, phone, website, schedule, is_verified } = req.body;
    const created_by = req.user.id;
    try {
        const [result] = await pool.query(
            `INSERT INTO places (name, description, category_id, lat, lng, address, phone, website, schedule, is_verified, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, category_id, lat, lng, address, phone, website, schedule, is_verified || false, created_by]
        );
        res.status(201).json({ message: 'Lugar creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/places/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, lat, lng, address, phone, website, schedule, is_verified } = req.body;
    try {
        await pool.query(
            `UPDATE places SET name=?, description=?, category_id=?, lat=?, lng=?, address=?, phone=?, website=?, schedule=?, is_verified=?
             WHERE id=?`,
            [name, description, category_id, lat, lng, address, phone, website, schedule, is_verified || false, id]
        );
        res.json({ message: 'Lugar actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM places WHERE id = ?', [id]);
        res.json({ message: 'Lugar eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== CRUD DE EVENTOS =====
router.get('/events', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY start_date ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/events', async (req, res) => {
    const { title, description, location, start_date, end_date, image_url, is_featured, is_upcoming } = req.body;
    const created_by = req.user.id;
    try {
        const [result] = await pool.query(
            `INSERT INTO events (title, description, location, start_date, end_date, image_url, is_featured, is_upcoming, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, location, start_date, end_date, image_url, is_featured || false, is_upcoming || false, created_by]
        );
        res.status(201).json({ message: 'Evento creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/events/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, location, start_date, end_date, image_url, is_featured, is_upcoming } = req.body;
    try {
        await pool.query(
            `UPDATE events SET title=?, description=?, location=?, start_date=?, end_date=?, image_url=?, is_featured=?, is_upcoming=?
             WHERE id=?`,
            [title, description, location, start_date, end_date, image_url, is_featured || false, is_upcoming || false, id]
        );
        res.json({ message: 'Evento actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [id]);
        res.json({ message: 'Evento eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== GALERÍA =====
router.get('/gallery', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pi.*, p.name as place_name
            FROM place_images pi
            LEFT JOIN places p ON pi.place_id = p.id
            ORDER BY pi.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== USUARIOS =====
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ===== DIRECTORIO DE SERVICIOS (CRUD) =====

// Obtener todos los servicios (con datos del lugar asociado)
router.get('/services', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT s.*, p.name as place_name, p.lat, p.lng,
                   COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                   COALESCE(COUNT(r.id), 0) as total_reviews
            FROM services s
            LEFT JOIN places p ON s.place_id = p.id
            LEFT JOIN reviews r ON r.place_id = p.id
            WHERE s.is_active = 1
        `;
        const params = [];
        if (category) {
            query += ' AND s.category = ?';
            params.push(category);
        }
        query += ' GROUP BY s.id ORDER BY s.created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un servicio por ID
router.get('/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT s.*, p.name as place_name, p.lat, p.lng
            FROM services s
            LEFT JOIN places p ON s.place_id = p.id
            WHERE s.id = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un servicio
router.post('/services', async (req, res) => {
    const { name, address, phone, email, logo, category, place_id, description, website } = req.body;
    const created_by = req.user.id;
    if (!name || !category) {
        return res.status(400).json({ error: 'Nombre y categoría son obligatorios' });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO services (name, address, phone, email, logo, category, place_id, description, website, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, address, phone, email, logo, category, place_id, description, website, created_by]
        );
        res.status(201).json({ message: 'Servicio creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un servicio
router.put('/services/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, email, logo, category, place_id, description, website, is_active } = req.body;
    try {
        await pool.query(
            `UPDATE services SET name=?, address=?, phone=?, email=?, logo=?, category=?, place_id=?, description=?, website=?, is_active=?
             WHERE id=?`,
            [name, address, phone, email, logo, category, place_id, description, website, is_active !== undefined ? is_active : true, id]
        );
        res.json({ message: 'Servicio actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un servicio (borrado lógico)
router.delete('/services/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
        res.json({ message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener lugares disponibles para asociar a servicios
router.get('/places-list', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, lat, lng FROM places ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ===== CONFIGURACIÓN (Settings) =====
router.get('/settings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/settings', async (req, res) => {
    const updates = req.body;
    try {
        for (const [key, value] of Object.entries(updates)) {
            await pool.query(
                `INSERT INTO settings (\`key\`, value) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE value = ?`,
                [key, value, value]
            );
        }
        res.json({ message: 'Configuración actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== REPORTES =====
router.get('/reports/overview', async (req, res) => {
    try {
        const [totalSites] = await pool.query('SELECT COUNT(*) as total FROM places');
        const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [totalEvents] = await pool.query('SELECT COUNT(*) as total FROM events');
        const [totalReviews] = await pool.query('SELECT COUNT(*) as total FROM reviews');
        const [monthlyVisits] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as visits
            FROM places
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        `);
        res.json({
            totalSites: totalSites[0]?.total || 0,
            totalUsers: totalUsers[0]?.total || 0,
            totalEvents: totalEvents[0]?.total || 0,
            totalReviews: totalReviews[0]?.total || 0,
            monthlyVisits: monthlyVisits || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== DIRECTORIO DE SERVICIOS =====
router.get('/services', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, name as service_name, 
                   c.name as category_name, 
                   address, phone, 
                   'place' as type
            FROM places p
            JOIN categories c ON p.category_id = c.id
            LIMIT 20
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;