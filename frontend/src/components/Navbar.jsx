import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useLogo from '../hooks/useLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { logoSrc, loading } = useLogo();

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      {/* Franja de la bandera de Quillacollo (celeste y blanco) */}
      <div className="flex h-2">
        <span className="flex-1 bg-primary"></span>
        <span className="flex-[0.5] bg-white"></span>
        <span className="flex-1 bg-primary"></span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          ) : (
            <img
              src={logoSrc || '/logo-quillacollo.svg'}
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
          <Link to="/calendar" className="hover:text-primary transition">Actividades culturales</Link>
          {user && <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>}
        </div>

        {/* Autenticación */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:inline">👋 {user.full_name || user.username}</span>
              <button
                onClick={logout}
                className="bg-neutral-700 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-neutral-800 transition"
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