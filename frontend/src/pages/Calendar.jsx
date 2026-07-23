import { useEffect, useState } from 'react';
import api from '../api/axios';
import heroImage from '../assets/hero.png';

const Calendar = () => {
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDates = async () => {
            try {
                const res = await api.get('/important-dates');
                setDates(res.data);
            } catch (err) {
                setError('No se pudo cargar el calendario');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDates();
    }, []);

    if (loading) return <div className="centered-message">Cargando calendario...</div>;

    return (
        <div className="calendar-page">
            <header className="page-header calendar-header">
                <div>
                    <p className="eyebrow">Calendario de Fechas Importantes</p>
                    <h1>Descubre las celebraciones más importantes de Quillacollo</h1>
                    <p>Un recorrido visual con los días que marcan la identidad de la región.</p>
                    <div className="calendar-filters">
                        <button className="button button--ghost button--small">Todos</button>
                        <button className="button button--ghost button--small">Festividades</button>
                        <button className="button button--ghost button--small">Eventos</button>
                        <button className="button button--ghost button--small">Conmemorativos</button>
                    </div>
                </div>
                <img src={heroImage} alt="Celebraciones de Quillacollo" className="calendar-page__hero" />
            </header>
            {error && <div className="alert alert--error">{error}</div>}
            <div className="calendar-grid">
                <div className="calendar-box">
                    <div className="calendar-month">
                        <div className="calendar-month__header">
                            <span>Agosto 2024</span>
                            <div className="calendar-month__nav">
                                <button>‹</button>
                                <button>›</button>
                            </div>
                        </div>
                        <div className="calendar-month__grid">
                            {['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'].map((day) => (
                                <span key={day} className="calendar-month__dayname">{day}</span>
                            ))}
                            {Array.from({ length: 35 }).map((_, idx) => (
                                <div key={idx} className="calendar-month__day">
                                    <span>{idx < 15 ? idx + 1 : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="calendar-list">
                    {dates.length === 0 ? (
                        <div>No hay fechas registradas.</div>
                    ) : (
                        dates.map((date) => (
                            <article key={date.id} className="calendar-card">
                                <div className="calendar-card__date">
                                    <strong>{new Date(date.event_date).toLocaleDateString('es-BO', { day: '2-digit' })}</strong>
                                    <span>{new Date(date.event_date).toLocaleDateString('es-BO', { month: 'short' }).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3>{date.title}</h3>
                                    <p>{date.location || 'Ubicación no especificada'}</p>
                                    <small>{date.description || 'No hay descripción disponible.'}</small>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
