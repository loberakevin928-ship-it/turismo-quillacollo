const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const pool = require('./config/db');
const { authenticate, authorize } = require('./middlewares/auth');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const importantDatesRoutes = require('./routes/importantDates.routes');
const uploadsRoutes = require('./routes/uploads.routes');
const reviewsRoutes = require('./routes/reviews.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middlewares =====
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:5000"],
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173"],
        },
    },
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ===== Configuración de Multer para subir logos =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/logos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
    }
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== Crear usuario admin por defecto =====
const ensureDefaultAdmin = async () => {
    const defaultEmail = 'admin@quillacollo.gob';
    const defaultPassword = 'Admin123!';
    try {
        const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [defaultEmail]);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            await pool.query(
                `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['admin', defaultEmail, hashedPassword, 'Administrador', 'admin', 1]
            );
            console.log('✅ Usuario administrador creado con email admin@quillacollo.gob y contraseña Admin123!');
        } else if (!rows[0].password_hash || rows[0].password_hash.length < 50) {
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, rows[0].id]);
            console.log('✅ Admin existente actualizado con contraseña segura Admin123!');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo garantizar el usuario admin por defecto:', error.message);
    }
};

// ============================================================
//  RUTAS PÚBLICAS (NO requieren autenticación)
// ============================================================

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
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/places', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name,
                (SELECT image_url FROM place_images WHERE place_id = p.id ORDER BY sort_order ASC LIMIT 1) AS image_url,
                COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                COALESCE(COUNT(r.id), 0) as total_reviews
            FROM places p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN reviews r ON r.place_id = p.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/places/:id', async (req, res) => {
    const { id } = req.params;
    try {
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

        const [images] = await pool.query(
            'SELECT * FROM place_images WHERE place_id = ? ORDER BY sort_order',
            [id]
        );

        const [reviews] = await pool.query(`
            SELECT r.*, u.username, u.avatar_url, COALESCE(u.username, r.visitor_name) AS author_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
            LIMIT 10
        `, [id]);

        const [avgRating] = await pool.query(
            'SELECT AVG(rating) as avg, COUNT(*) as total FROM reviews WHERE place_id = ?',
            [id]
        );

        place.images = images || [];
        place.reviews = reviews || [];
        place.average_rating = avgRating[0]?.avg || 0;
        place.total_reviews = avgRating[0]?.total || 0;

        res.json(place);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RUTA PÚBLICA PARA SERVICIOS (mapa) =====
// ⚠️ ESTA ES LA QUE FALTABA
app.get('/api/services', async (req, res) => {
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

// ===== RUTA PARA LOGO (pública) =====
// ⚠️ ESTA TAMBIÉN FALTABA
app.get('/api/settings/logo', async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT value FROM settings WHERE `key` = 'logo_url'"
        );
        res.json({ logoUrl: rows[0]?.value || null });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RUTA PARA SUBIR LOGO (solo admin) =====
app.post('/api/admin/upload-logo', authenticate, authorize('admin'), upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        const logoUrl = `/uploads/logos/${req.file.filename}`;
        await pool.query(
            `INSERT INTO settings (\`key\`, value) VALUES ('logo_url', ?)
             ON DUPLICATE KEY UPDATE value = ?`,
            [logoUrl, logoUrl]
        );
        res.json({ success: true, logoUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== CONTADOR DE VISITAS (público) =====
app.post('/api/visits/track', async (req, res) => {
    const { visitorId } = req.body;
    if (!visitorId || typeof visitorId !== 'string') {
        return res.status(400).json({ error: 'visitorId requerido' });
    }
    try {
        const [existing] = await pool.query(
            `SELECT id, DATE(last_visit_at) = CURDATE() AS is_today
             FROM site_visits WHERE visitor_id = ?`,
            [visitorId]
        );
        let newVisitor = 0;
        if (existing.length === 0) {
            await pool.query(
                'INSERT INTO site_visits (visitor_id, visit_count) VALUES (?, 1)',
                [visitorId]
            );
            newVisitor = 1;
        } else {
            const isToday = existing[0].is_today === 1 || existing[0].is_today === true;
            await pool.query(
                'UPDATE site_visits SET last_visit_at = NOW(), visit_count = visit_count + 1 WHERE visitor_id = ?',
                [visitorId]
            );
            newVisitor = isToday ? 0 : 1;
        }
        await pool.query(
            `INSERT INTO daily_metrics (date, total_visitors, total_pageviews)
             VALUES (CURDATE(), ?, 1)
             ON DUPLICATE KEY UPDATE
                total_visitors = total_visitors + ?,
                total_pageviews = total_pageviews + 1`,
            [newVisitor, newVisitor]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RESUMEN DE VISITAS (público, para el contador del pie) =====
app.get('/api/visits/summary', async (req, res) => {
    try {
        const [totals] = await pool.query(
            'SELECT COUNT(*) AS total_visitors, COALESCE(SUM(visit_count), 0) AS total_pageviews FROM site_visits'
        );
        const [today] = await pool.query(
            'SELECT total_visitors, total_pageviews FROM daily_metrics WHERE date = CURDATE()'
        );
        res.json({
            totalVisitors: totals[0]?.total_visitors || 0,
            totalPageviews: totals[0]?.total_pageviews || 0,
            todayVisitors: today[0]?.total_visitors || 0,
            todayPageviews: today[0]?.total_pageviews || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== SOLICITUDES DE NEGOCIOS (público) =====
const VALID_SERVICE_CATEGORIES = ['hotel', 'restaurant', 'artisan', 'tour_guide', 'transportation'];

// Subida pública de imagen para solicitudes de negocio
const requestStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/requests';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'request-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const requestUpload = multer({
    storage: requestStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
    }
});

app.post('/api/service-requests/upload', requestUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }
        res.json({ success: true, url: `/uploads/requests/${req.file.filename}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/service-requests', async (req, res) => {
    const { business_name, category, address, phone, email, website, description, owner_name, image_url } = req.body;
    if (!business_name || !String(business_name).trim()) {
        return res.status(400).json({ error: 'El nombre del negocio es obligatorio' });
    }
    if (!category || !VALID_SERVICE_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Debes seleccionar una categoría válida' });
    }
    try {
        const [result] = await pool.query(
            `INSERT INTO service_requests (business_name, category, address, phone, email, website, description, owner_name, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [String(business_name).trim(), category, address || null, phone || null, email || null, website || null, description || null, owner_name || null, image_url || null]
        );
        res.status(201).json({ message: 'Solicitud enviada. El equipo la revisará próximamente.', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===== RUTAS DE AUTENTICACIÓN Y ADMIN =====
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/important-dates', importantDatesRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/reviews', reviewsRoutes);

// ============================================================
//  INICIAR SERVIDOR
// ============================================================
ensureDefaultAdmin().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor en http://localhost:${PORT}`);
        console.log(`📡 Health: http://localhost:${PORT}/api/health`);
        console.log(`📡 DB test: http://localhost:${PORT}/api/db-test`);
        console.log(`📡 Categories: http://localhost:${PORT}/api/categories`);
        console.log(`📡 Places: http://localhost:${PORT}/api/places`);
        console.log(`📡 Services (público): http://localhost:${PORT}/api/services`);
        console.log(`📡 Logo: http://localhost:${PORT}/api/settings/logo`);
        console.log(`📡 Important Dates: http://localhost:${PORT}/api/important-dates`);
        console.log(`📡 Uploads: http://localhost:${PORT}/api/uploads`);
    });
}).catch((err) => {
    console.error('❌ Error inicializando el servidor:', err.message);
    process.exit(1);
});