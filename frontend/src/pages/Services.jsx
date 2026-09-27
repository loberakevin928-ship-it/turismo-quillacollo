import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api, { getImageUrl } from '../api/axios';

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Services = () => {
    const [services, setServices] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showMap, setShowMap] = useState(false);

    const categories = [
        { value: 'hotel', label: '🏨 Hotel' },
        { value: 'restaurant', label: '🍽️ Restaurante' },
        { value: 'artisan', label: '🎨 Artesano' },
        { value: 'tour_guide', label: '🧭 Guía Turístico' },
        { value: 'transportation', label: '🚐 Transporte' }
    ];

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data);
                setFiltered(res.data);
            } catch (error) {
                console.error('Error cargando servicios:', error);
                setError('Error al cargar los servicios: ' + (error.response?.data?.error || error.message));
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    useEffect(() => {
        let result = services;
        if (search) {
            result = result.filter(s =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.address?.toLowerCase().includes(search.toLowerCase()) ||
                s.place_name?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterCategory) {
            result = result.filter(s => s.category === filterCategory);
        }
        setFiltered(result);
    }, [search, filterCategory, services]);

    const center = [-17.3927, -66.2785];
    const servicesWithCoords = filtered.filter(s => s.lat && s.lng);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>⏳ Cargando servicios...</div>;

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: '#38BDF8' }}>
                <h3>❌ Error</h3>
                <p>{error}</p>
                <p>Revisa que el backend esté corriendo en <code>http://localhost:5000</code></p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#0B0B0B' }}>🧭 Directorio de Servicios Turísticos</h1>
            <p>Encuentra hoteles, restaurantes, artesanos, guías y transporte en Quillacollo</p>

            {/* CTA: ¿Tienes un negocio? */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
                gap: '15px', margin: '20px 0', padding: '18px 22px',
                background: '#0B0B0B', borderRadius: '12px', border: '2px solid #38BDF8'
            }}>
                <div>
                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#fff' }}>
                        ¿Tienes un negocio en Quillacollo?
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#BAE6FD' }}>
                        Solicita que aparezca en el directorio turístico. El equipo lo revisará y decidirá si lo agrega.
                    </p>
                </div>
                <Link
                    to="/service-request"
                    style={{
                        padding: '10px 22px', background: '#38BDF8', color: '#0B0B0B',
                        borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none',
                        whiteSpace: 'nowrap'
                    }}
                >
                    📨 Solicitar registro
                </Link>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', background: '#FFFFFF', padding: '15px', borderRadius: '8px' }}>
                <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: '1', minWidth: '200px', padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '150px' }}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowMap(!showMap)}
                    style={{ padding: '10px 20px', background: '#0B0B0B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    {showMap ? '🗺️ Ocultar mapa' : '🗺️ Mostrar mapa'}
                </button>
                <button
                    onClick={() => { setSearch(''); setFilterCategory(''); }}
                    style={{ padding: '10px 20px', background: '#38BDF8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Limpiar filtros
                </button>
            </div>

            <p>{filtered.length} servicios encontrados</p>

            {/* === MAPA === */}
            {showMap && (
                <div style={{ height: '400px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #ddd' }}>
                    {servicesWithCoords.length === 0 ? (
                        <div style={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: '#FFFFFF',
                            flexDirection: 'column'
                        }}>
                            <p style={{ fontSize: '1.2rem', color: '#999' }}>🗺️ No hay marcadores para mostrar</p>
                            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                Los servicios necesitan tener un <strong>lugar asociado</strong> con coordenadas.
                            </p>
                            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                Ve al panel de administración → Servicios → Editar y selecciona un lugar.
                            </p>
                        </div>
                    ) : (
                        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {servicesWithCoords.map(service => (
                                <Marker key={service.id} position={[parseFloat(service.lat), parseFloat(service.lng)]}>
                                    <Popup>
                                        <strong>{service.name}</strong><br />
                                        {service.address || 'Quillacollo'}<br />
                                        {service.phone && `📞 ${service.phone}`}<br />
                                        {service.place_name && `📍 ${service.place_name}`}<br />
                                        <a href={`/place/${service.place_id}`}>Ver lugar asociado</a>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>
            )}

            {/* Grid de servicios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filtered.map(service => {
                    const categoryLabel = categories.find(c => c.value === service.category)?.label || service.category;
                    const color = {
                        hotel: '#0B0B0B',
                        restaurant: '#38BDF8',
                        artisan: '#BAE6FD',
                        tour_guide: '#38BDF8',
                        transportation: '#0B0B0B'
                    }[service.category] || '#38BDF8';

                    return (
                        <div key={service.id} style={{
                            padding: '15px',
                            background: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderTop: `4px solid ${color}`
                        }}>
                            {service.logo && (
                                <img src={getImageUrl(service.logo)} alt={service.name} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain', marginBottom: '10px' }} />
                            )}
                            <h3 style={{ margin: '0 0 5px', color: '#2C2C2C' }}>{service.name}</h3>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                📍 {service.address || 'Quillacollo'}
                                {service.place_name && <span> (asociado a {service.place_name})</span>}
                            </p>
                            {service.phone && <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>📞 {service.phone}</p>}
                            {service.email && <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>✉️ {service.email}</p>}
                            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    background: color,
                                    color: '#fff',
                                    padding: '2px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px'
                                }}>
                                    {categoryLabel}
                                </span>
                                <span style={{ color: '#38BDF8' }}>
                                    ⭐ {service.average_rating ? Number(service.average_rating).toFixed(1) : 'Nuevo'}
                                </span>
                            </div>
                            {service.place_id && (
                                <Link to={`/place/${service.place_id}`} style={{ display: 'inline-block', marginTop: '10px', color: '#0B0B0B' }}>
                                    Ver en el mapa →
                                </Link>
                            )}
                            {/* Indicador si tiene coordenadas */}
                            <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                {service.lat && service.lng ? (
                                    <span style={{ color: '#38BDF8' }}>✅ Con ubicación</span>
                                ) : (
                                    <span style={{ color: '#7DD3FC' }}>❌ Sin ubicación</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                    <p>No se encontraron servicios.</p>
                    <Link to="/dashboard/services" style={{ color: '#0B0B0B' }}>Agregar servicios desde el panel de administración →</Link>
                </div>
            )}
        </div>
    );
};

export default Services;