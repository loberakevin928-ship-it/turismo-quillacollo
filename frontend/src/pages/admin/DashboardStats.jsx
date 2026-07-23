import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, MapPin, Calendar, Image, Briefcase, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

const DashboardStats = () => {
    const [stats, setStats] = useState({ totalSites: 0, totalEvents: 0, totalUsers: 0, totalImages: 0, totalServices: 0 });
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, recentRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/recent-activity').catch(() => ({ data: [] }))
                ]);
                setStats({
                    totalSites: statsRes.data.totalSites || 0,
                    totalEvents: statsRes.data.totalEvents || 0,
                    totalUsers: statsRes.data.totalUsers || 0,
                    totalImages: statsRes.data.totalImages || 0,
                    totalServices: statsRes.data.totalServices || 0,
                });
                setRecent(recentRes.data || []);
            } catch (error) {
                console.error('Error cargando dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const cardData = [
        { title: 'Sitios', value: stats.totalSites, icon: MapPin, color: '#1E3A8A' },
        { title: 'Eventos', value: stats.totalEvents, icon: Calendar, color: '#D4AF37' },
        { title: 'Usuarios', value: stats.totalUsers, icon: Users, color: '#22C55E' },
        { title: 'Galería', value: stats.totalImages, icon: Image, color: '#8B5CF6' },
        { title: 'Servicios', value: stats.totalServices || 0, icon: Briefcase, color: '#F59E0B' },
    ];

    // Datos de ejemplo para el gráfico (reemplazar con datos reales si los tienes)
    const monthlyData = [
        { month: 'Ene', visits: 400 },
        { month: 'Feb', visits: 300 },
        { month: 'Mar', visits: 600 },
        { month: 'Abr', visits: 800 },
        { month: 'May', visits: 700 },
        { month: 'Jun', visits: 900 },
    ];

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-gray-500">Bienvenido, Administrador</p>
            </div>

            {/* Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {cardData.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{item.title}</p>
                                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                            </div>
                            <div className="p-3 rounded-full" style={{ backgroundColor: item.color + '20' }}>
                                <item.icon size={24} style={{ color: item.color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Gráfico y actividad reciente en dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                        <TrendingUp className="mr-2" size={18} /> Visitas Mensuales
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="visits" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">📋 Última Actividad</h3>
                    <ul className="space-y-3">
                        {recent.length === 0 ? (
                            <li className="text-gray-400 text-sm">Sin actividad reciente</li>
                        ) : (
                            recent.slice(0, 5).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm border-b border-gray-50 pb-2">
                                    <span className="text-blue-600">•</span>
                                    <div>
                                        <p className="text-gray-700">{item.activity}</p>
                                        <p className="text-gray-400 text-xs">{item.user} · {new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;