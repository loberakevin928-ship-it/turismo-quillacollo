import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
    LayoutDashboard, MapPin, Calendar, Image, Briefcase, Users, 
    BarChart3, Settings, LogOut, Home, Sparkles, Inbox,
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [pendingRequests, setPendingRequests] = useState(0);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await api.get('/admin/service-requests/pending-count');
                setPendingRequests(res.data.pending || 0);
            } catch (err) {
                setPendingRequests(0);
            }
        };
        fetchPending();
    }, [location.pathname]);

    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/sites', label: 'Sitios Turísticos', icon: MapPin },
        { path: '/dashboard/events', label: 'Eventos', icon: Calendar },
        { path: '/dashboard/cultural', label: 'Act. Culturales', icon: Sparkles },
        { path: '/dashboard/gallery', label: 'Galería', icon: Image },
        { path: '/dashboard/services', label: 'Servicios', icon: Briefcase },
        { path: '/dashboard/service-requests', label: 'Solicitudes de Negocios', icon: Inbox, badge: pendingRequests },
        // ---- Solo administrador ----
        ...(isAdmin ? [
            { path: '/dashboard/users', label: 'Usuarios', icon: Users },
            { path: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
            { path: '/dashboard/settings', label: 'Configuración', icon: Settings },
        ] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-sky-50/70">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                            <img src="/logo-quillacollo.svg" alt="Logo Quillacollo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-800">Quillacollo</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Gobierno Municipal</p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                                    active 
                                        ? 'bg-sky-50 text-neutral-900 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-neutral-900' : 'text-gray-400'} />
                                <span className="flex-1">{item.label}</span>
                                {item.badge > 0 && (
                                    <span className="bg-primary text-neutral-900 text-xs font-bold rounded-full px-2 py-0.5">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{user?.full_name || user?.username}</p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 w-full mt-2 px-3 py-2 rounded-lg text-neutral-800 hover:bg-sky-50 transition"
                    >
                        <LogOut size={18} /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido */}
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;