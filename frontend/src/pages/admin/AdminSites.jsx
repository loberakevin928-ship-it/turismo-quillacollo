import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AdminSites = () => {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await api.get('/admin/places');
                setSites(res.data);
            } catch (error) {
                console.error('Error cargando sitios:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSites();
    }, []);

    if (loading) return <div>Cargando sitios...</div>;

    return (
        <div>
            <h1>Gestión de Sitios Turísticos</h1>
            <p>Total: {sites.length} sitios</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Categoría</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {sites.map(site => (
                        <tr key={site.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{site.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{site.name}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{site.category_name}</td>
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

export default AdminSites;