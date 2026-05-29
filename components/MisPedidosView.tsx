'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Receipt,
  CalendarDays,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface OrderItem {
  id: string;
  cantidad: number;
  precio_unitario: string;
  product: {
    nombre: string;
    sku: string;
    imagen_url: string | null;
  };
}

interface Payment {
  metodo_pago: string;
  estado_pago: string;
  comprobante_url: string | null;
}

interface Order {
  id: string;
  total: string;
  estado_pedido: string;
  direccion_envio: string;
  createdAt: string;
  orderItems: OrderItem[];
  payment: Payment | null;
}

type OrderStatus =
  | 'PENDIENTE'
  | 'PROCESANDO'
  | 'ENVIADO'
  | 'COMPLETADO'
  | 'CANCELADO';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─────────────────────────────────────────────
// Helpers de UI
// ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: <Clock size={12} />,
  },
  PROCESANDO: {
    label: 'Procesando',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Loader2 size={12} className="animate-spin" />,
  },
  ENVIADO: {
    label: 'Enviado',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: <Truck size={12} />,
  },
  COMPLETADO: {
    label: 'Completado',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 size={12} />,
  },
  CANCELADO: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle size={12} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? {
    label: status,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Tarjeta de pedido individual
// ─────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const total = parseFloat(order.total);
  const shortId = order.id.slice(0, 8).toUpperCase();
  const fecha = new Date(order.createdAt).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header de la tarjeta */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm font-mono">#{shortId}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CalendarDays size={11} /> {fecha}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-semibold">Total</p>
            <p className="font-extrabold text-gray-900 tabular-nums">
              S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <StatusBadge status={order.estado_pedido} />
          <button
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Contraer detalles' : 'Ver detalles'}
            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition text-gray-500"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Detalles expandibles */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* Info de envío y pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-5 py-4 border-b border-gray-100">
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">
                  Dirección de envío
                </p>
                <p className="text-sm text-gray-800 font-medium">{order.direccion_envio}</p>
              </div>
            </div>
            {order.payment && (
              <div className="flex items-start gap-2.5">
                <CreditCard size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">
                    Método de pago
                  </p>
                  <p className="text-sm text-gray-800 font-medium">{order.payment.metodo_pago}</p>
                </div>
              </div>
            )}
          </div>

          {/* Comprobante (si existe) */}
          {order.payment?.comprobante_url && (
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Comprobante de pago
              </p>
              <a
                href={order.payment.comprobante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src={order.payment.comprobante_url}
                  alt="Comprobante de pago"
                  className="h-32 w-auto rounded-xl border border-gray-200 object-cover hover:opacity-90 transition shadow-sm"
                />
              </a>
            </div>
          )}

          {/* Lista de productos */}
          <div className="px-5 py-3 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Productos ({order.orderItems.length})
            </p>
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.imagen_url ? (
                    <img
                      src={item.product.imagen_url}
                      alt={item.product.nombre}
                      className="object-contain w-full h-full p-0.5"
                    />
                  ) : (
                    <ShoppingBag size={16} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.product.nombre}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{item.product.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{item.cantidad} ud.</p>
                  <p className="text-sm font-extrabold text-gray-900 tabular-nums">
                    S/{' '}
                    {(parseFloat(item.precio_unitario) * item.cantidad).toLocaleString('es-PE', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// ─────────────────────────────────────────────
// Componente principal: MisPedidosView
// ─────────────────────────────────────────────

export default function MisPedidosView() {
  const { token, isHydrated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('Debes iniciar sesión para ver tu historial de pedidos.');
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401 || res.status === 403) {
          setError('Tu sesión ha expirado. Por favor vuelve a iniciar sesión.');
        } else {
          setError(data.message ?? 'Error al cargar tus pedidos.');
        }
        return;
      }

      setOrders(data.data);
    } catch {
      setError('No pudimos conectar con el servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Solo buscar cuando el contexto ya se hidrató
    if (isHydrated) fetchOrders();
  }, [isHydrated, token]);

  // ── Estados de carga / error ─────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 size={40} className="animate-spin text-blue-500" />
        <p className="font-semibold">Cargando tu historial…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <div>
          <p className="font-extrabold text-gray-900 text-lg mb-1">Acceso restringido</p>
          <p className="text-gray-500 text-sm max-w-xs">{error}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  // ── Lista de pedidos ─────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/" className="hover:text-blue-600 font-semibold flex items-center gap-1 transition">
              <ChevronLeft size={15} /> Catálogo
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-semibold">Mis Pedidos</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Receipt size={28} className="text-blue-500" />
            Mis Pedidos
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrado{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          aria-label="Actualizar lista"
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition text-gray-500"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Vacío */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-gray-400">
          <ShoppingBag size={56} strokeWidth={1} />
          <div className="text-center">
            <p className="font-bold text-gray-700 text-lg">Aún no tienes pedidos</p>
            <p className="text-sm mt-1">Cuando compres, tus órdenes aparecerán aquí.</p>
          </div>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md shadow-blue-200"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
