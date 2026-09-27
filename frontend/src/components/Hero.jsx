import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-900 text-white overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 bg-cover bg-center"
        style={{ backgroundImage: "url('http://localhost:5000/uploads/activities/virgen-urkupina.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 to-neutral-900/70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <p className="text-secondary font-semibold tracking-wider uppercase text-sm mb-2">Gobierno Autónomo Municipal de Quillacollo</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Descubre <span className="text-secondary">Quillacollo</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-sky-100 max-w-2xl mx-auto md:mx-0">
            Tierra de fe, cultura y tradición. Conoce los mejores atractivos turísticos y vivencias de nuestra tierra.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-secondary text-neutral-900 font-semibold px-6 py-3 rounded-lg hover:bg-sky-400 transition shadow-lg"
            >
              Explorar ahora <ArrowRight size={20} />
            </Link>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-medium px-6 py-3 rounded-lg hover:bg-white/30 transition border border-white/30"
            >
              Actividades culturales
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <img
            src="http://localhost:5000/uploads/activities/virgen-urkupina.jpg"
            alt="Virgen de Urkupiña - Patrona de Quillacollo"
            className="rounded-2xl shadow-2xl max-w-sm w-full object-cover h-64 md:h-80 border-4 border-white/20"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;