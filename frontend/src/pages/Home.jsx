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

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const center = [-17.3927, -66.2785]; // Quillacollo

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await api.get('/places');
                setPlaces(res.data);
            } catch (error) {
                console.error('Error cargando lugares:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaces();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando mapa...</div>;

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {places.map(place => (
                    <Marker 
                        key={place.id} 
                        position={[parseFloat(place.lat), parseFloat(place.lng)]}
                    >
                        <Popup>
                            <strong>{place.name}</strong><br />
                            {place.category_name || 'Sin categoría'}<br />
                            <a href={`/place/${place.id}`} style={{ color: '#007bff' }}>Ver más</a>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Home;