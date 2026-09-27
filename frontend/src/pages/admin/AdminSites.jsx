import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyForm = {
    name: '', description: '', category_id: '', lat: '', lng: '',
    address: '', phone: '', website: '', schedule: '', is_verified: false
};

const AdminSites = () => {
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sitesRes, categoriesRes] = await Promise.all([
                api.get('/admin/places'),
                api.get('/categories')
            ]);
            setSites(sitesRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            toast.error('Error al cargar los sitios turísticos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openCreateForm = () => {
        setEditingSite(null);
        setFormData(emptyForm);
        setFormError('');
        setShowForm(true);
    };

    const openEditForm = (site) => {
        setEditingSite(site);
        setFormError('');
        setFormData({
            name: site.name || '',
            description: site.description || '',
            category_id: site.category_id || '',
            lat: site.lat ?? '',
            lng: site.lng ?? '',
            address: site.address || '',
            phone: site.phone || '',
            website: site.website || '',
            schedule: site.schedule || '',
            is_verified: !!site.is_verified
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.name || !formData.category_id || formData.lat === '' || formData.lng === '') {
            setFormError('Nombre, categoría y coordenadas son obligatorios');
            return;
        }
        try {
            const data = {
                ...formData,
                category_id: Number(formData.category_id),
                lat: parseFloat(formData.lat),
                lng: parseFloat(formData.lng)
            };
            if (editingSite) {
                await api.put(`/admin/places/${editingSite.id}`, data);
                toast.success('✅ Sitio actualizado');
            } else {
                await api.post('/admin/places', data);
                toast.success('✅ Sitio creado');
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al guardar el sitio';
            setFormError(msg);
            toast.error(msg);
        }
    };

    const handleDelete = async (site) => {
        if (!window.confirm(`¿Seguro que deseas eliminar "${site.name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/admin/places/${site.id}`);
            toast.success('Sitio eliminado');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar el sitio');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📍 Gestión de Sitios Turísticos</h1>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <Plus size={18} /> Nuevo Sitio
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sites.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No hay sitios registrados</td></tr>
                            ) : (
                                sites.map(site => (
                                    <tr key={site.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{site.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-700">{site.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{site.category_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{site.address || '—'}</td>
                                        <td className="px-4 py-3">{site.is_verified ? '✅' : '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditForm(site)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition" title="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(site)} className="p-1.5 text-neutral-800 hover:bg-sky-50 rounded-lg transition" title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal crear/editar */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl my-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-primary" />
                            {editingSite ? 'Editar Sitio' : 'Nuevo Sitio Turístico'}
                        </h2>
                        {formError && <div className="bg-sky-50 text-neutral-800 p-2 rounded-lg text-sm mb-4">{formError}</div>}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input name="name" placeholder="Nombre del sitio *" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows={3} />
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
                                <option value="">Selecciona una categoría *</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="lat" type="number" step="any" placeholder="Latitud *" value={formData.lat} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                                <input name="lng" type="number" step="any" placeholder="Longitud *" value={formData.lng} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            </div>
                            <input name="address" placeholder="Dirección" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="phone" placeholder="Teléfono" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                                <input name="website" placeholder="Sitio web" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <input name="schedule" placeholder="Horario (ej: 08:00 - 18:00)" value={formData.schedule} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" name="is_verified" checked={formData.is_verified} onChange={handleChange} />
                                Sitio verificado
                            </label>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                    {editingSite ? 'Guardar cambios' : 'Crear sitio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSites;
