import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

// Corregir iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
    if (!place) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Lugar no encontrado</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1>{place.name}</h1>
            <p><strong>Categoría:</strong> {place.category_name}</p>
            <p><strong>Dirección:</strong> {place.address || 'No especificada'}</p>
            <p><strong>Teléfono:</strong> {place.phone || 'No disponible'}</p>
            <p><strong>Horario:</strong> {place.schedule || 'No especificado'}</p>
            <p><strong>Descripción:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{place.description || 'Sin descripción'}</p>

            <div style={{ marginTop: '20px' }}>
                <h3>Calificación promedio: {place.average_rating ? place.average_rating.toFixed(1) : 'Sin calificaciones'} ⭐ ({place.total_reviews} reseñas)</h3>
            </div>

            {/* Mini mapa con la ubicación del lugar */}
            <div style={{ height: '300px', width: '100%', marginTop: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer 
                    center={[parseFloat(place.lat), parseFloat(place.lng)]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[parseFloat(place.lat), parseFloat(place.lng)]}>
                        <Popup>{place.name}</Popup>
                    </Marker>
                </MapContainer>
            </div>

            {/* Galería de imágenes (si hay) */}
            {place.images && place.images.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Galería</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {place.images.map(img => (
                            <img 
                                key={img.id} 
                                src={img.image_url} 
                                alt={img.caption || place.name} 
                                style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Reseñas */}
            <div style={{ marginTop: '30px' }}>
                <h3>Reseñas</h3>
                {place.reviews && place.reviews.length > 0 ? (
                    place.reviews.map(review => (
                        <div key={review.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                            <strong>{review.username}</strong>
                            <span style={{ marginLeft: '10px' }}>
                                {'⭐'.repeat(Math.round(review.rating))}
                            </span>
                            <p>{review.comment}</p>
                            <small>{new Date(review.created_at).toLocaleDateString()}</small>
                        </div>
                    ))
                ) : (
                    <p>No hay reseñas aún. Sé el primero en dejar una.</p>
                )}
            </div>

            <a href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#007bff' }}>← Volver al mapa</a>
        </div>
    );
};

export default PlaceDetail;