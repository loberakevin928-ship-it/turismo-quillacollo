import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const emptyForm = {
    title: '', description: '', location: '', start_date: '',
    end_date: '', image_url: '', is_featured: false, is_upcoming: true
};

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/events');
            setEvents(res.data || []);
        } catch (error) {
            toast.error('Error al cargar los eventos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const openCreateForm = () => {
        setEditingEvent(null);
        setFormData(emptyForm);
        setFormError('');
        setShowForm(true);
    };

    const openEditForm = (event) => {
        setEditingEvent(event);
        setFormError('');
        setFormData({
            title: event.title || '',
            description: event.description || '',
            location: event.location || '',
            start_date: event.start_date ? String(event.start_date).slice(0, 10) : '',
            end_date: event.end_date ? String(event.end_date).slice(0, 10) : '',
            image_url: event.image_url || '',
            is_featured: !!event.is_featured,
            is_upcoming: !!event.is_upcoming
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!formData.title || !formData.start_date) {
            setFormError('El título y la fecha de inicio son obligatorios');
            return;
        }
        try {
            if (editingEvent) {
                await api.put(`/admin/events/${editingEvent.id}`, formData);
                toast.success('✅ Evento actualizado');
            } else {
                await api.post('/admin/events', formData);
                toast.success('✅ Evento creado');
            }
            setShowForm(false);
            fetchEvents();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al guardar el evento';
            setFormError(msg);
            toast.error(msg);
        }
    };

    const handleDelete = async (event) => {
        if (!window.confirm(`¿Seguro que deseas eliminar el evento "${event.title}"?`)) return;
        try {
            await api.delete(`/admin/events/${event.id}`);
            toast.success('Evento eliminado');
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error al eliminar el evento');
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
                <h1 className="text-2xl font-bold text-gray-800">🎉 Gestión de Eventos</h1>
                <button
                    onClick={openCreateForm}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm"
                >
                    <Plus size={18} /> Nuevo Evento
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.length === 0 ? (
                                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No hay eventos registrados</td></tr>
                            ) : (
                                events.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{event.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-700">{event.title}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                            {new Date(event.start_date).toLocaleDateString('es-ES')}
                                            {event.end_date && ` → ${new Date(event.end_date).toLocaleDateString('es-ES')}`}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{event.location || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.is_upcoming ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {event.is_upcoming ? 'Próximo' : 'Finalizado'}
                                            </span>
                                            {event.is_featured && <span className="ml-1">⭐</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEditForm(event)} className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition" title="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(event)} className="p-1.5 text-neutral-800 hover:bg-sky-50 rounded-lg transition" title="Eliminar">
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
                            <CalendarDays size={20} className="text-primary" />
                            {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                        </h2>
                        {formError && <div className="bg-sky-50 text-neutral-800 p-2 rounded-lg text-sm mb-4">{formError}</div>}
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input name="title" placeholder="Título del evento *" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                            <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" rows={3} />
                            <input name="location" placeholder="Ubicación" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Fecha de inicio *</label>
                                    <input name="start_date" type="date" value={formData.start_date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Fecha de fin</label>
                                    <input name="end_date" type="date" value={formData.end_date} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <input name="image_url" placeholder="URL de imagen (opcional)" value={formData.image_url} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} />
                                    ⭐ Destacado
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" name="is_upcoming" checked={formData.is_upcoming} onChange={handleChange} />
                                    Próximo evento
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                    {editingEvent ? 'Guardar cambios' : 'Crear evento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
