import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const categories = [
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'restaurant', label: '🍽️ Restaurante' },
    { value: 'artisan', label: '🎨 Artesano' },
    { value: 'tour_guide', label: '🧭 Guía Turístico' },
    { value: 'transportation', label: '🚐 Transporte' }
];

const emptyForm = {
    business_name: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    owner_name: '',
    image_url: ''
};

const ServiceRequest = () => {
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [successId, setSuccessId] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        setUploadingImage(true);
        setError('');
        try {
            const res = await api.post('/service-requests/upload', fd);
            setFormData({ ...formData, image_url: res.data.url });
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo subir la imagen. Usa JPG, PNG o WEBP (máx. 5 MB).');
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/service-requests', formData);
            setSuccessId(res.data.id);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo enviar la solicitud. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (successId) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-sky-100 border-4 border-primary flex items-center justify-center text-4xl mb-6">✅</div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-3">¡Solicitud enviada!</h1>
                <p className="text-neutral-600 mb-2">
                    Tu negocio fue registrado con el código <strong>#SR-{successId}</strong>.
                </p>
                <p className="text-neutral-600 mb-8">
                    El equipo del editor municipal revisará tu solicitud y decidirá si tu negocio
                    aparece en el directorio de servicios turísticos de Quillacollo.
                </p>
                <div className="flex justify-center gap-3">
                    <Link
                        to="/services"
                        className="px-5 py-2.5 bg-primary text-neutral-900 rounded-lg font-semibold hover:bg-primary-light transition"
                    >
                        Ver directorio de servicios
                    </Link>
                    <button
                        onClick={() => { setSuccessId(null); setFormData(emptyForm); }}
                        className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-700 transition"
                    >
                        Enviar otra solicitud
                    </button>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 border border-neutral-300 rounded-lg text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";
    const labelClass = "block text-sm font-medium text-neutral-800 mb-1";

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-3">¿Quieres que tu negocio sea visible en el sistema?</h1>
                <p className="text-neutral-600 max-w-xl mx-auto">
                    Completa este formulario de solicitud. El encargado del área de turismo la revisará
                    y decidirá si tu negocio se agrega al directorio de servicios de Quillacollo.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
                {error && (
                    <div className="mb-6 bg-sky-50 border border-sky-300 text-sky-800 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nombre del negocio <span className="text-primary">*</span></label>
                        <input
                            required
                            name="business_name"
                            value={formData.business_name}
                            onChange={handleChange}
                            placeholder="Ej. Hotel Mirador Quillacollo"
                            className={inputClass}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Categoría <span className="text-primary">*</span></label>
                        <select required name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                            <option value="">Selecciona una categoría...</option>
                            {categories.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Nombre del propietario</label>
                        <input name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="Tu nombre" className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Dirección</label>
                        <input name="address" value={formData.address} onChange={handleChange} placeholder="Calle, zona..." className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+591 ..." className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Correo electrónico</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className={inputClass} />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Sitio web</label>
                        <input name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className={inputClass} />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Descripción del negocio</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Cuéntanos qué ofreces, horarios, productos o servicios..."
                            className={inputClass + " resize-y"}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className={labelClass}>Foto o logo del negocio <span className="text-neutral-400 font-normal">(opcional)</span></label>
                        <div className="flex items-start gap-4">
                            <div className="shrink-0">
                                {formData.image_url ? (
                                    <img
                                        src={formData.image_url}
                                        alt="Vista previa"
                                        className="w-28 h-28 object-cover rounded-xl border-2 border-primary"
                                    />
                                ) : (
                                    <div className="w-28 h-28 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-3xl bg-neutral-50">
                                        🖼️
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="inline-block px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:border-primary cursor-pointer bg-white">
                                    {uploadingImage ? 'Subiendo imagen...' : '📤 Elegir imagen'}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        disabled={uploadingImage}
                                        className="hidden"
                                    />
                                </label>
                                {formData.image_url && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                        className="ml-2 px-3 py-2.5 text-sm text-neutral-500 hover:text-primary"
                                    >
                                        Quitar
                                    </button>
                                )}
                                <p className="text-xs text-neutral-400 mt-2">
                                    Esta imagen la usará el equipo para el directorio de servicios. JPG, PNG o WEBP, máx. 5 MB.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-8 w-full bg-neutral-900 text-white py-3 rounded-xl font-semibold hover:bg-neutral-700 transition disabled:opacity-50"
                >
                    {loading ? 'Enviando solicitud...' : '📨 Enviar solicitud'}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-4">
                    Al enviar aceptas que el municipio revise tu información. No se requiere crear una cuenta.
                </p>
            </form>
        </div>
    );
};

export default ServiceRequest;