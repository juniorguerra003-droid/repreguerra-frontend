'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/store';

interface AddToCartActionProps {
  producto: Producto;
}

export default function AddToCartAction({ producto }: AddToCartActionProps) {
  const { addItem } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  const precio = parseFloat(producto.precio);
  const hasStock = producto.stock > 0;

  const handleIncrease = () => {
    if (cantidad < producto.stock) setCantidad((c) => c + 1);
  };

  const handleDecrease = () => {
    if (cantidad > 1) setCantidad((c) => c - 1);
  };

  const handleAddToCart = () => {
    if (!hasStock) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio,
      imagen_url: producto.imagen_url,
      cantidad, // Pasamos la cantidad seleccionada
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!hasStock) {
    return (
      <div className="bg-red-50 text-red-600 font-bold px-6 py-4 rounded-xl text-center w-full border border-red-100">
        Producto Agotado
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={handleDecrease}
            disabled={cantidad <= 1}
            className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-600 flex items-center justify-center transition shadow-sm"
            aria-label="Disminuir cantidad"
          >
            <Minus size={18} />
          </button>
          <span className="w-12 text-center font-bold text-gray-900 text-lg tabular-nums">
            {cantidad}
          </span>
          <button
            onClick={handleIncrease}
            disabled={cantidad >= producto.stock}
            className="w-10 h-10 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-600 flex items-center justify-center transition shadow-sm"
            aria-label="Aumentar cantidad"
          >
            <Plus size={18} />
          </button>
        </div>
        <span className="text-xs text-gray-400 font-medium ml-2">
          {producto.stock} disponibles
        </span>
      </div>

      {/* Botón Principal */}
      <button
        onClick={handleAddToCart}
        className={`
          w-full py-4 px-6 rounded-2xl font-extrabold text-lg transition-all duration-300
          flex items-center justify-center gap-3 shadow-lg hover:-translate-y-0.5
          ${
            added
              ? 'bg-emerald-500 text-white scale-[0.98] shadow-emerald-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/80 hover:shadow-blue-300'
          }
        `}
      >
        {added ? (
          <>
            <Sparkles size={22} className="animate-spin" />
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <ShoppingCart size={22} />
            Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
