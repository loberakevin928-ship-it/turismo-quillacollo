import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, MapPin, Calendar, Image, Briefcase, Users, 
    BarChart3, Settings, LogOut, Home, 
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/sites', label: 'Sitios Turísticos', icon: MapPin },
        { path: '/dashboard/events', label: 'Eventos', icon: Calendar },
        { path: '/dashboard/gallery', label: 'Galería', icon: Image },
        { path: '/dashboard/services', label: 'Servicios', icon: Briefcase },
        { path: '/dashboard/users', label: 'Usuarios', icon: Users },
        { path: '/dashboard/reports', label: 'Reportes', icon: BarChart3 },
        { path: '/dashboard/settings', label: 'Configuración', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">Q</div>
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
                                        ? 'bg-blue-50 text-blue-900 font-medium shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <Icon size={18} className={active ? 'text-blue-900' : 'text-gray-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{user?.full_name || user?.username}</p>
                            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 w-full mt-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
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