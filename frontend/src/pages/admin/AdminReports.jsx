import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admin/reports/overview');
                setData(res.data);
            } catch (error) {
                console.error('Error cargando reportes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Cargando reportes...</div>;

    const stats = [
        { title: 'Sitios Turísticos', value: data?.totalSites || 0, color: '#0B0B0B' },
        { title: 'Usuarios', value: data?.totalUsers || 0, color: '#38BDF8' },
        { title: 'Eventos', value: data?.totalEvents || 0, color: '#BAE6FD' },
        { title: 'Reseñas', value: data?.totalReviews || 0, color: '#38BDF8' }
    ];

    const COLORS = ['#0B0B0B', '#38BDF8', '#BAE6FD', '#38BDF8'];

    return (
        <div>
            <h1>Reportes y Estadísticas</h1>
            <p>Resumen general de la actividad turística en Quillacollo</p>

            {/* Tarjetas de estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
                {stats.map((stat, index) => (
                    <div key={index} style={{ padding: '20px', background: '#FFFFFF', borderRadius: '8px', textAlign: 'center' }}>
                        <h2 style={{ margin: 0, color: stat.color }}>{stat.value}</h2>
                        <p style={{ margin: '5px 0 0', color: '#666' }}>{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Gráfico de visitas mensuales */}
            {data?.monthlyVisits && data.monthlyVisits.length > 0 && (
                <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
                    <h3>Visitas Mensuales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.monthlyVisits}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="visits" fill="#0B0B0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Gráfico de distribución */}
            <div style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
                <h3>Distribución General</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={stats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#38BDF8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AdminReports;