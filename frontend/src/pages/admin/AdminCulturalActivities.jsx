import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../api/axios';

const categoryLabels = {
    feriado: 'Feriado',
    festividad: 'Festividad',
    evento: 'Evento',
    conmemorativo: 'Conmemorativo'
};
const categoryColors = {
    feriado: '#0B0B0B',
    festividad: '#7DD3FC',
    evento: '#7DD3FC',
    conmemorativo: '#38BDF8'
};

const emptyForm = {
    title: '', description: '', date: '',
    category: 'evento', image_url: '', is_recurring: false, is_active: true
};

const AdminCulturalActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/cultural-activities');
            setActivities(res.data || []);
        } catch (error) {
            toast.error('Error al cargar actividades');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openCreate = () => { setEditing(null); setFormData(emptyForm); setFormError(''); setShowForm(true); };

    const openEdit = (item) => {
        setEditing(item);
        setFormError('');
        setFormData({
            title: item.title || '',
            description: item.description || '',
            date: item.date ? String(item.date).slice(0, 10) : '',
            category: item.category || 'evento',
            image_url: item.image_url || '',
            is_recurring: !!item.is_recurring,
            is_active: !!item.is_active
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.title || !formData.date || !formData.category) {
            setFormError('Título, fecha y categoría son obligatorios');
            return;
        }
        try {
            if (editing) {
                await api.put(`/admin/cultural-activities/${editing.id}`, formData);
                toast.success('✅ Actividad actualizada');
            } else {
                await api.post('/admin/cultural-activities', formData);
                toast.success('✅ Actividad creada');
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al guardar';
            setFormError(msg);
            toast.error(msg);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`¿Eliminar "${item.title}"?`)) return;
        try {
            await api.delete(`/admin/cultural-activities/${item.id}`);
            toast.success('Actividad eliminada');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CalendarDays size={24} className="text-primary" /> Actividades Culturales
                </h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <Plus size={18} /> Nueva Actividad
                </button>
            </div>

            {activities.length === 0 ? (
                <p className="text-center py-12 text-gray-400">No hay actividades registradas</p>
            ) : (
                <div className="space-y-4">
                    {activities.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden">
                            {item.image_url ? (
                                <div className="sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
                                    <img src={getImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div
                                    className="sm:w-40 h-28 sm:h-auto flex items-center justify-center"
                                    style={{ background: `${categoryColors[item.category] || '#38BDF8'}20` }}
                                >
                                    <CalendarDays size={32} style={{ color: categoryColors[item.category] || '#38BDF8' }} />
                                </div>
                            )}
                            <div className="p-4 flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            {item.location && <> · {item.location}</>}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span
                                                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                                style={{ background: categoryColors[item.category] || '#38BDF8' }}
                                            >
                                                {categoryLabels[item.category]}
                                            </span>
                                            {item.is_recurring === 1 && <span className="text-xs text-sky-500">🔄 Anual</span>}
                                            {!item.is_active && <span className="text-xs text-neutral-700">Inactivo</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(item)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition" title="Editar">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="p-1.5 text-neutral-800 hover:bg-sky-50 rounded-lg transition" title="Eliminar">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl my-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CalendarDays size={20} className="text-primary" />
                            {editing ? 'Editar Actividad' : 'Nueva Actividad'}
                        </h2>
                        {formError && <div className="bg-sky-50 text-neutral-800 p-2 rounded-lg text-sm mb-4">{formError}</div>}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input name="title" placeholder="Título *" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows={3} />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Fecha *</label>
                                    <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Categoría *</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
                                        {Object.entries(categoryLabels).map(([val, lbl]) => (
                                            <option key={val} value={val}>{lbl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <input name="image_url" placeholder="URL de imagen (opcional)" value={formData.image_url} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" name="is_recurring" checked={formData.is_recurring} onChange={handleChange} />
                                    🔄 Se repite cada año
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                                    Activa
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                    {editing ? 'Guardar cambios' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCulturalActivities;
