import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Home, ShoppingBag, Tag, Info, Package } from 'lucide-react';
import type { Producto, ApiResponse } from '@/types/store';
import AddToCartAction from '@/components/AddToCartAction';

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

  const precio = parseFloat(producto.precio);
  const esUltimasUnidades = producto.stock > 0 && producto.stock <= 5;

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-64px)] pb-24">
      {/* ── Breadcrumbs ── */}
      <div className="bg-white border-b border-gray-200 py-4">
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

      {/* ── Producto Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 md:mt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Izquierda: Imagen */}
          <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 relative border-r border-gray-100">
            {/* Badges Flotantes sobre la imagen */}
            <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
              <span className="bg-white text-gray-800 font-black text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200 flex items-center gap-1.5">
                <Tag size={12} className="text-blue-600" />
                {producto.category.nombre}
              </span>
              {esUltimasUnidades && (
                <span className="bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm shadow-amber-200 animate-pulse">
                  ¡Últimas {producto.stock} unidades!
                </span>
              )}
            </div>

            <div className="relative w-full aspect-square max-w-md flex items-center justify-center">
              {producto.imagen_url ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="object-contain w-full h-full drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 gap-4">
                  <ShoppingBag size={80} strokeWidth={0.5} />
                  <span className="text-sm font-medium">Sin imagen disponible</span>
                </div>
              )}
            </div>
          </div>

          {/* Derecha: Detalles */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-2">
              <p className="text-xs font-mono text-gray-400 tracking-widest uppercase mb-2">
                SKU: {producto.sku}
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {producto.nombre}
              </h1>
            </div>

            {/* Precio */}
            <div className="my-6 py-6 border-y border-gray-100 flex items-end gap-2">
              <span className="text-lg font-bold text-gray-400 mb-1">S/</span>
              <span className="text-5xl font-black text-blue-600 tracking-tighter leading-none">
                {precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-medium text-gray-400 ml-2 mb-1">inc. IGV</span>
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Info size={16} className="text-blue-500" />
                  Descripción del Producto
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Beneficios estáticos */}
            <ul className="space-y-3 mb-10">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Producto original con <strong>garantía de fábrica</strong>.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>Envío seguro a <strong>nivel nacional</strong>.</span>
              </li>
            </ul>

            {/* Widget de Compra (Client Component) */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <AddToCartAction producto={producto} />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
