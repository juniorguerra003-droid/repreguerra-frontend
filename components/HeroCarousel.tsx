'use client';

/**
 * components/HeroCarousel.tsx
 *
 * Dos secciones independientes:
 *  1. Hero estático (SIEMPRE visible) — branding "Repreguerra"
 *  2. Carrusel de banners (DEBAJO del hero) — solo si hay banners activos
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface Banner {
  id: string;
  titulo: string;
  imagen_url: string;
  enlace_opcional: string | null;
}

interface HeroCarouselProps {
  banners: Banner[];
}

// ─────────────────────────────────────────────
// Sección 1: Hero estático (siempre visible)
// ─────────────────────────────────────────────

function StaticHero() {
  return (
    <section className="relative bg-[#070B19] text-white overflow-hidden border-b border-white/5">
      {/* Patrón de cuadrícula sutil (orgánico, no neón) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Contenido Izquierdo */}
          <div className="flex flex-col items-start space-y-8 pt-4">
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-white">
              Tecnología de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Alta Gama</span> <br />
              Para tu Seguridad
            </h1>
            
            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-lg font-medium">
              Equipamiento profesional en videovigilancia y redes con garantía real, asesoría especializada y envío a todo el Perú.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-4">
              <Link
                href="/catalogo"
                className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 font-extrabold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                Explorar Catálogo <ChevronRight size={18} />
              </Link>
              <a
                href="#quienes-somos"
                className="w-full sm:w-auto text-white hover:text-gray-300 font-bold px-8 py-4 rounded-2xl transition text-sm border border-white/20 hover:border-white/40 flex items-center justify-center bg-white/5 backdrop-blur-sm"
              >
                Nuestra Historia
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-8 border-t border-white/10 w-full mt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">10+</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Años de Exp.</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">100%</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Garantía Real</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">24/7</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Soporte</span>
              </div>
            </div>
          </div>

          {/* Imagen Derecha (Orgánica, elaborada) */}
          <div className="relative hidden lg:block h-[600px] w-full group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]">
              <img 
                src="/hero-bg.png" 
                alt="Equipos de seguridad profesional" 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B19] via-transparent to-transparent" />
            </div>
            {/* Elemento flotante decorativo */}
            <div className="absolute -bottom-8 -left-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl transform transition-transform duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Stock Disponible</p>
                  <p className="text-gray-400 text-xs">Envíos inmediatos a nivel nacional</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Carrusel de banners (debajo del hero)
// ─────────────────────────────────────────────

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((index + banners.length) % banners.length);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [banners.length, isTransitioning]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-avance cada 5s
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next, banners.length]);

  // Teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const activeBanner = banners[current];

  return (
    <section
      className="relative overflow-hidden select-none bg-gray-950"
      style={{ height: 'clamp(280px, 40vw, 500px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrusel de banners publicitarios"
      aria-roledescription="carousel"
    >
      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={banner.imagen_url}
            alt={banner.titulo}
            className="absolute inset-0 w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />

          {/* Gradiente oscuro para legibilidad */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.15) 100%)',
            }}
          />

          {/* Contenido del banner */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-12 pb-16 max-w-5xl mx-auto w-full left-0 right-0 z-[2]">
            <span className="inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-3 w-fit">
              <Sparkles size={11} /> Oferta destacada
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
              {banner.titulo}
            </h2>
            {banner.enlace_opcional && (
              <Link
                href={banner.enlace_opcional}
                className="mt-5 inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-xl text-sm w-fit"
              >
                Ver oferta <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Flechas de navegación */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Banner anterior"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-[20] w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente banner"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[20] w-12 h-12 rounded-full bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center transition-all shadow-xl hover:scale-110 cursor-pointer"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Indicadores (puntos) */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[20] flex items-center gap-2.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-10 h-3 bg-white shadow-lg'
                  : 'w-3 h-3 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      {banners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-[20] h-1 bg-white/20">
          <div
            key={`${current}-${isPaused}`}
            className="h-full bg-blue-500"
            style={{
              animation: isPaused ? 'none' : 'bannerProgress 4s linear forwards',
              width: isPaused ? undefined : undefined,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes bannerProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente exportado: Hero + Carrusel
// ─────────────────────────────────────────────

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  return (
    <>
      {/* 1. Hero institucional — SIEMPRE se muestra */}
      <StaticHero />

      {/* 2. Carrusel de banners — SOLO si hay banners activos */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}
    </>
  );
}
