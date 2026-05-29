/**
 * app/checkout/page.tsx — Server Component (sin "use client").
 *
 * Responsabilidades mínimas del Server Component:
 *  - Renderizar el layout estático (header, footer) y los metadatos SEO.
 *  - Delegar toda la lógica interactiva a <CheckoutView />, que es Client Component.
 *
 * La validación de carrito vacío ocurre dentro de <CheckoutView /> del lado
 * del cliente, donde está disponible el CartContext y el localStorage.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import CheckoutView from '@/components/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout – Repreguerra',
  description: 'Finaliza tu compra de forma rápida y segura en Repreguerra.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header simplificado para el flujo de checkout */}
      <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-widest uppercase hover:text-blue-400 transition"
          >
            Repreguerra
          </Link>

          {/* Indicador de paso */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <span className="text-gray-400 font-semibold hidden sm:inline">Carrito</span>
            <span className="text-gray-600">→</span>
            <span className="w-6 h-6 rounded-full bg-white text-gray-900 font-bold flex items-center justify-center text-xs">
              2
            </span>
            <span className="text-white font-semibold hidden sm:inline">Checkout</span>
          </div>

          <Link
            href="/"
            aria-label="Volver al carrito"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Carrito</span>
          </Link>
        </div>
      </header>

      {/* Contenido principal — CheckoutView gestiona todos los estados */}
      <main className="flex-1">
        <CheckoutView />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-gray-400 text-xs bg-white">
        <p>© {new Date().getFullYear()} Repreguerra · Pago 100% seguro 🔒</p>
      </footer>

    </div>
  );
}
