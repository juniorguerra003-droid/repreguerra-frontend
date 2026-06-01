"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, PackageOpen, ShoppingBag, DollarSign, Heart, Sparkles, SlidersHorizontal, Tag, Star
} from 'lucide-react';
import { siteConfig } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/WishlistButton';
import type { Producto, Categoria } from '@/types/store';

// ─────────────────────────────────────────────
// Sub-componente: ProductCard Avanzado
// ─────────────────────────────────────────────

function ProductCard({ producto }: { producto: Producto }) {
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
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative h-full">
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
            <div className="bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
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
                added ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
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

// ─────────────────────────────────────────────
// Componente Principal: CatalogClient
// ─────────────────────────────────────────────

interface CatalogClientProps {
  productos: Producto[];
  categorias: Categoria[];
  marcas: any[];
  initialCategory?: string;
  initialOffersOnly?: boolean;
}

export default function CatalogClient({ productos, categorias, marcas, initialCategory, initialOffersOnly }: CatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyOffers, setOnlyOffers] = useState(initialOffersOnly || false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Toggle helpers
  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  // Filtrado
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      // Búsqueda
      const searchMatch = !searchTerm || 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Categorías
      const catMatch = selectedCategories.length === 0 || selectedCategories.includes(p.categoryId);
      
      // Marcas
      const brandMatch = selectedBrands.length === 0 || (p.brandId && selectedBrands.includes(p.brandId));

      // Ofertas
      const offerMatch = !onlyOffers || p.enOferta;

      return searchMatch && catMatch && brandMatch && offerMatch;
    });
  }, [productos, searchTerm, selectedCategories, selectedBrands, onlyOffers]);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Header del Catálogo */}
      <div className="bg-slate-900 pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Catálogo de Productos
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Encuentra exactamente lo que necesitas usando nuestros filtros avanzados.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Botón Filtros Mobile */}
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden w-full bg-white border border-slate-200 shadow-sm rounded-xl py-3 px-4 font-bold text-slate-800 flex items-center justify-center gap-2"
          >
            <SlidersHorizontal size={18} /> 
            {showMobileFilters ? "Ocultar Filtros" : "Mostrar Filtros Avanzados"}
          </button>

          {/* SIDEBAR (Filtros Izquierdos) */}
          <aside className={`w-full lg:w-72 flex-shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            
            {/* Buscador */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-widest">Buscar</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nombre o SKU..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Ofertas Especiales */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl shadow-sm border border-red-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${onlyOffers ? 'bg-red-600' : 'bg-white border border-red-200 group-hover:border-red-400'}`}>
                  {onlyOffers && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={onlyOffers} onChange={() => setOnlyOffers(!onlyOffers)} />
                <span className="font-extrabold text-red-900">Ver Solo Ofertas 🔥</span>
              </label>
            </div>

            {/* Categorías */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                <Tag size={16} className="text-blue-500" /> Categorías
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {categorias.map(cat => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                      {selectedCategories.includes(cat.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{cat.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Marcas */}
            {marcas.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                  <Star size={16} className="text-amber-500" /> Marcas
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {marcas.map(marca => (
                    <label key={marca.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(marca.id) ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300 group-hover:border-amber-400'}`}>
                        {selectedBrands.includes(marca.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedBrands.includes(marca.id)} onChange={() => toggleBrand(marca.id)} />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{marca.nombre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

          </aside>

          {/* RESULTADOS (Panel Derecho) */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex justify-between items-center">
              <span className="font-medium text-slate-500 text-sm">
                Mostrando <strong className="text-slate-900">{filteredProducts.length}</strong> productos
              </span>
              {/* Optional Sorting here */}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageOpen size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hay resultados</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  No pudimos encontrar productos que coincidan con los filtros seleccionados. Intenta quitar algunos filtros para ver más resultados.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setOnlyOffers(false);
                  }}
                  className="mt-6 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(producto => (
                  <ProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
      
      {/* Estilos para custom scrollbar en el sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
