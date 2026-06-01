'use client';

import React from 'react';

interface Marca {
  id: string;
  nombre: string;
  logo_url?: string | null;
}

interface BrandMarqueeProps {
  marcas: Marca[];
}

export default function BrandMarquee({ marcas }: BrandMarqueeProps) {
  if (!marcas || marcas.length === 0) return null;

  // Duplicamos el arreglo para que el scroll infinito se vea continuo
  const duplicatedMarcas = [...marcas, ...marcas, ...marcas, ...marcas];

  return (
    <div className="relative w-full bg-[#050f1c] border-b border-[#0f1f38] overflow-hidden flex" style={{ height: '100px' }}>
      
      {/* Etiqueta Izquierda Fija */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center bg-[#050f1c] px-6 md:px-10 border-r border-slate-800 shadow-[10px_0_20px_rgba(5,15,28,0.9)]">
        <h3 className="text-white font-extrabold text-[11px] md:text-sm uppercase tracking-widest leading-snug">
          Respaldados<br />
          Por <span className="text-red-500">Marcas</span><br />
          Líderes
        </h3>
      </div>

      {/* Gradiente derecho para suavizar la salida */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050f1c] to-transparent z-10 pointer-events-none" />

      {/* Contenedor Animado */}
      <div className="flex items-center h-full ml-[160px] md:ml-[220px]">
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {duplicatedMarcas.map((marca, i) => (
            <div key={`${marca.id}-${i}`} className="flex items-center justify-center px-4 md:px-8 shrink-0">
              {marca.logo_url ? (
                <div className="w-40 h-16 md:w-56 md:h-20 bg-white rounded-md shadow-sm flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={marca.logo_url} 
                    alt={marca.nombre} 
                    className="w-full h-full object-contain scale-[1.3] md:scale-[1.4]" 
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-32 h-14 md:w-40 md:h-16 bg-white rounded-md shadow-sm flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                  <span className="text-slate-800 font-black text-sm md:text-base tracking-wider truncate px-2">{marca.nombre}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
