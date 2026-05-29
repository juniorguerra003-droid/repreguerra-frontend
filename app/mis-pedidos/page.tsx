import type { Metadata } from 'next';
import Link from 'next/link';
import { Receipt, ShoppingCart } from 'lucide-react';
import MisPedidosView from '@/components/MisPedidosView';

export const metadata: Metadata = {
  title: 'Mis Pedidos – Repreguerra',
  description: 'Consulta el historial y estado de tus pedidos en Repreguerra.',
};

export default function MisPedidosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-widest uppercase hover:text-blue-400 transition"
          >
            Repreguerra
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Tienda</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <MisPedidosView />
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-gray-400 text-xs bg-white">
        <p>© {new Date().getFullYear()} Repreguerra · Historial de pedidos</p>
      </footer>
    </div>
  );
}
