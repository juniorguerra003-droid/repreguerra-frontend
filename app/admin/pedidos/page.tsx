"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarPedidos = async () => {
            try {
                const token = localStorage.getItem("adminToken") || ""; 
                const res = await fetch("http://localhost:3000/api/orders/admin/all", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                const data = await res.json();
                
                if (data.success) {
                    setPedidos(data.data);
                } else {
                    setError(data.message || "Error al traer los datos");
                }
            } catch (err: any) {
                setError("Falla de red: " + err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarPedidos();
    }, []);

    // ==========================================
    // NUEVA FUNCIÓN: ACTUALIZAR ESTADO EN LA BD
    // ==========================================
    const actualizarEstado = async (id: string, nuevoEstado: string) => {
        try {
            const token = localStorage.getItem("adminToken") || "";
            
            const res = await fetch(`http://localhost:3000/api/orders/admin/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Actualizamos la tabla en pantalla sin tener que recargar la página
                setPedidos(pedidos.map(p => p.id === id ? { ...p, estado_pedido: nuevoEstado } : p));
                // Opcional: Puedes quitar el alert si resulta molesto después de usarlo mucho
                alert(`✅ ${data.message}`);
            } else {
                alert(`❌ Error al actualizar: ${data.message}`);
            }
        } catch (error) {
            alert("⚠️ Error de conexión al intentar actualizar el pedido.");
        }
    };

    if (cargando) return <div className="p-10 text-center font-bold text-blue-600 text-xl">⏳ Cargando base de mando de Repreguerra...</div>;

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">📦 Gestión de Pedidos</h1>
                <Link href="/admin" className="bg-gray-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-900 transition">
                    Volver al Dashboard
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 font-bold">
                    ⚠️ {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">ID Pedido</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Dirección</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Total</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pedidos.length === 0 && !error ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No hay pedidos registrados en el sistema.</td></tr>
                        ) : (
                            pedidos.map((pedido: any) => (
                                <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{pedido.id.slice(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(pedido.createdAt).toLocaleDateString('es-PE')}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{pedido.direccion_envio}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-green-600">S/ {pedido.total}</td>
                                    <td className="px-6 py-4">
                                        {/* 👇 AQUÍ ESTÁ LA MAGIA DEL CAMBIO DE ESTADO */}
                                        <select
                                            value={pedido.estado_pedido}
                                            onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                                            className={`font-bold px-3 py-1 rounded-full text-xs shadow-sm border outline-none cursor-pointer appearance-none text-center
                                                ${pedido.estado_pedido === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                                ${pedido.estado_pedido === 'PROCESANDO' ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}
                                                ${pedido.estado_pedido === 'ENVIADO' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                                                ${pedido.estado_pedido === 'COMPLETADO' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                                ${pedido.estado_pedido === 'CANCELADO' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                            `}
                                        >
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="PROCESANDO">PROCESANDO</option>
                                            <option value="ENVIADO">ENVIADO</option>
                                            <option value="COMPLETADO">COMPLETADO</option>
                                            <option value="CANCELADO">CANCELADO</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}