import { useState, useEffect } from 'react';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import api, { getImageUrl } from '../../api/axios';

const AdminGallery = () => {
    const [images, setImages] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState('');

    const [form, setForm] = useState({
        place_id: '',
        image_url: '',
        caption: '',
        is_cover: false
    });

    const fetchData = async () => {
        const [galleryRes, placesRes] = await Promise.all([
            api.get('/admin/gallery'),
            api.get('/admin/places-list')
        ]);
        setImages(galleryRes.data || []);
        setPlaces(placesRes.data || []);
    };

    useEffect(() => {
        fetchData()
            .catch((err) => console.error('Error cargando galería:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setMessage('');
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/uploads', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm((f) => ({ ...f, image_url: res.data.url }));
        } catch (err) {
            setMessage('❌ Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.place_id || !form.image_url) {
            setMessage('❌ Selecciona un lugar y sube una imagen');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            await api.post('/admin/gallery', {
                place_id: Number(form.place_id),
                image_url: form.image_url,
                caption: form.caption || null,
                is_cover: form.is_cover || false
            });
            setMessage('✅ Imagen agregada a la galería');
            setForm({ place_id: '', image_url: '', caption: '', is_cover: false });
            fetchData();
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.error || 'Error al guardar'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;
        setDeletingId(id);
        try {
            await api.delete(`/admin/gallery/${id}`);
            setImages((prev) => prev.filter((img) => img.id !== id));
            setMessage('🗑️ Imagen eliminada');
        } catch (err) {
            setMessage('❌ Error al eliminar la imagen');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div>Cargando galería...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Galería de Imágenes</h1>
            <p className="text-gray-500 mb-6">Total: {images.length} imágenes</p>

            {message && (
                <p className="p-3 rounded-lg mb-4 bg-sky-50 text-gray-800 text-sm">
                    {message}
                </p>
            )}

            {/* Formulario para agregar imagen */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8 max-w-2xl"
            >
                <h2 className="font-semibold text-gray-700 mb-4">Agregar imagen a un lugar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Lugar turístico *</label>
                        <select
                            name="place_id"
                            value={form.place_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                            <option value="">Seleccionar lugar...</option>
                            {places.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Título / descripción</label>
                        <input
                            type="text"
                            name="caption"
                            value={form.caption}
                            onChange={handleChange}
                            placeholder="Ej: Vista panorámica"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Imagen *</label>
                    <div className="flex flex-wrap items-center gap-4">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="text-sm text-gray-600"
                        />
                        {uploading && (
                            <span className="inline-flex items-center gap-1 text-sky-600 text-sm">
                                <Loader2 size={16} className="animate-spin" /> Subiendo...
                            </span>
                        )}
                        {form.image_url && (
                            <img
                                src={getImageUrl(form.image_url)}
                                alt="Vista previa"
                                className="w-20 h-16 object-cover rounded-lg border border-gray-200"
                            />
                        )}
                    </div>
                </div>

                <label className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <input
                        type="checkbox"
                        name="is_cover"
                        checked={form.is_cover}
                        onChange={handleChange}
                        className="accent-sky-500"
                    />
                    Usar como imagen principal del lugar
                </label>

                <button
                    type="submit"
                    disabled={saving || uploading}
                    className="mt-5 inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
                >
                    <Upload size={16} />
                    {saving ? 'Guardando...' : 'Agregar a la galería'}
                </button>
            </form>

            {/* Listado de imágenes */}
            {images.length === 0 ? (
                <p className="text-gray-400">No hay imágenes en la galería todavía.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                        >
                            <div className="relative h-40">
                                <img
                                    src={getImageUrl(img.image_url)}
                                    alt={img.caption || 'Imagen'}
                                    className="w-full h-full object-cover"
                                />
                                {img.is_cover ? (
                                    <span className="absolute top-2 left-2 bg-sky-400 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                                        Principal
                                    </span>
                                ) : null}
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    disabled={deletingId === img.id}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-neutral-900 text-white p-1.5 rounded-full transition"
                                    title="Eliminar"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                    {img.caption || 'Sin título'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">📍 {img.place_name || 'Sin lugar'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminGallery;