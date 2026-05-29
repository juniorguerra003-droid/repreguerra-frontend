/**
 * app/page.tsx — Server Component
 *
 * Fetch en paralelo: productos, categorías y banners activos.
 * Todos los datos llegan pre-renderizados al cliente (SSR+ISR).
 * La interactividad (carrusel, carrito, filtros) vive en Client Components.
 */

import type { Metadata } from 'next';
import Catalog from '@/components/Catalog';
import HeroCarousel, { type Banner } from '@/components/HeroCarousel';
import type { Producto, Categoria, ApiResponse } from '@/types/store';

export const metadata: Metadata = {
  title: 'Repreguerra – Tienda Oficial | Equipos y Tecnología',
  description:
    'Encuentra los mejores equipos y tecnología en la tienda oficial de Repreguerra. Stock real, precios transparentes y envío a todo el Perú.',
  openGraph: {
    title: 'Repreguerra – Tienda Oficial',
    description: 'Equipos y tecnología con garantía real y envío a todo el Perú.',
    type: 'website',
  },
};

export const revalidate = 60;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchProductos(): Promise<Producto[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Producto[]> = await res.json();
    if (!json.success) return [];
    return json.data.filter((p) => p.stock > 0);
  } catch {
    return [];
  }
}

async function fetchCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Categoria[]> = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE}/api/banners`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? (json.data as Banner[]) : [];
  } catch {
    return [];
  }
}

export default async function StorePage() {
  const [productos, categorias, banners] = await Promise.all([
    fetchProductos(),
    fetchCategorias(),
    fetchBanners(),
  ]);

  return (
    <Catalog 
      productos={productos} 
      categorias={categorias} 
      banners={banners} 
    />
  );
}