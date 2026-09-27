const express = require('express');
const router = express.Router();
const { register, adminRegister, login, getProfile } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authenticate, getProfile);

// Crear usuario desde el panel de administración (solo admin)
router.post('/admin/register', authenticate, authorize('admin'), adminRegister);

module.exports = router;
