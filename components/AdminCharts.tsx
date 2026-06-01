'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, AlertCircle } from 'lucide-react';

const STATE_COLORS: Record<string, string> = {
  'PENDIENTE': '#f59e0b', // amber-500
  'PAGADO': '#3b82f6',    // blue-500
  'ENVIADO': '#8b5cf6',   // violet-500
  'ENTREGADO': '#10b981', // emerald-500
  'CANCELADO': '#ef4444', // red-500
};

export default function AdminCharts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/orders/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-64 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
        <Activity className="text-slate-300 animate-pulse" size={32} />
      </div>
    );
  }

  if (!data || (data.ventasPorDia.length === 0 && data.pedidosPorEstado.length === 0)) {
    return (
      <div className="h-64 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-3">
        <AlertCircle size={32} />
        <p className="font-medium">No hay datos suficientes para mostrar analíticas.</p>
      </div>
    );
  }

  // Format dates for X axis (e.g., '2023-10-05' -> '05 Oct')
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico 1: Ventas últimos 7 días */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16} className="text-blue-500" />
          Ventas (Últimos 7 Días)
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.ventasPorDia} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tickFormatter={formatXAxis} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `S/${value}`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`S/ ${value}`, 'Total']}
                labelFormatter={(label: any) => formatXAxis(label)}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Pedidos por Estado */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          Estado de Pedidos
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data.pedidosPorEstado} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="estado" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dx={-10} width={100} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [value, 'Pedidos']}
              />
              <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={24}>
                {
                  data.pedidosPorEstado.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATE_COLORS[entry.estado] || '#cbd5e1'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
