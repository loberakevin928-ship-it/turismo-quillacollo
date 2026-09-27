import { useState, useEffect } from 'react';
import api from '../api/axios';

const LogoUpload = () => {
    const [logoUrl, setLogoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await api.get('/settings/logo');
                if (res.data.logoUrl) {
                    setLogoUrl(`http://localhost:5000${res.data.logoUrl}`);
                }
            } catch (error) {
                console.error('Error cargando logo:', error);
            }
        };
        fetchLogo();
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        setLoading(true);
        setError('');

        try {
            const res = await api.post('/admin/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setLogoUrl(`http://localhost:5000${res.data.logoUrl}`);
            alert('Logo actualizado exitosamente');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al subir logo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', maxWidth: '400px' }}>
            <h3>Logo del Municipio</h3>
            {logoUrl && (
                <img src={logoUrl} alt="Logo" style={{ maxWidth: '200px', marginBottom: '15px', display: 'block' }} />
            )}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: 'block', marginBottom: '10px' }}
            />
            {loading && <p>Cargando...</p>}
            {error && <p style={{ color: '#38BDF8' }}>{error}</p>}
        </div>
    );
};

export default LogoUpload;