const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Registro de usuario
const register = async (req, res) => {
    const { username, email, password, full_name } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario o email ya existen
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El usuario o email ya están registrados' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name)
             VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name || username]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear usuario desde el panel de administración (permite asignar rol)
const adminRegister = async (req, res) => {
    const { username, email, password, full_name, role } = req.body;
    const validRoles = ['admin', 'editor', 'user'];

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Usuario, email y contraseña son obligatorios' });
    }
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    try {
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'El usuario o email ya están registrados' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (username, email, password_hash, full_name, role)
             VALUES (?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name || username, role || 'user']
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un usuario (rol, nombre, estado)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;
    const validRoles = ['admin', 'editor', 'user'];

    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    try {
        const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Evitar que un admin se degrade a sí mismo
        if (Number(id) === req.user.id && role && role !== 'admin') {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol de administrador' });
        }

        await pool.query(
            'UPDATE users SET full_name = COALESCE(?, full_name), role = COALESCE(?, role), is_active = COALESCE(?, is_active) WHERE id = ?',
            [full_name || null, role || null, is_active === undefined ? null : (is_active ? 1 : 0), id]
        );

        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        if (Number(id) === req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
        }

        const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login de usuario
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    try {
        // Buscar usuario por email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Devolver token y datos del usuario (sin la contraseña)
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, full_name, role, avatar_url FROM users WHERE id = ?',
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, adminRegister, updateUser, deleteUser, login, getProfile };