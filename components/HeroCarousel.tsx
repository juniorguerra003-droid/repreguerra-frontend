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
    <section className="relative bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white overflow-hidden">
      {/* Orbes decorativos */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center w-full">
        <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-[0.25em] mb-5 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
          <Sparkles size={12} />
          Tienda Oficial
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-5 leading-none">
          {siteConfig.name}
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
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-2xl shadow-blue-900/50 flex items-center gap-2 text-sm hover:scale-105"
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
