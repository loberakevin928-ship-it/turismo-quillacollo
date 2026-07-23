const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = ?',
            [decoded.id]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        req.user = rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'No autenticado' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };