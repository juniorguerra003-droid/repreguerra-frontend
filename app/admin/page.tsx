"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  Tag,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Boxes,
  DollarSign,
  Activity,
} from "lucide-react";
import AdminCharts from "@/components/AdminCharts";

interface Producto {
  id: string;
  nombre: string;
  sku: string;
  precio: number;
  stock: number;
  imagen_url?: string;
}

interface StatState {
  totalProductos: number;
  totalCategorias: number;
  valorTotal: number;
  bajoStock: number;
  ingresosTotales: number;
  pedidosTotales: number;
  tasaCompletados: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent: string;   // Tailwind gradient classes
  trend?: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Decorative gradient strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} shadow-sm`}>
            <Icon size={20} className="text-white" />
          </div>
          {trend && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {trend}
            </span>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">
          {title}
        </p>
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function NavButton({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${accent} hover:opacity-90 active:scale-[0.97] transition-all shadow-md`}
    >
      <Icon size={16} />
      {label}
      <ArrowRight size={14} className="ml-auto opacity-60" />
    </Link>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatState>({
    totalProductos: 0,
    totalCategorias: 0,
    valorTotal: 0,
    bajoStock: 0,
    ingresosTotales: 0,
    pedidosTotales: 0,
    tasaCompletados: 0,
  });

  const [productosBajoStock, setProductosBajoStock] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const cargarMetricas = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("adminToken") || "";

      const [resProd, resCat, resPedidos] = await Promise.all([
        fetch("http://localhost:3000/api/products"),
        fetch("http://localhost:3000/api/categories"),
        fetch("http://localhost:3000/api/orders/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [dataProd, dataCat, dataPedidos] = await Promise.all([
        resProd.json(),
        resCat.json(),
        resPedidos.json(),
      ]);

      if (dataProd.success && dataCat.success) {
        const productos: Producto[] = dataProd.data;
        const totalProd = productos.length;
        const totalCat = dataCat.data.length;
        const valorInventario = productos.reduce(
          (acc, p) => acc + p.precio * p.stock,
          0
        );
        const stockCritico = productos.filter((p) => p.stock <= 5);

        let tasaCompletados = 0;
        if (dataPedidos.success && dataPedidos.data.pedidosTotales > 0) {
          const completados =
            dataPedidos.data.resumenEstados.find(
              (e: { estado: string }) => e.estado === "COMPLETADO"
            )?.cantidad || 0;
          tasaCompletados = Math.round(
            (completados / dataPedidos.data.pedidosTotales) * 100
          );
        }

        setStats({
          totalProductos: totalProd,
          totalCategorias: totalCat,
          valorTotal: valorInventario,
          bajoStock: stockCritico.length,
          ingresosTotales: dataPedidos.success
            ? dataPedidos.data.ingresosTotales
            : 0,
          pedidosTotales: dataPedidos.success
            ? dataPedidos.data.pedidosTotales
            : 0,
          tasaCompletados,
        });

        setProductosBajoStock(stockCritico);
      }

      setLastUpdated(
        new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      console.error("Error al cargar las métricas", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
            <BarChart3 size={24} className="text-white" />
          </div>
          <p className="text-slate-500 font-semibold animate-pulse">
            Cargando Centro de Comando…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-none">
                Panel de Control
              </h1>
              <p className="text-xs text-slate-400 font-medium">Repreguerra · Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Activity size={12} className="text-emerald-500" />
                Actualizado {lastUpdated}
              </span>
            )}
            <button
              onClick={cargarMetricas}
              aria-label="Actualizar métricas"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
            >
              <RefreshCw size={15} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Navegación rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NavButton
            href="/admin/pedidos"
            icon={ShoppingCart}
            label="Gestionar Pedidos"
            accent="from-emerald-500 to-teal-600"
          />
          <NavButton
            href="/admin/categorias"
            icon={Tag}
            label="Categorías"
            accent="from-slate-700 to-slate-900"
          />
          <NavButton
            href="/admin/productos"
            icon={Boxes}
            label="Productos"
            accent="from-blue-600 to-indigo-700"
          />
        </div>

        {/* ── Métricas de Ventas ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-emerald-500" />
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.12em]">
              Rendimiento Comercial
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MetricCard
              title="Ingresos Totales"
              value={`S/ ${Number(stats.ingresosTotales).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
              subtitle="Suma de pedidos no cancelados"
              icon={DollarSign}
              accent="from-emerald-500 to-teal-500"
            />
            <MetricCard
              title="Total de Pedidos"
              value={stats.pedidosTotales}
              subtitle="Todos los estados incluidos"
              icon={ShoppingCart}
              accent="from-blue-500 to-blue-700"
            />
            <MetricCard
              title="Tasa de Completados"
              value={`${stats.tasaCompletados}%`}
              subtitle="Pedidos finalizados exitosamente"
              icon={CheckCircle}
              accent="from-violet-500 to-purple-700"
              trend={stats.tasaCompletados >= 50 ? "Saludable" : undefined}
            />
          </div>
        </section>

        {/* ── Métricas de Inventario ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-blue-500" />
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.12em]">
              Estado del Inventario
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Total Productos"
              value={stats.totalProductos}
              icon={Boxes}
              accent="from-blue-500 to-blue-700"
            />
            <MetricCard
              title="Categorías"
              value={stats.totalCategorias}
              icon={Tag}
              accent="from-violet-500 to-purple-700"
            />
            <MetricCard
              title="Valor Inventario"
              value={`S/ ${stats.valorTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              accent="from-emerald-500 to-teal-600"
            />
            <MetricCard
              title="Alertas de Stock"
              value={stats.bajoStock}
              subtitle="Productos con ≤ 5 unidades"
              icon={AlertTriangle}
              accent={stats.bajoStock > 0 ? "from-red-500 to-rose-600" : "from-slate-400 to-slate-500"}
              trend={stats.bajoStock > 0 ? "Atención" : undefined}
            />
          </div>
        </section>

        {/* ── Analíticas Visuales ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-indigo-500" />
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.12em]">
              Analíticas de Rendimiento
            </h2>
          </div>
          <AdminCharts />
        </section>

        {/* ── Tabla de alertas ── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-[0.12em]">
              Productos que necesitan reposición
            </h2>
            <span className="ml-auto text-xs text-slate-400">Stock ≤ 5 unidades</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {productosBajoStock.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-bold text-slate-700">¡Todo en orden!</p>
                <p className="text-sm text-slate-400 mt-1">
                  No hay productos con stock crítico en este momento.
                </p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                      Stock actual
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productosBajoStock.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.imagen_url ? (
                            <img
                              src={p.imagen_url}
                              alt={p.nombre}
                              className="object-contain w-full h-full p-0.5"
                            />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {p.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400 uppercase tracking-wider">
                        {p.sku}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            p.stock === 0
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.stock === 0 ? "bg-red-500" : "bg-amber-500"
                            }`}
                          />
                          Quedan {p.stock} uds.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/admin/productos"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-sm group-hover:underline transition"
                        >
                          Reponer <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}