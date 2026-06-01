'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Catalog from '@/components/Catalog';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function FavoritosPage() {
  const { user, token, isHydrated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    }
  }, [user, isHydrated, router]);

  useEffect(() => {
    if (!token) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            // Transform directly to Product array format expected by Catalog cards
            const products = json.data.map((item: any) => item.product);
            setFavorites(products);
          }
        }
      } catch (error) {
        console.error('Error fetching favorites', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Heart size={32} className="text-red-500 animate-pulse" />
          <p className="text-gray-500 font-medium font-mono text-sm uppercase tracking-widest">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-[0.25em] mb-4 bg-red-50 px-4 py-1.5 rounded-full">
            <Heart size={12} className="fill-red-500" /> Tu lista
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Mis Favoritos
          </h1>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Tus productos guardados para compra futura.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tu lista está vacía</h2>
            <p className="text-gray-500 max-w-md mb-8">
              Aún no has guardado ningún producto. Explora nuestro catálogo y presiona el corazón en los productos que te interesen.
            </p>
            <Link 
              href="/catalogo"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-blue-200"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Catalog productos={favorites} categorias={[]} marcas={[]} />
          </div>
        )}
      </div>
    </main>
  );
}
