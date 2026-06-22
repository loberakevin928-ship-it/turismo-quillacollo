const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json({ ok: true, message: 'Ruta de prueba funcionando' });
});

app.listen(5000, () => {
    console.log('✅ Servidor de prueba en http://localhost:5000');
    console.log('📡 Prueba: http://localhost:5000/test');
});