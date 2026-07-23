import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await api.get('/admin/gallery');
                setImages(res.data || []);
            } catch (error) {
                console.error('Error cargando galería:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, []);

    if (loading) return <div>Cargando galería...</div>;

    return (
        <div>
            <h1>Galería de Imágenes</h1>
            <p>Total: {images.length} imágenes</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {images.map((img, index) => (
                    <div key={index} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                        <img src={img.url || 'https://via.placeholder.com/150'} alt="Imagen" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        <p style={{ fontSize: '12px', marginTop: '5px' }}>{img.title || 'Sin título'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminGallery;