import { useState, useEffect, useCallback } from 'react';
import api, { getImageUrl } from '../../api/axios';

const categoryLabels = {
    hotel: '🏨 Hotel',
    restaurant: '🍽️ Restaurante',
    artisan: '🎨 Artesano',
    tour_guide: '🧭 Guía Turístico',
    transportation: '🚐 Transporte'
};

const tabs = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'approved', label: 'Aprobadas' },
    { value: 'rejected', label: 'Rechazadas' }
];

const statusStyle = {
    pending: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Pendiente' },
    approved: { bg: 'bg-neutral-900', text: 'text-white', label: 'Aprobada' },
    rejected: { bg: 'bg-neutral-200', text: 'text-neutral-600', label: 'Rechazada' }
};

const AdminServiceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('');

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/admin/service-requests', { params: { status } });
            setRequests(res.data);
        } catch (err) {
            setError('Error al cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleDecision = async (request, newStatus) => {
        const action = newStatus === 'approved' ? 'aprobar' : 'rechazar';
        const notes = window.prompt(
            `Escribe una nota para ${action} la solicitud de "${request.business_name}" (opcional):`,
            ''
        );
        if (notes === null) return;
        try {
            setMessage('');
            await api.put(`/admin/service-requests/${request.id}`, { status: newStatus, notes: notes.trim() || null });
            setMessage(`Solicitud de "${request.business_name}" ${action === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.`);
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar la solicitud');
        }
    };

    const handleDelete = async (request) => {
        if (!window.confirm(`¿Eliminar la solicitud de "${request.business_name}"? Esta acción no se puede deshacer.`)) return;
        try {
            setMessage('');
            await api.delete(`/admin/service-requests/${request.id}`);
            setMessage('Solicitud eliminada.');
            fetchRequests();
        } catch (err) {
            setError('Error al eliminar la solicitud');
        }
    };

    const formatDate = (date) => {
        try {
            return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return '';
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Solicitudes de Negocios</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Las empresas de visita solicitan aparecer en el directorio de servicios. Decide si aprobarlas o no.
                    </p>
                </div>
            </div>

            {message && (
                <div className="mb-4 bg-sky-50 border border-sky-300 text-sky-800 px-4 py-3 rounded-lg text-sm">
                    ✅ {message}
                </div>
            )}
            {error && (
                <div className="mb-4 bg-sky-50 border border-sky-300 text-sky-800 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Tabs de filtro */}
            <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setStatus(tab.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
                            status === tab.value
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-center text-neutral-500 py-10">Cargando solicitudes...</p>
            ) : requests.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-neutral-200">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-neutral-600">No hay solicitudes {status === 'pending' ? 'pendientes' : 'en este estado'}.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => {
                        const s = statusStyle[req.status] || statusStyle.pending;
                        return (
                            <div key={req.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                                <div className="flex gap-4">
                                    {req.image_url && (
                                        <div className="shrink-0">
                                            <img
                                                src={getImageUrl(req.image_url)}
                                                alt={req.business_name}
                                                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border border-neutral-200"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-lg font-bold text-neutral-900">{req.business_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-1">{categoryLabels[req.category] || req.category}</p>
                                    </div>
                                    <div className="text-right text-xs text-neutral-400">
                                        <p>Solicitud #{req.id}</p>
                                        <p>{formatDate(req.created_at)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm text-neutral-700">
                                    {req.owner_name && <p>👤 Propietario: <strong>{req.owner_name}</strong></p>}
                                    {req.address && <p>📍 {req.address}</p>}
                                    {req.phone && <p>📞 {req.phone}</p>}
                                    {req.email && <p>✉️ {req.email}</p>}
                                    {req.website && <p>🌐 {req.website}</p>}
                                </div>

                                {req.description && (
                                    <p className="mt-3 text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3">
                                        {req.description}
                                    </p>
                                )}

                                {req.notes && (
                                    <div className="mt-3 text-sm bg-sky-50 border border-sky-200 rounded-lg p-3">
                                        <strong className="text-sky-800">Nota del revisor:</strong>
                                        <span className="text-neutral-700"> {req.notes}</span>
                                        {req.reviewer_name && (
                                            <span className="text-neutral-400"> — {req.reviewer_name}</span>
                                        )}
                                    </div>
                                )}

                                {req.status === 'pending' ? (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                                        <button
                                            onClick={() => handleDecision(req, 'approved')}
                                            className="px-4 py-2 bg-primary text-neutral-900 rounded-lg text-sm font-semibold hover:bg-primary-light transition"
                                        >
                                            ✓ Aprobar y agregar
                                        </button>
                                        <button
                                            onClick={() => handleDecision(req, 'rejected')}
                                            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-semibold hover:bg-neutral-700 transition"
                                        >
                                            ✕ Rechazar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(req)}
                                            className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm hover:bg-neutral-200 transition"
                                        >
                                            🗑 Eliminar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-neutral-100 flex gap-2">
                                        <button
                                            onClick={() => handleDelete(req)}
                                            className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm hover:bg-neutral-200 transition"
                                        >
                                            🗑 Eliminar
                                        </button>
                                    </div>
                                )}
                                </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminServiceRequests;