import { useState, useEffect } from 'react';
import api from '../api/axios';

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
                console.error('Error cargando fechas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDates();
    }, []);

    const categories = ['all', 'feriado', 'festividad', 'evento', 'conmemorativo'];
    const categoryColors = {
        feriado: '#dc3545',
        festividad: '#ffc107',
        evento: '#28a745',
        conmemorativo: '#007bff'
    };

    const filteredDates = selectedCategory === 'all' 
        ? dates 
        : dates.filter(d => d.category === selectedCategory);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando calendario...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: '#8B4513' }}>📅 Calendario de Fechas Importantes</h1>
            <p>Descubre las festividades y eventos de Quillacollo</p>
            
            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            background: selectedCategory === cat ? '#8B4513' : '#f8f9fa',
                            color: selectedCategory === cat ? '#fff' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Lista de fechas */}
            {filteredDates.length === 0 ? (
                <p>No hay fechas para esta categoría.</p>
            ) : (
                filteredDates.map(date => (
                    <div
                        key={date.id}
                        style={{
                            padding: '15px',
                            marginBottom: '10px',
                            borderLeft: `4px solid ${categoryColors[date.category] || '#6c757d'}`,
                            background: '#f8f9fa',
                            borderRadius: '4px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{date.title}</h3>
                            <span style={{
                                background: categoryColors[date.category] || '#6c757d',
                                color: '#fff',
                                padding: '2px 12px',
                                borderRadius: '12px',
                                fontSize: '12px'
                            }}>
                                {date.category}
                            </span>
                        </div>
                        <p style={{ margin: '5px 0' }}>
                            📅 {new Date(date.date).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                            })}
                            {date.is_recurring && ' 🔄 (Anual)'}
                        </p>
                        <p>{date.description}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Calendar;