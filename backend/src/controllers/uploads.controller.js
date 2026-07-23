const pool = require('../config/db');

const uploadPlaceImage = async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${serverUrl}/uploads/places/${req.file.filename}`;
    try {
        await pool.query(
            'INSERT INTO place_images (place_id, image_url, sort_order, created_at) VALUES (?, ?, ?, NOW())',
            [id, imageUrl, 0]
        );
        res.status(201).json({ image_url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadPlaceImage };
