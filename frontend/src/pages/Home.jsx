import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Star, MapPin, Filter } from 'lucide-react';
import api from '../api/axios';

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centrar el mapa en un lugar seleccionado
const FlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [mapCenter, setMapCenter] = useState([-17.3927, -66.2785]);
    const markersRef = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [placesRes, categoriesRes] = await Promise.all([
                    api.get('/places'),
                    api.get('/categories')
                ]);
                setPlaces(placesRes.data);
                setFilteredPlaces(placesRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = places;
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
        }
        setFilteredPlaces(filtered);
    }, [searchTerm, selectedCategory, places]);

    const handlePlaceClick = (place) => {
        setSelectedPlaceId(place.id);
        setMapCenter([parseFloat(place.lat), parseFloat(place.lng)]);
        // Cerrar el panel en móvil si está abierto
        if (window.innerWidth < 768) {
            document.getElementById('mobile-panel')?.classList.toggle('hidden');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    const selectedPlace = places.find(p => p.id === selectedPlaceId);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Panel superior de búsqueda (visible en móvil) */}
            <div className="md:hidden bg-white p-3 shadow-md z-20 flex items-center gap-2">
                <button 
                    onClick={() => document.getElementById('mobile-panel').classList.toggle('hidden')}
                    className="p-2 bg-primary text-white rounded-lg"
                >
                    <Filter size={20} />
                </button>
                <input
                    type="text"
                    placeholder="Buscar lugares..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Contenedor principal: Panel izquierdo + Mapa */}
            <div className="flex flex-1 overflow-hidden">
                {/* Panel lateral izquierdo (30%) */}
                <div 
                    id="mobile-panel"
                    className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden z-10 md:relative absolute inset-0 md:inset-auto transition-transform duration-300 md:translate-x-0 -translate-x-full md:flex"
                >
                    {/* Header del panel */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="text-primary" size={20} /> 
                            <span className="text-sm font-normal text-gray-500">{filteredPlaces.length} lugares</span>
                        </h2>
                        <button 
                            onClick={() => document.getElementById('mobile-panel').classList.add('hidden')}
                            className="md:hidden p-1 hover:bg-gray-100 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Búsqueda y filtros */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Lista de lugares */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {filteredPlaces.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>No se encontraron lugares</p>
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                                    className="text-primary text-sm mt-2"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        ) : (
                            filteredPlaces.map(place => (
                                <div
                                    key={place.id}
                                    onClick={() => handlePlaceClick(place)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                                        selectedPlaceId === place.id 
                                            ? 'border-primary bg-primary/5 shadow-md' 
                                            : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                            {place.cover_image ? (
                                                <img src={place.cover_image} alt={place.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🏛️</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-sm truncate">{place.name}</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                {place.category_name}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="fill-yellow-400 text-yellow-400" size={14} />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {place.average_rating ? Number(place.average_rating).toFixed(1) : 'Nuevo'}
                                                </span>
                                                <span className="text-xs text-gray-400">({place.total_reviews || 0})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mapa (70%) */}
                <div className="flex-1 h-full relative">
                    <MapContainer 
                        center={mapCenter} 
                        zoom={13} 
                        className="h-full w-full z-0"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FlyTo position={mapCenter} />
                        {filteredPlaces.map(place => (
                            <Marker 
                                key={place.id} 
                                position={[parseFloat(place.lat), parseFloat(place.lng)]}
                                eventHandlers={{
                                    click: () => handlePlaceClick(place)
                                }}
                            >
                                <Popup>
                                    <div className="p-1 max-w-[200px]">
                                        <h4 className="font-bold text-gray-800">{place.name}</h4>
                                        <p className="text-sm text-gray-500">{place.category_name}</p>
                                        <Link 
                                            to={`/place/${place.id}`}
                                            className="text-primary text-sm font-medium hover:underline"
                                        >
                                            Ver detalle →
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Información del lugar seleccionado (flotante sobre el mapa) */}
                    {selectedPlace && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl p-4 max-w-md w-[90%] border border-gray-100 z-20 animate-slide-up">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {selectedPlace.cover_image ? (
                                        <img src={selectedPlace.cover_image} alt={selectedPlace.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🏛️</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{selectedPlace.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedPlace.category_name}</p>
                                    <Link 
                                        to={`/place/${selectedPlace.id}`}
                                        className="text-primary text-xs font-medium hover:underline"
                                    >
                                        Ver más detalles →
                                    </Link>
                                </div>
                                <button 
                                    onClick={() => setSelectedPlaceId(null)}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS para animación */}
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Home;