import type { Metadata } from 'next';
import CatalogClient from '@/components/Catalog';
import type { Producto, Categoria, ApiResponse } from '@/types/store';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${siteConfig.name} – Catálogo de Productos`,
  description: 'Explora nuestro catálogo completo de equipos y tecnología.',
};

export const revalidate = 60;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchProductos(): Promise<Producto[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Producto[]> = await res.json();
    return json.success ? json.data.filter((p) => p.estado) : [];
  } catch {
    return [];
  }
}

async function fetchCategorias(): Promise<Categoria[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: ApiResponse<Categoria[]> = await res.json();
    return json.success ? json.data.filter(c => c.estado) : [];
  } catch {
    return [];
  }
}

async function fetchMarcas(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/brands`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.success ? json.data.filter((m: any) => m.estado) : [];
  } catch {
    return [];
  }
}

export default async function CatalogoPage({ searchParams }: { searchParams: { categoria?: string, ofertas?: string } }) {
  const [productos, categorias, marcas] = await Promise.all([
    fetchProductos(),
    fetchCategorias(),
    fetchMarcas(),
  ]);

  return (
    <CatalogClient
      productos={productos}
      categorias={categorias}
      marcas={marcas}
      initialCategory={searchParams.categoria}
      initialOffersOnly={searchParams.ofertas === 'true'}
    />
  );
}
