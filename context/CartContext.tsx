'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

// ─────────────────────────────────────────────
// Interfaces / Types
// ─────────────────────────────────────────────

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url: string | null;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'cantidad'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

interface CartContextValue {
  /** Lista de artículos actuales en el carrito */
  items: CartItem[];
  /** true si el carrito terminó de hidratarse desde localStorage */
  isHydrated: boolean;
  /** Agrega un artículo o incrementa su cantidad si ya existe */
  addItem: (item: Omit<CartItem, 'cantidad'>) => void;
  /** Elimina completamente un artículo del carrito */
  removeItem: (id: string) => void;
  /** Cambia la cantidad de un artículo (si llega a 0 lo elimina) */
  updateQuantity: (id: string, cantidad: number) => void;
  /** Vacía el carrito por completo */
  clearCart: () => void;
  /** Número total de artículos (suma de cantidades) */
  totalItems: number;
  /** Precio total a pagar */
  totalPrice: number;
}

// ─────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────

const LOCAL_STORAGE_KEY = 'repreguerra_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.payload };

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (existingIndex >= 0) {
        // Incrementa la cantidad del artículo existente
        const updatedItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
        return { items: updatedItems };
      }
      // Artículo nuevo → cantidad inicial: 1
      return {
        items: [...state.items, { ...action.payload, cantidad: 1 }],
      };
    }

    case 'REMOVE_ITEM':
      return {
        items: state.items.filter((item) => item.id !== action.payload.id),
      };

    case 'UPDATE_QUANTITY': {
      if (action.payload.cantidad <= 0) {
        // Cantidad 0 o negativa → eliminar del carrito
        return {
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      }
      return {
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  /**
   * isHydrated previene el SSR mismatch:
   * El componente arranca con el estado vacío en el servidor y en el primer
   * render del cliente. Solo tras el primer useEffect (que corre únicamente
   * en el cliente) se lee localStorage y se marca como hidratado.
   */
  const [isHydrated, setIsHydrated] = useState(false);

  // Efecto 1: Leer localStorage y hacer la hidratación inicial
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      }
    } catch {
      // Si localStorage no está disponible o el JSON está corrupto, ignora.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Efecto 2: Sincronizar estado → localStorage después de la hidratación
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // En entornos sin acceso a localStorage (modo privado estricto), ignora.
    }
  }, [state.items, isHydrated]);

  // ── Acciones memoizadas ──────────────────────

  const addItem = useCallback(
    (item: Omit<CartItem, 'cantidad'>) =>
      dispatch({ type: 'ADD_ITEM', payload: item }),
    []
  );

  const removeItem = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
    []
  );

  const updateQuantity = useCallback(
    (id: string, cantidad: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } }),
    []
  );

  const clearCart = useCallback(
    () => dispatch({ type: 'CLEAR_CART' }),
    []
  );

  // ── Derivados ────────────────────────────────

  const totalItems = state.items.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const totalPrice = state.items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  // ── Valor del contexto ───────────────────────

  const value: CartContextValue = {
    items: state.items,
    isHydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook personalizado
// ─────────────────────────────────────────────

/**
 * useCart — Accede al contexto del carrito desde cualquier Client Component.
 * Lanza un error claro si se usa fuera del CartProvider.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === null) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>.');
  }
  return context;
}
