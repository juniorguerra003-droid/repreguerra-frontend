import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, ShoppingBag, Tag, Info, ShieldCheck, Truck, Store } from 'lucide-react';
import type { Producto, ApiResponse } from '@/types/store';
import AddToCartAction from '@/components/AddToCartAction';
import ProductCard from '@/components/ProductCard';

export const revalidate = 60; // SSR + ISR cada 60s

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchProducto(id: string): Promise<Producto | null> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json: ApiResponse<Producto> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

async function fetchRelatedProducts(categoryId: string, excludeId: string): Promise<Producto[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products?categoryId=${categoryId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Producto[]> = await res.json();
    if (!json.success) return [];
    return json.data.filter(p => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const producto = await fetchProducto(id);

  if (!producto) {
    return { title: 'Producto no encontrado | Repreguerra' };
  }

  return {
    title: `${producto.nombre} | Repreguerra`,
    description: producto.descripcion || `Compra ${producto.nombre} en Repreguerra con garantía y envío a todo el Perú.`,
    openGraph: {
      title: producto.nombre,
      images: producto.imagen_url ? [producto.imagen_url] : [],
    },
  };
}

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const producto = await fetchProducto(id);

  if (!producto) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(producto.categoryId, producto.id);
  
  const precio = parseFloat(producto.precio);
  const esUltimasUnidades = producto.stock > 0 && producto.stock <= 5;

  return (
    <main className="bg-gray-50/50 min-h-[calc(100vh-64px)] pb-24">
      {/* ── Breadcrumbs ── */}
      <div className="bg-white border-b border-gray-200 py-3 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
            <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1.5">
              <Home size={14} /> Inicio
            </Link>
            <ChevronRight size={14} className="mx-2 text-gray-300 flex-shrink-0" />
            <Link href="/#catalogo" className="hover:text-blue-600 transition">
              Catálogo
            </Link>
            <ChevronRight size={14} className="mx-2 text-gray-300 flex-shrink-0" />
            <span className="text-gray-400 cursor-default">
              {producto.category.nombre}
            </span>
            <ChevronRight size={14} className="mx-2 text-gray-300 flex-shrink-0" />
            <span className="text-gray-900 font-bold truncate max-w-[200px] sm:max-w-md" aria-current="page">
              {producto.nombre}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ── Izquierda: Imagen y Detalles (Scrollable) ── */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Contenedor Principal Imagen */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row p-6 md:p-10 relative group">
              {/* Badges Flotantes */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                <span className="bg-blue-50 text-blue-700 font-black text-xs px-3 py-1.5 rounded-full shadow-sm border border-blue-100 flex items-center gap-1.5">
                  <Tag size={12} className="text-blue-600" />
                  {producto.category.nombre}
                </span>
                {esUltimasUnidades && (
                  <span className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                    ¡Últimas {producto.stock}!
                  </span>
                )}
              </div>

              <div className="relative w-full aspect-square flex items-center justify-center bg-white rounded-2xl">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="object-contain w-[90%] h-[90%] drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300 gap-4">
                    <ShoppingBag size={80} strokeWidth={0.5} />
                    <span className="text-sm font-medium">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción Larga */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Info className="text-blue-600" />
                Características del Producto
              </h3>
              {producto.descripcion ? (
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                  {producto.descripcion}
                </p>
              ) : (
                <p className="text-gray-400 italic">No hay descripción detallada disponible para este producto.</p>
              )}
            </div>

          </div>

          {/* ── Derecha: Buy Box (Sticky) ── */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 flex flex-col gap-6">
            
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-200 p-6 sm:p-8">
              
              {/* Marca */}
              {producto.brand && (
                <div className="mb-4">
                  {producto.brand.logo_url ? (
                    <img src={producto.brand.logo_url} alt={producto.brand.nombre} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-blue-600 tracking-wider uppercase">{producto.brand.nombre}</span>
                  )}
                </div>
              )}

              {/* Título y SKU */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                {producto.nombre}
              </h1>
              <p className="text-xs font-mono text-gray-400 tracking-widest uppercase mb-6">
                SKU: {producto.sku}
              </p>

              {/* Precio Box */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-400 mb-1">S/</span>
                  <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
                    {precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 mt-2">
                  <Store size={16} /> Precio incluye IGV
                </p>
              </div>

              {/* Add To Cart Widget */}
              <AddToCartAction producto={producto} />

              {/* Beneficios */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <ShieldCheck className="text-emerald-500 flex-shrink-0" size={20} />
                  <span><strong>Garantía Oficial</strong><br/><span className="text-xs text-gray-500">Respaldo directo de la marca.</span></span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Truck className="text-blue-500 flex-shrink-0" size={20} />
                  <span><strong>Envíos a todo el Perú</strong><br/><span className="text-xs text-gray-500">Despacho seguro y garantizado.</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Productos Relacionados ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              Productos Similares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} producto={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
