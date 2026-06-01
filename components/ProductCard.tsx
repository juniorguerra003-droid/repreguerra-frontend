'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/WishlistButton';
import type { Producto } from '@/types/store';

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Parseamos los precios
  const precioBase = parseFloat(producto.precio || "0");
  const precioOferta = producto.precioOferta ? parseFloat(producto.precioOferta) : null;
  
  // Regla de Negocio: Ocultar o Mostrar Precio
  const { mostrarPrecio, enOferta } = producto;
  
  const precioFinal = enOferta && precioOferta ? precioOferta : precioBase;

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: precioFinal,
      imagen_url: producto.imagen_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleQuoteWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    const phone = siteConfig.whatsappNumbers[0].number.replace(/\D/g, '');
    const message = `Hola Representaciones Guerra, deseo cotizar el producto: ${producto.nombre} (SKU: ${producto.sku})`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative h-full">
      <Link href={`/producto/${producto.id}`} className="absolute inset-0 z-0" aria-label={`Ver ${producto.nombre}`} />

      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-4 z-10">
        <WishlistButton productId={producto.id} />
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <ShoppingBag size={48} strokeWidth={1} />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {producto.category && (
            <div className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {producto.category.nombre}
            </div>
          )}
          {enOferta && (
            <div className="bg-red-600 shadow-lg text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
              OFERTA
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow gap-3 z-10 pointer-events-none">
        <div>
          {producto.brand && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{producto.brand.nombre}</p>
          )}
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {producto.nombre}
          </h3>
          <p className="text-[11px] text-gray-400 font-mono tracking-wider uppercase">SKU: {producto.sku}</p>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-3 pointer-events-auto">
          {/* Regla: Mostrar u Ocultar Precio */}
          {mostrarPrecio ? (
            <div className="flex flex-col">
              {enOferta && precioOferta ? (
                <>
                  <span className="text-xs text-gray-400 line-through font-semibold">
                    S/ {precioBase.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-red-600 font-semibold">S/</span>
                    <span className="text-2xl font-black text-red-600 tracking-tight">
                      {precioOferta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-xs text-gray-400 font-semibold">S/</span>
                  <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
                    {precioBase.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-2.5 px-3 rounded-lg text-center mt-auto">
              {/* Spacer */}
            </div>
          )}

          {/* Botones de Acción */}
          {mostrarPrecio ? (
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                added ? 'bg-green-500 text-white shadow-md' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
              }`}
            >
              {added ? <><Sparkles size={16} /> ¡Añadido!</> : <><ShoppingBag size={16} /> Añadir al carrito</>}
            </button>
          ) : (
            <button
              onClick={handleQuoteWhatsApp}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Cotizar Precio
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
