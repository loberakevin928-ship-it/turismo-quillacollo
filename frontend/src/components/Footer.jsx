import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import VisitorCounter from './VisitorCounter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Franja de la bandera (celeste y blanco) */}
      <div className="flex h-2">
        <span className="flex-1 bg-primary"></span>
        <span className="flex-[0.5] bg-white"></span>
        <span className="flex-1 bg-primary"></span>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Información institucional */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              Gobierno Autónomo Municipal de Quillacollo
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Trabajando por el desarrollo turístico y cultural de nuestra provincia.
            </p>
            <div className="flex items-center gap-2 text-sm mt-4">
              <MapPin size={16} className="text-secondary" />
              <span>Plaza 14 de Septiembre, Quillacollo - Cochabamba</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Phone size={16} className="text-secondary" />
              <span>+591 4 1234567</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <Mail size={16} className="text-secondary" />
              <span>contacto@quillacollo.gob.bo</span>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces de interés</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-secondary transition">Inicio</Link></li>
              <li><Link to="/services" className="hover:text-secondary transition">Servicios Turísticos</Link></li>
              <li><Link to="/calendar" className="hover:text-secondary transition">Calendario</Link></li>
              <li><Link to="/dashboard" className="hover:text-secondary transition">Panel de Administración</Link></li>
            </ul>
          </div>

          {/* Columna 3: Redes sociales */}
          <div>
            <h4 className="text-white font-semibold mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary/20 transition"
                aria-label="Facebook"
              >
                <FaFacebook size={20} className="text-secondary" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary/20 transition"
                aria-label="Instagram"
              >
                <FaInstagram size={20} className="text-secondary" />
              </a>
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary/20 transition"
                aria-label="Twitter"
              >
                <FaTwitter size={20} className="text-secondary" />
              </a>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Síguenos para estar al tanto de todas las novedades y eventos.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500 flex flex-col md:flex-row items-center justify-center gap-3">
          <span>© {currentYear} Gobierno Autónomo Municipal de Quillacollo. Todos los derechos reservados.</span>
          <VisitorCounter />
        </div>
      </div>
    </footer>
  );
};

export default Footer;