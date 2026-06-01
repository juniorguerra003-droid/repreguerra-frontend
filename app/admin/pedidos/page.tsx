"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ChevronLeft,
  Eye,
  X,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  ShoppingBag,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface OrderItem {
  id: string;
  cantidad: number;
  precio_unitario: string;
  product: { nombre: string; sku: string; imagen_url: string | null };
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
  user: { nombre_completo: string; email: string } | null;
}

type OrderStatus = "PENDIENTE" | "PROCESANDO" | "ENVIADO" | "COMPLETADO" | "CANCELADO";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 border-amber-200",
  PROCESANDO: "bg-blue-100 text-blue-800 border-blue-200",
  ENVIADO: "bg-indigo-100 text-indigo-800 border-indigo-200",
  COMPLETADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELADO: "bg-red-100 text-red-800 border-red-200",
};

// ─────────────────────────────────────────────
// Modal de detalle de pedido
// ─────────────────────────────────────────────

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
}) {
  const total = parseFloat(order.total);
  const fecha = new Date(order.createdAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasComprobante =
    (order.payment?.metodo_pago === "YAPE" ||
      order.payment?.metodo_pago === "PLIN") &&
    order.payment?.comprobante_url;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Detalle de pedido"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Pedido
              </p>
              <h2 className="font-extrabold text-lg font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* Info general */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Fecha</p>
                  <p className="text-sm font-medium text-slate-800">{fecha}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Total</p>
                  <p className="text-sm font-extrabold text-emerald-600">
                    S/ {total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Dirección de envío</p>
                  <p className="text-sm font-medium text-slate-800">{order.direccion_envio}</p>
                </div>
              </div>
              {order.payment && (
                <div className="flex items-start gap-2">
                  <CreditCard size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Método de pago</p>
                    <p className="text-sm font-medium text-slate-800">
                      {order.payment.metodo_pago}
                    </p>
                  </div>
                </div>
              )}
              {order.user && (
                <div className="col-span-2 flex items-start gap-2">
                  <Package size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Cliente</p>
                    <p className="text-sm font-medium text-slate-800">
                      {order.user.nombre_completo}{" "}
                      <span className="text-slate-400">({order.user.email})</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Comprobante de pago (YAPE/PLIN) ── */}
            {hasComprobante && (
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={15} className="text-violet-500" />
                  <p className="text-sm font-bold text-slate-700">
                    Comprobante de pago ({order.payment!.metodo_pago})
                  </p>
                  <span className="ml-auto text-xs text-slate-400 font-medium">
                    Verifica antes de aprobar
                  </span>
                </div>
                <a
                  href={order.payment!.comprobante_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-block"
                >
                  <img
                    src={order.payment!.comprobante_url!}
                    alt="Comprobante de pago"
                    className="h-56 w-auto rounded-xl border-2 border-violet-200 object-cover shadow-md group-hover:border-violet-400 transition"
                  />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    <ExternalLink
                      size={20}
                      className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow"
                    />
                  </div>
                </a>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <ExternalLink size={11} /> Haz clic en la imagen para verla a tamaño completo
                </p>
              </div>
            )}

            {/* Productos */}
            <div className="px-6 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                Productos ({order.orderItems.length})
              </p>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.imagen_url ? (
                        <img
                          src={item.product.imagen_url}
                          alt={item.product.nombre}
                          className="object-contain w-full h-full p-0.5"
                        />
                      ) : (
                        <ShoppingBag size={16} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.product.nombre}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{item.product.sku}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">{item.cantidad} ud.</p>
                      <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                        S/{" "}
                        {(parseFloat(item.precio_unitario) * item.cantidad).toLocaleString(
                          "es-PE",
                          { minimumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: cambio de estado */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-4 flex-shrink-0">
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-semibold mb-1">Cambiar estado del pedido</p>
              <select
                value={order.estado_pedido}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className={`font-bold px-4 py-2 rounded-xl text-sm border-2 outline-none cursor-pointer transition ${
                  STATUS_STYLES[order.estado_pedido as OrderStatus] ??
                  "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {["PENDIENTE", "PROCESANDO", "ENVIADO", "COMPLETADO", "CANCELADO"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Componente principal: PedidosAdmin
// ─────────────────────────────────────────────

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const token = localStorage.getItem("adminToken") || "";
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
        const res = await fetch(`${API_BASE}/api/orders/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setPedidos(data.data);
        } else {
          setError(data.message || "Error al traer los datos");
        }
      } catch (err: unknown) {
        setError("Falla de red: " + (err instanceof Error ? err.message : "Desconocido"));
      } finally {
        setCargando(false);
      }
    };
    cargarPedidos();
  }, []);

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem("adminToken") || "";
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/orders/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, estado_pedido: nuevoEstado } : p))
        );
        // Sincronizar el modal si está abierto
        if (selectedOrder?.id === id) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, estado_pedido: nuevoEstado } : prev
          );
        }
      } else {
        alert(`❌ Error al actualizar: ${data.message}`);
      }
    } catch {
      alert("⚠️ Error de conexión al intentar actualizar el pedido.");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-blue-600 font-bold animate-pulse text-lg">
          Cargando pedidos…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={actualizarEstado}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Package size={28} className="text-blue-500" />
              Gestión de Pedidos
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} en el sistema
            </p>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm shadow"
          >
            <ChevronLeft size={16} /> Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-900 text-white">
                {["ID Pedido", "Cliente", "Fecha", "Total", "Estado", "Detalle"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.length === 0 && !error ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                    No hay pedidos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr
                    key={pedido.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-mono text-slate-900 font-bold">
                      #{pedido.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {pedido.user?.nombre_completo ?? (
                        <span className="text-slate-400 italic">Invitado</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(pedido.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-5 py-4 text-sm font-extrabold text-emerald-600 tabular-nums">
                      S/ {parseFloat(pedido.total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={pedido.estado_pedido}
                        onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                        className={`font-bold px-3 py-1.5 rounded-xl text-xs border-2 outline-none cursor-pointer appearance-none transition ${
                          STATUS_STYLES[pedido.estado_pedido as OrderStatus] ??
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {["PENDIENTE", "PROCESANDO", "ENVIADO", "COMPLETADO", "CANCELADO"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(pedido)}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <Eye size={13} /> Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}