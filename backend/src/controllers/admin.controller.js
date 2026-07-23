const pool = require('../config/db');

// ========== CRUD DE LUGARES ==========

// Obtener todos los lugares (con su categoría)
const getPlaces = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name,
                (SELECT image_url FROM place_images WHERE place_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image_url
            FROM places p
            JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un lugar por ID
const getPlaceById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM places p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo lugar
const createPlace = async (req, res) => {
    const { name, description, category_id, lat, lng, address, phone, website, schedule, is_verified } = req.body;
    const created_by = req.user.id;

    // Validaciones básicas
    if (!name || !category_id || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Nombre, categoría, latitud y longitud son obligatorios' });
    }

    try {
        const [result] = await pool.query(`
            INSERT INTO places (name, description, category_id, lat, lng, address, phone, website, schedule, is_verified, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, description, category_id, lat, lng, address, phone, website, schedule, is_verified || false, created_by]);

        res.status(201).json({ 
            message: 'Lugar creado exitosamente', 
            id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un lugar
const updatePlace = async (req, res) => {
    const { id } = req.params;
    const { name, description, category_id, lat, lng, address, phone, website, schedule, is_verified } = req.body;

    try {
        // Verificar que el lugar existe
        const [existing] = await pool.query('SELECT id FROM places WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }

        await pool.query(`
            UPDATE places 
            SET name = ?, description = ?, category_id = ?, lat = ?, lng = ?, 
                address = ?, phone = ?, website = ?, schedule = ?, is_verified = ?
            WHERE id = ?
        `, [name, description, category_id, lat, lng, address, phone, website, schedule, is_verified || false, id]);

        res.json({ message: 'Lugar actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un lugar
const deletePlace = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await pool.query('SELECT id FROM places WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }

        await pool.query('DELETE FROM places WHERE id = ?', [id]);
        res.json({ message: 'Lugar eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== CRUD DE CATEGORÍAS ==========

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una categoría
const createCategory = async (req, res) => {
    const { name, icon, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
            [name, icon || null, description || null]
        );
        res.status(201).json({ message: 'Categoría creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una categoría
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, icon, description } = req.body;
    try {
        await pool.query(
            'UPDATE categories SET name = ?, icon = ?, description = ? WHERE id = ?',
            [name, icon, description, id]
        );
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una categoría
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== CRUD DE EVENTOS ==========

const getEvents = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createEvent = async (req, res) => {
    const { title, description, event_date, location, category_id } = req.body;
    const created_by = req.user.id;
    if (!title || !event_date) {
        return res.status(400).json({ error: 'Título y fecha son obligatorios' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO events (title, description, event_date, location, category_id, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [title, description || null, event_date, location || null, category_id || null, created_by]
        );
        res.status(201).json({ message: 'Evento creado exitosamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, location, category_id } = req.body;
    try {
        await pool.query(
            'UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, category_id = ? WHERE id = ?',
            [title, description || null, event_date, location || null, category_id || null, id]
        );
        res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [id]);
        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== CRUD DE FECHAS IMPORTANTES ==========

const getImportantDates = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM important_dates ORDER BY event_date ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getImportantDateById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM important_dates WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Fecha importante no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createImportantDate = async (req, res) => {
    const { title, description, event_date, location } = req.body;
    if (!title || !event_date) {
        return res.status(400).json({ error: 'Título y fecha son obligatorios' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO important_dates (title, description, event_date, location, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [title, description || null, event_date, location || null, req.user.id]
        );
        res.status(201).json({ id: result.insertId, title, description, event_date, location });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateImportantDate = async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, location } = req.body;
    try {
        await pool.query(
            'UPDATE important_dates SET title = ?, description = ?, event_date = ?, location = ? WHERE id = ?',
            [title, description || null, event_date, location || null, id]
        );
        res.json({ message: 'Fecha importante actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteImportantDate = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM important_dates WHERE id = ?', [id]);
        res.json({ message: 'Fecha importante eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== CRUD DE RESEÑAS ==========

const getReviews = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, u.username, p.name AS place_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN places p ON r.place_id = p.id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
        res.json({ message: 'Reseña eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== ESTADÍSTICAS DEL DASHBOARD ==========

const getStats = async (req, res) => {
    try {
        const [totalPlaces] = await pool.query('SELECT COUNT(*) as count FROM places');
        const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [totalEvents] = await pool.query('SELECT COUNT(*) as count FROM events');
        const [totalReviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');

        res.json({
            totalPlaces: totalPlaces[0].count,
            totalUsers: totalUsers[0].count,
            totalEvents: totalEvents[0].count,
            totalReviews: totalReviews[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getImportantDates,
    getImportantDateById,
    createImportantDate,
    updateImportantDate,
    deleteImportantDate,
    getReviews,
    deleteReview,
    getStats
};