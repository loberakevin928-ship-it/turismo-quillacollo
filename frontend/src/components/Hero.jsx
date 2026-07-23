import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary to-blue-800 text-white overflow-hidden">
      {/* Fondo decorativo con imagen (si falla, se ve el degradado) */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/quillacollo/1920/1080')" }}
      ></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Texto */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Descubre <span className="text-secondary">Quillacollo</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto md:mx-0">
            Conoce su cultura, fe y tradiciones. Explora los mejores lugares y eventos de nuestra tierra.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-secondary text-primary font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition shadow-lg"
            >
              Explorar ahora <ArrowRight size={20} />
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-lg hover:bg-white/30 transition border border-white/30"
            >
              Ver eventos
            </Link>
          </div>
        </div>

        {/* Imagen decorativa */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://picsum.photos/seed/quillacollo2/600/400"
            alt="Quillacollo"
            className="rounded-2xl shadow-2xl max-w-sm w-full object-cover h-64 md:h-80"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;