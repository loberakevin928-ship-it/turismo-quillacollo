import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useLogo from '../hooks/useLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { logoSrc, loading } = useLogo();

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <img
              src={logoSrc || 'https://via.placeholder.com/60x60/1E3A8A/FFFFFF?text=Q'}
              alt="Logo Quillacollo"
              className="h-10 object-contain"
            />
          )}
          <Link to="/" className="font-bold text-xl text-primary">
            Quillacollo<span className="text-secondary">Turismo</span>
          </Link>
        </div>

        {/* Enlaces centrales */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/" className="hover:text-primary transition">Inicio</Link>
          <Link to="/services" className="hover:text-primary transition">Servicios</Link>
          <Link to="/calendar" className="hover:text-primary transition">Calendario</Link>
          {user && <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>}
        </div>

        {/* Autenticación */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline">👋 {user.full_name || user.username}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="text-primary font-medium hover:underline">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;