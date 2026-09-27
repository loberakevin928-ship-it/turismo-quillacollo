import { useState, useEffect } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
import api, { getImageUrl } from '../api/axios';

const Calendar = () => {
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchDates = async () => {
            try {
                const res = await api.get('/important-dates');
                setDates(res.data);
            } catch (error) {
                console.error('Error cargando actividades:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDates();
    }, []);

    const categories = [
        { value: 'all', label: 'Todas', color: '#0B0B0B' },
        { value: 'festividad', label: 'Festividad', color: '#7DD3FC' },
        { value: 'feriado', label: 'Feriado', color: '#0B0B0B' },
        { value: 'evento', label: 'Evento', color: '#7DD3FC' },
        { value: 'conmemorativo', label: 'Conmemorativo', color: '#38BDF8' }
    ];

    const selectedCat = categories.find(c => c.value === selectedCategory);
    const categoryColors = Object.fromEntries(categories.map(c => [c.value, c.color]));

    const filteredDates = selectedCategory === 'all'
        ? dates
        : dates.filter(d => d.category === selectedCategory);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <CalendarDays className="text-primary" size={32} />
                    Actividades Culturales
                </h1>
                <p className="text-gray-500 mt-2">Descubre las festividades y eventos de Quillacollo</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                            selectedCategory === cat.value
                                ? 'text-white shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                        style={selectedCategory === cat.value ? { background: cat.color, borderColor: cat.color } : {}}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {filteredDates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="text-lg">No hay actividades para esta categoría.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredDates.map(date => (
                        <div
                            key={date.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
                        >
                            {date.image_url ? (
                                <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                                    <img
                                        src={getImageUrl(date.image_url)}
                                        alt={date.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="sm:w-48 h-48 sm:h-auto flex-shrink-0 flex items-center justify-center"
                                    style={{ background: `${categoryColors[date.category] || '#38BDF8'}20` }}
                                >
                                    <CalendarDays size={40} style={{ color: categoryColors[date.category] || '#38BDF8' }} />
                                </div>
                            )}
                            <div className="p-5 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-bold text-gray-800">{date.title}</h3>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold text-white flex-shrink-0"
                                        style={{ background: categoryColors[date.category] || '#38BDF8' }}
                                    >
                                        {categories.find(c => c.value === date.category)?.label || date.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays size={14} />
                                        {new Date(date.date).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    {date.is_recurring === 1 && (
                                        <span className="flex items-center gap-1 text-sky-500">
                                            <RotateCcw size={14} /> Anual
                                        </span>
                                    )}
                                </div>
                                {date.description && (
                                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">{date.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Calendar;
