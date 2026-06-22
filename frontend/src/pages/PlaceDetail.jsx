import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const PlaceDetail = () => {
    const { id } = useParams();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const res = await api.get(`/places/${id}`);
                setPlace(res.data);
            } catch (error) {
                console.error('Error cargando lugar:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlace();
    }, [id]);

    if (loading) return <div>Cargando...</div>;
    if (!place) return <div>Lugar no encontrado</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{place.name}</h1>
            <p>{place.description}</p>
            <p><strong>Categoría:</strong> {place.category_name}</p>
            <p><strong>Dirección:</strong> {place.address}</p>
            <p><strong>Teléfono:</strong> {place.phone || 'No disponible'}</p>
            <a href="/">Volver al mapa</a>
        </div>
    );
};

export default PlaceDetail;