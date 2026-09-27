const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/auth');
const pool = require('../config/db');

// Auth opcional: si hay token, deja el usuario; si no, permite visitante anónimo
const optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query('SELECT id, role FROM users WHERE id = ?', [decoded.id]);
        if (rows.length > 0) req.user = rows[0];
    } catch (e) { /* token inválido: se trata como visitante */ }
    next();
};

// Crear una reseña (usuario autenticado o visitante con nombre)
router.post('/', optionalAuth, async (req, res) => {
    const { placeId, rating, comment, visitorName } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!placeId || !rating || !comment) {
        return res.status(400).json({ error: 'Lugar, calificación y comentario son obligatorios' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }
    if (comment && comment.trim().length < 10) {
        return res.status(400).json({ error: 'El comentario debe tener al menos 10 caracteres' });
    }
    if (!userId && (!visitorName || visitorName.trim().length < 2)) {
        return res.status(400).json({ error: 'Debes indicar tu nombre para dejar una reseña' });
    }

    try {
        const [places] = await pool.query('SELECT id FROM places WHERE id = ?', [placeId]);
        if (places.length === 0) {
            return res.status(404).json({ error: 'Lugar no encontrado' });
        }

        // Solo un usuario registrado puede dejar una única reseña por lugar
        if (userId) {
            const [existing] = await pool.query(
                'SELECT id FROM reviews WHERE place_id = ? AND user_id = ?',
                [placeId, userId]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Ya dejaste una reseña para este lugar' });
            }
        }

        const [result] = await pool.query(
            'INSERT INTO reviews (place_id, user_id, visitor_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
            [placeId, userId, userId ? null : visitorName.trim(), rating, comment.trim()]
        );

        res.status(201).json({
            message: 'Reseña publicada exitosamente',
            reviewId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una reseña (su autor o un admin)
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reseña no encontrada' });
        }
        const isOwner = rows[0].user_id && rows[0].user_id === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta reseña' });
        }
        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;