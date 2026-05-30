'use client';

/**
 * components/CartDrawer.tsx
 *
 * Sidebar del carrito de compras.
 * Extraído de Catalog.tsx para compartir con el Navbar global.
 * z-index: 50 (overlay) / 50 (panel) — por encima del Navbar (z-40).
 */

import Link from 'next/link';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Panel lateral */}
      <aside
        role="dialog"
        aria-label="Carrito de compras"
        className={`
          fixed right-0 top-0 z-50 h-full w-full max-w-md
          bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-6 py-5 bg-gray-950 text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} />
            <h2 className="text-lg font-extrabold tracking-wide">Tu Pedido</h2>
            {items.length > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {items.reduce((a, i) => a + i.cantidad, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 py-20">
              <ShoppingBag size={56} strokeWidth={1} />
              <p className="font-semibold text-base">Tu carrito está vacío</p>
              <p className="text-sm text-center">Agrega productos desde el catálogo</p>
              <button
                onClick={onClose}
                className="mt-2 text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline"
              >
                Explorar productos <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                {/* Miniatura */}
                <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} className="object-contain w-full h-full p-1" />
                  ) : (
                    <ShoppingBag size={24} className="text-gray-300" strokeWidth={1} />
                  )}
                </div>

                {/* Info + controles */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{item.nombre}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    S/ {item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })} c/u
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Controles +/- */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        aria-label="Reducir cantidad"
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm tabular-nums">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        aria-label="Aumentar cantidad"
                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-green-100 hover:text-green-600 flex items-center justify-center transition"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    {/* Subtotal del ítem */}
                    <p className="text-blue-600 font-extrabold text-sm tabular-nums">
                      S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Eliminar ${item.nombre}`}
                  className="self-start p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con total y checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50/80 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Total estimado</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                S/ {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              id="cart-go-to-checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-200 text-sm"
            >
              Ir a Pagar <ChevronRight size={18} />
            </Link>

            <button
              onClick={clearCart}
              className="w-full text-center text-xs text-gray-400 hover:text-red-500 transition font-semibold"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
