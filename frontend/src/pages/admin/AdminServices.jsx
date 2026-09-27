import { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../api/axios';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        category: '',
        place_id: '',
        description: '',
        website: '',
        logo: ''
    });

    const categories = [
        { value: 'hotel', label: '🏨 Hotel' },
        { value: 'restaurant', label: '🍽️ Restaurante' },
        { value: 'artisan', label: '🎨 Artesano' },
        { value: 'tour_guide', label: '🧭 Guía Turístico' },
        { value: 'transportation', label: '🚐 Transporte' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, placesRes] = await Promise.all([
                api.get('/admin/services'),
                api.get('/admin/places-list')
            ]);
            setServices(servicesRes.data);
            setPlaces(placesRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openCreateForm = () => {
        setEditingService(null);
        setFormData({
            name: '',
            address: '',
            phone: '',
            email: '',
            category: '',
            place_id: '',
            description: '',
            website: '',
            logo: ''
        });
        setShowForm(true);
    };

    const openEditForm = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name || '',
            address: service.address || '',
            phone: service.phone || '',
            email: service.email || '',
            category: service.category || '',
            place_id: service.place_id || '',
            description: service.description || '',
            website: service.website || '',
            logo: service.logo || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = { ...formData };
            if (editingService) {
                await api.put(`/admin/services/${editingService.id}`, data);
            } else {
                await api.post('/admin/services', data);
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al guardar el servicio');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
        try {
            await api.delete(`/admin/services/${id}`);
            fetchData();
        } catch (error) {
            setError('Error al eliminar');
        }
    };

    const categoryOptions = [
        { value: 'hotel', label: '🏨 Hotel' },
        { value: 'restaurant', label: '🍽️ Restaurante' },
        { value: 'artisan', label: '🎨 Artesano' },
        { value: 'tour_guide', label: '🧭 Guía Turístico' },
        { value: 'transportation', label: '🚐 Transporte' }
    ];

    const categoryColors = {
        hotel: '#0B0B0B',
        restaurant: '#38BDF8',
        artisan: '#BAE6FD',
        tour_guide: '#38BDF8',
        transportation: '#0B0B0B'
    };

    // Filtros
    const filtered = services.filter(s => {
        const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                              s.address?.toLowerCase().includes(search.toLowerCase()) ||
                              s.place_name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory ? s.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando servicios...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                <h1>Directorio de Servicios</h1>
                <button
                    onClick={openCreateForm}
                    style={{ padding: '10px 20px', background: '#38BDF8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Nuevo Servicio
                </button>
            </div>

            {error && <p style={{ color: '#38BDF8', background: '#F0F0F0', padding: '10px', borderRadius: '4px' }}>{error}</p>}

            {/* Filtros y búsqueda */}
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
                    {categoryOptions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => { setSearch(''); setFilterCategory(''); }}
                    style={{ padding: '10px 20px', background: '#38BDF8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Limpiar filtros
                </button>
            </div>

            {/* Grid de servicios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filtered.map(service => (
                    <div key={service.id} style={{ padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: `4px solid ${categoryColors[service.category] || '#38BDF8'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 5px', color: '#2C2C2C' }}>{service.name}</h3>
                            <span style={{ 
                                background: categoryColors[service.category] || '#38BDF8', 
                                color: '#fff', 
                                padding: '2px 10px', 
                                borderRadius: '12px', 
                                fontSize: '11px' 
                            }}>
                                {categoryOptions.find(c => c.value === service.category)?.label || service.category}
                            </span>
                        </div>
                        {service.logo && (
                            <img src={getImageUrl(service.logo)} alt={service.name} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain', marginBottom: '10px' }} />
                        )}
                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>📍 {service.address || 'Sin dirección'}</p>
                        {service.phone && <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>📞 {service.phone}</p>}
                        {service.email && <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>✉️ {service.email}</p>}
                        {service.place_name && (
                            <p style={{ margin: '5px 0', color: '#0B0B0B', fontSize: '13px' }}>
                                🗺️ Lugar asociado: <strong>{service.place_name}</strong>
                            </p>
                        )}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => openEditForm(service)}
                                style={{ padding: '5px 15px', background: '#7DD3FC', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                style={{ padding: '5px 15px', background: '#0B0B0B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                    <p>No se encontraron servicios. ¡Agrega el primero!</p>
                </div>
            )}

            {/* Modal para crear/editar servicio */}
            {showForm && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    overflowY: 'auto'
                }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                        {error && <p style={{ color: '#38BDF8' }}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Nombre del Servicio *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Categoría *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categoryOptions.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Lugar Asociado (georreferenciación)</label>
                                <select
                                    name="place_id"
                                    value={formData.place_id}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="">Ninguno</option>
                                    {places.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.lat}, {p.lng})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Dirección</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Teléfono</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Sitio web</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label>Logo (URL de imagen)</label>
                                <input
                                    type="url"
                                    name="logo"
                                    value={formData.logo}
                                    onChange={handleChange}
                                    placeholder="https://ejemplo.com/logo.png"
                                    style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{ padding: '10px 20px', background: '#38BDF8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', background: '#38BDF8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {editingService ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;