'use client';

/**
 * components/HeroCarousel.tsx
 *
 * Carrusel automático de banners con:
 *  - Auto-avance cada 5 segundos (pausado en hover)
 *  - Transiciones CSS suaves (crossfade)
 *  - Indicadores de punto + flechas de navegación
 *  - Gradiente oscuro superpuesto para texto legible
 *  - Totalmente responsivo (mobile-first)
 *  - Fallback al hero estático cuando no hay banners
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
// Hero estático — se muestra cuando no hay banners
// ─────────────────────────────────────────────

function StaticHero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white overflow-hidden min-h-[520px] flex items-center">
      {/* Orbes decorativos */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center w-full">
        <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-[0.25em] mb-5 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
          <Sparkles size={12} />
          Tienda Oficial
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-none">
          Repreguerra
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mt-2">
            Tu Tienda de Confianza
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mt-4 leading-relaxed">
          Equipos y tecnología con stock real, precios transparentes y entrega garantizada a todo el Perú.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <a
            href="#catalogo"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition shadow-2xl shadow-blue-900/50 flex items-center gap-2 text-sm"
          >
            Ver catálogo <ChevronRight size={18} />
          </a>
          <a
            href="#quienes-somos"
            className="text-gray-400 hover:text-white font-bold px-6 py-4 rounded-xl transition text-sm border border-white/10 hover:border-white/30"
          >
            Sobre nosotros
          </a>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  if (banners.length === 0) return <StaticHero />;

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

  // Auto-avance
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

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
      className="relative overflow-hidden select-none"
      style={{ height: 'clamp(380px, 56vw, 680px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Carrusel de banners"
      aria-roledescription="carousel"
    >
      {/* Slides */}
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Imagen de fondo */}
          <img
            src={banner.imagen_url}
            alt={banner.titulo}
            className="absolute inset-0 w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />

          {/* Gradiente oscuro multicapa */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.25) 100%)',
            }}
          />

          {/* Contenido del banner */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-12 pb-16 max-w-5xl mx-auto w-full left-0 right-0">
            <span className="inline-flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-3 w-fit">
              <Sparkles size={11} /> Oferta destacada
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
              {banner.titulo}
            </h2>
            {banner.enlace_opcional && (
              <Link
                href={banner.enlace_opcional}
                className="mt-6 inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-xl text-sm w-fit"
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
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition border border-white/10 hover:border-white/30"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white flex items-center justify-center transition border border-white/10 hover:border-white/30"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Indicadores (puntos) */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Barra de progreso */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/20">
          <div
            key={current}
            className="h-full bg-blue-400"
            style={{ animation: 'progressBar 5s linear forwards' }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
