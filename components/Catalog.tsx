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

import ProductCard from '@/components/ProductCard';

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
