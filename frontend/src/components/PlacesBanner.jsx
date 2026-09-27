import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Star } from 'lucide-react';
import api, { getImageUrl } from '../api/axios';

const PlacesBanner = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [paused, setPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const resumeTimer = useRef(null);
    const autoTimer = useRef(null);

    const itemAngle = places.length > 0 ? 360 / places.length : 0;
    const radius = isMobile ? 165 : 300;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/places');
                setPlaces(res.data);
            } catch (error) {
                console.error('Error cargando banner de lugares:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Rotación automática cada 3s (se pausa al pasar el mouse)
    useEffect(() => {
        if (paused || places.length < 2) return;
        autoTimer.current = setInterval(() => {
            setRotation((r) => r + itemAngle);
        }, 3000);
        return () => clearInterval(autoTimer.current);
    }, [paused, places.length, itemAngle]);

    const pauseTemporarily = () => {
        setPaused(true);
        clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(() => setPaused(false), 6000);
    };

    useEffect(() => () => clearTimeout(resumeTimer.current), []);

    const handlePrev = () => {
        pauseTemporarily();
        setRotation((r) => r - itemAngle);
    };

    const handleNext = () => {
        pauseTemporarily();
        setRotation((r) => r + itemAngle);
    };

    const goTo = (i) => {
        pauseTemporarily();
        setRotation(-i * itemAngle);
    };

    // Índice del lugar que está al frente del anillo
    const activeIndex = useMemo(() => {
        if (places.length === 0) return 0;
        const normalized = ((rotation % 360) + 360) % 360;
        return Math.round(normalized / itemAngle) % places.length;
    }, [rotation, places.length, itemAngle]);

    const active = places[activeIndex];

    if (loading) {
        return (
            <section className="bg-neutral-950 py-16 flex items-center justify-center">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-sky-400"></div>
            </section>
        );
    }

    if (places.length === 0) return null;

    return (
        <section
            className="relative overflow-hidden text-white"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Fondo negro con resplandores celestes */}
            <div className="absolute inset-0 bg-neutral-950"></div>
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 35%, transparent 70%)'
                }}
            ></div>
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
                    backgroundSize: '28px 28px'
                }}
            ></div>
            {/* Línea superior e inferior celestes */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"></div>

            <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-10">
                <div className="text-center mb-6">
                    <p className="text-sky-400 font-bold tracking-[0.3em] uppercase text-xs">Explora</p>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2">Destinos turísticos</h2>
                    <div className="mx-auto mt-3 w-16 h-0.5 bg-sky-400"></div>
                    <p className="text-white/60 mt-3 text-sm md:text-base">
                        {places.length} destinos de Quillacollo en 360°
                    </p>
                </div>

                {/* Escenario 3D */}
                <div
                    className="relative flex items-center justify-center"
                    style={{ height: isMobile ? 230 : 330, perspective: '1300px', zIndex: 1 }}
                >
                    {/* Anillo giratorio */}
                    <div
                        className="absolute"
                        style={{
                            width: radius * 2,
                            height: radius * 2,
                            top: '50%',
                            left: '50%',
                            marginLeft: -radius,
                            marginTop: -radius,
                            transformStyle: 'preserve-3d',
                            transform: `rotateY(${rotation}deg)`,
                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {places.map((place, i) => {
                            const cardAngle = i * itemAngle;
                            const offset = ((cardAngle + rotation) % 360 + 360) % 360;
                            const inFront = offset <= 110 || offset >= 250;
                            const isActive = i === activeIndex;
                            return (
                                <div
                                    key={place.id}
                                    className="absolute"
                                    style={{
                                        width: isMobile ? 150 : 200,
                                        height: isMobile ? 185 : 240,
                                        top: '50%',
                                        left: '50%',
                                        marginLeft: isMobile ? -75 : -100,
                                        marginTop: isMobile ? -92 : -120,
                                        transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                                        backfaceVisibility: 'hidden',
                                        visibility: inFront ? 'visible' : 'hidden',
                                        transformStyle: 'preserve-3d'
                                    }}
                                >
                                    <Link
                                        to={`/place/${place.id}`}
                                        className={`block w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ${
                                            isActive
                                                ? 'ring-2 ring-sky-400 scale-105'
                                                : 'opacity-75 hover:opacity-100'
                                        }`}
                                        style={{
                                            background: '#0B0B0B',
                                            boxShadow: isActive
                                                ? '0 0 45px rgba(56,189,248,0.45), 0 50px 80px rgba(0,0,0,0.7)'
                                                : '0 30px 50px rgba(0,0,0,0.6)'
                                        }}
                                    >
                                        <div className="relative w-full h-full">
                                            {place.image_url ? (
                                                <img
                                                    src={getImageUrl(place.image_url)}
                                                    alt={place.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-900"></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                                <span className="bg-black/60 backdrop-blur border border-sky-400/40 text-sky-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium truncate max-w-[80%]">
                                                    {place.category_name}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <h3 className="font-bold text-white text-sm md:text-base truncate">
                                                    {place.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Star
                                                        className="fill-sky-400 text-sky-400"
                                                        size={13}
                                                    />
                                                    <span className="text-sm font-semibold text-sky-300">
                                                        {place.average_rating
                                                            ? Number(place.average_rating).toFixed(1)
                                                            : 'Nuevo'}
                                                    </span>
                                                    <span className="text-[11px] text-white/50">
                                                        ({place.total_reviews || 0} reseñas)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sombra elíptica en el suelo simula profundidad */}
                    <div
                        className="absolute bottom-0"
                        style={{
                            width: radius * 2.2,
                            height: (radius * 2.2) / 4,
                            background:
                                'radial-gradient(ellipse at center, rgba(56,189,248,0.25) 0%, rgba(0,0,0,0.5) 55%, transparent 75%)'
                        }}
                    ></div>
                </div>

                {/* Panel del destino activo */}
                <div className="relative max-w-2xl mx-auto text-center mt-8 md:mt-4 min-h-[96px]">
                    <div key={activeIndex} className="animate-fadeInPortal">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
                            <MapPin size={14} className="text-sky-400" />
                            Destino seleccionado
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mt-1">{active?.name}</h3>
                        <p className="text-white/60 text-sm mt-2 line-clamp-2">
                            {active?.description}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/15 rounded-full px-3 py-1.5 text-sm">
                                <Star className="fill-sky-400 text-sky-400" size={14} />
                                <strong className="text-sky-300">
                                    {Number(active?.average_rating || 0).toFixed(1)}
                                </strong>
                                <span className="text-white/50 text-xs">
                                    ({active?.total_reviews || 0})
                                </span>
                            </span>
                            <Link
                                to={`/place/${active?.id}`}
                                className="inline-flex items-center gap-2 bg-sky-400 text-black font-semibold px-5 py-2 rounded-full hover:bg-sky-300 transition shadow-lg shadow-sky-400/25"
                            >
                                Ver detalle <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        onClick={handlePrev}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-sky-400 hover:text-black border border-white/20 transition"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-1.5">
                        {places.map((place, i) => (
                            <button
                                key={place.id}
                                onClick={() => goTo(i)}
                                aria-label={`Ir a ${place.name}`}
                                className={`rounded-full transition-all duration-300 ${
                                    i === activeIndex
                                        ? 'w-6 h-1.5 bg-sky-400'
                                        : 'w-1.5 h-1.5 bg-white/25 hover:bg-white/60'
                                }`}
                            ></button>
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-sky-400 hover:text-black border border-white/20 transition"
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Barra de progreso de la rotación */}
                <div className="max-w-xs mx-auto mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                        key={rotation}
                        className="h-full bg-sky-400 rounded-full origin-left"
                        style={{ animation: 'banner-progress 3s linear forwards' }}
                    ></div>
                </div>
            </div>

            <style>{`
                @keyframes banner-progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </section>
    );
};

export default PlacesBanner;