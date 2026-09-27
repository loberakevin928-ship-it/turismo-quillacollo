const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const pool = require('../config/db');
const { updateUser, deleteUser } = require('../controllers/auth.controller');

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
        const [totalVisitors] = await pool.query('SELECT COUNT(*) as count FROM site_visits');
        const [todayVisitors] = await pool.query(
            'SELECT total_visitors FROM daily_metrics WHERE date = CURDATE()'
        );
        const [monthlyVisitors] = await pool.query(
            `SELECT DATE_FORMAT(first_visit_at, '%Y-%m') as month, COUNT(*) as visitors
             FROM site_visits
             GROUP BY month
             ORDER BY month ASC
             LIMIT 6`
        );
        res.json({
            totalSites: totalPlaces[0].count || 0,
            totalUsers: totalUsers[0].count || 0,
            totalEvents: totalEvents[0].count || 0,
            totalImages: totalImages[0].count || 0,
            totalVisitors: totalVisitors[0].count || 0,
            todayVisitors: todayVisitors[0]?.total_visitors || 0,
            monthlyVisitors: monthlyVisitors || []
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

// ===== USUARIOS - SOLO ADMIN =====
router.get('/users', authorize('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar usuario (solo admin)
router.put('/users/:id', authorize('admin'), updateUser);

// Eliminar usuario (solo admin)
router.delete('/users/:id', authorize('admin'), deleteUser);

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

// Crear una imagen de galería
router.post('/gallery', async (req, res) => {
    const { place_id, image_url, caption, is_cover, sort_order } = req.body;
    if (!place_id || !image_url) {
        return res.status(400).json({ error: 'Lugar e imagen son obligatorios' });
    }
    try {
        const [place] = await pool.query('SELECT id FROM places WHERE id = ?', [place_id]);
        if (place.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }
        if (is_cover) {
            await pool.query('UPDATE place_images SET is_cover = 0 WHERE place_id = ?', [place_id]);
        }
        const [result] = await pool.query(
            'INSERT INTO place_images (place_id, image_url, caption, is_cover, sort_order) VALUES (?, ?, ?, ?, ?)',
            [place_id, image_url, caption || null, is_cover ? 1 : 0, sort_order || 0]
        );
        res.status(201).json({ message: 'Imagen agregada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una imagen de galería
router.put('/gallery/:id', async (req, res) => {
    const { id } = req.params;
    const { place_id, image_url, caption, is_cover, sort_order } = req.body;
    try {
        if (is_cover) {
            await pool.query('UPDATE place_images SET is_cover = 0 WHERE place_id = ?', [place_id]);
        }
        await pool.query(
            `UPDATE place_images SET place_id=?, image_url=?, caption=?, is_cover=?, sort_order=? WHERE id=?`,
            [place_id, image_url, caption, is_cover ? 1 : 0, sort_order || 0, id]
        );
        res.json({ message: 'Imagen actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una imagen de galería
router.delete('/gallery/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM place_images WHERE id = ?', [req.params.id]);
        res.json({ message: 'Imagen eliminada' });
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
// ===== CONFIGURACIÓN (Settings) - SOLO ADMIN =====
router.get('/settings', authorize('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/settings', authorize('admin'), async (req, res) => {
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

// ===== REPORTES - SOLO ADMIN =====
router.get('/reports/overview', authorize('admin'), async (req, res) => {
    try {
        const [totalSites] = await pool.query('SELECT COUNT(*) as total FROM places');
        const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [totalEvents] = await pool.query('SELECT COUNT(*) as total FROM events');
        const [totalReviews] = await pool.query('SELECT COUNT(*) as total FROM reviews');
        const [totalVisitors] = await pool.query('SELECT COUNT(*) as total FROM site_visits');
        const [monthlyVisitors] = await pool.query(
            `SELECT DATE_FORMAT(first_visit_at, '%Y-%m') as month, COUNT(*) as visitors
             FROM site_visits
             GROUP BY month
             ORDER BY month ASC
             LIMIT 6
        `);
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
            totalVisitors: totalVisitors[0]?.total || 0,
            monthlyVisits: monthlyVisits || [],
            monthlyVisitors: monthlyVisitors || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== SOLICITUDES DE NEGOCIOS (editor y admin) =====
router.get('/service-requests', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT sr.*, u.username as reviewer_name
            FROM service_requests sr
            LEFT JOIN users u ON sr.reviewer_id = u.id
        `;
        const params = [];
        if (status === 'pending' || status === 'approved' || status === 'rejected') {
            query += ' WHERE sr.status = ?';
            params.push(status);
        }
        query += ' ORDER BY sr.created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Conteo de solicitudes pendientes (para insignias del menú)
router.get('/service-requests/pending-count', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM service_requests WHERE status = 'pending'");
        res.json({ pending: rows[0]?.count || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/service-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }
    try {
        const [existing] = await pool.query('SELECT id FROM service_requests WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        await pool.query(
            'UPDATE service_requests SET status = ?, notes = ?, reviewer_id = ? WHERE id = ?',
            [status, notes || null, req.user.id, id]
        );
        res.json({ message: 'Solicitud actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/service-requests/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM service_requests WHERE id = ?', [req.params.id]);
        res.json({ message: 'Solicitud eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== ACTIVIDADES CULTURALES (important_dates) =====
router.get('/cultural-activities', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM important_dates ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/cultural-activities', async (req, res) => {
    const { title, description, date, category, image_url, is_recurring, is_active } = req.body;
    if (!title || !date || !category) {
        return res.status(400).json({ error: 'Título, fecha y categoría son obligatorios' });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO important_dates (title, description, date, category, image_url, is_recurring, is_active, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description || null, date, category, image_url || null, is_recurring || false, is_active !== undefined ? is_active : 1, req.user.id]
        );
        res.status(201).json({ message: 'Actividad creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/cultural-activities/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, date, category, image_url, is_recurring, is_active } = req.body;
    try {
        await pool.query(
            `UPDATE important_dates SET title=?, description=?, date=?, category=?, image_url=?, is_recurring=?, is_active=? WHERE id=?`,
            [title, description || null, date, category, image_url || null, is_recurring || false, is_active !== undefined ? is_active : 1, id]
        );
        res.json({ message: 'Actividad actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/cultural-activities/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM important_dates WHERE id = ?', [req.params.id]);
        res.json({ message: 'Actividad eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;