import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/admin/events');
                setEvents(res.data || []);
            } catch (error) {
                console.error('Error cargando eventos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <div>Cargando eventos...</div>;

    return (
        <div>
            <h1>Gestión de Eventos</h1>
            <p>Total: {events.length} eventos</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Título</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Fecha</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(event => (
                        <tr key={event.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{event.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{event.title}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(event.start_date).toLocaleDateString()}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button style={{ marginRight: '5px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px' }}>Editar</button>
                                <button style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminEvents;