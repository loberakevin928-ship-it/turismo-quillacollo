import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin } from 'lucide-react';
import api, { getImageUrl } from '../api/axios';

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32 bg-[#F0F9FF]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#F0F9FF]">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Encabezado */}
                <div className="text-center mb-10">
                    <p className="text-primary font-bold tracking-[0.3em] uppercase text-xs">Destinos</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                        Lugares turísticos de Quillacollo
                    </h1>
                    <div className="mx-auto mt-3 w-16 h-0.5 bg-primary"></div>
                    <p className="text-neutral-500 mt-3 text-sm md:text-base">
                        {filteredPlaces.length} destinos para explorar: templos, plazas, miradores y más
                    </p>
                </div>

                {/* Búsqueda y filtros */}
                <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                    {(searchTerm || selectedCategory) && (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                            className="px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-700 transition"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Rejilla de lugares */}
                {filteredPlaces.length === 0 ? (
                    <div className="text-center py-16 text-neutral-400">
                        <p className="text-4xl mb-3">🔍</p>
                        <p>No se encontraron lugares con esos filtros.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlaces.map(place => (
                            <Link
                                key={place.id}
                                to={`/place/${place.id}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="relative h-48 overflow-hidden bg-neutral-100">
                                    {place.image_url ? (
                                        <img
                                            src={getImageUrl(place.image_url)}
                                            alt={place.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🏛️</div>
                                    )}
                                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur border border-sky-400/40 text-sky-300 text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium">
                                        {place.category_name}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-neutral-900 text-lg group-hover:text-primary transition-colors">
                                            {place.name}
                                        </h3>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Star className="fill-sky-400 text-sky-400" size={15} />
                                            <span className="text-sm font-semibold text-neutral-800">
                                                {place.average_rating ? Number(place.average_rating).toFixed(1) : 'Nuevo'}
                                            </span>
                                            <span className="text-xs text-neutral-400">({place.total_reviews || 0})</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-500 mt-2 line-clamp-2">
                                        {place.description || 'Descubre este lugar de Quillacollo.'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-sm font-medium text-primary">
                                        <MapPin size={15} />
                                        Ver detalles del lugar →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;