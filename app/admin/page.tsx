"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Producto {
    id: string;
    nombre: string;
    sku: string;
    precio: number;
    stock: number;
    imagen_url?: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProductos: 0,
        totalCategorias: 0,
        valorTotal: 0,
        bajoStock: 0
    });
    const [productosBajoStock, setProductosBajoStock] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarMetricas = async () => {
            try {
                // Traemos los datos de tus APIs
                const resProd = await fetch("http://localhost:3000/api/products");
                const dataProd = await resProd.json();
                
                const resCat = await fetch("http://localhost:3000/api/categories");
                const dataCat = await resCat.json();

                if (dataProd.success && dataCat.success) {
                    const productos: Producto[] = dataProd.data;
                    const categorias = dataCat.data;

                    // El motor de cálculo en tiempo real
                    const totalProd = productos.length;
                    const totalCat = categorias.length;
                    
                    // Sumamos (Precio x Stock) de todos los productos
                    const valorInventario = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
                    
                    // Filtramos los que tienen 5 o menos en stock
                    const stockCritico = productos.filter(p => p.stock <= 5);

                    setStats({
                        totalProductos: totalProd,
                        totalCategorias: totalCat,
                        valorTotal: valorInventario,
                        bajoStock: stockCritico.length
                    });

                    setProductosBajoStock(stockCritico);
                }
            } catch (error) {
                console.error("Error al cargar las métricas", error);
            } finally {
                setCargando(false);
            }
        };

        cargarMetricas();
    }, []);

    if (cargando) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-bold text-gray-500 animate-pulse">Cargando Centro de Comando...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-10 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900">Panel de Control</h1>
                    <p className="text-gray-500 mt-2 font-medium">Bienvenido al sistema de gestión de Repreguerra.</p>
                </div>
                
                {/* Botones de navegación rápida */}
                <div className="flex gap-4">
                    <Link href="/admin/categorias" className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-900 transition shadow-md">
                        📂 Categorías
                    </Link>
                    <Link href="/admin/productos" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-md">
                        📦 Productos
                    </Link>
                </div>
            </div>

            {/* TARJETAS DE MÉTRICAS (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Productos</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.totalProductos}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Categorías Activas</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{stats.totalCategorias}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Valor Inventario</h3>
                    <p className="text-4xl font-extrabold text-green-600 mt-2">
                        S/ {stats.valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Alertas de Stock</h3>
                    <p className="text-4xl font-extrabold text-red-600 mt-2">{stats.bajoStock}</p>
                </div>
            </div>

            {/* TABLA DE ALERTAS DE STOCK */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-red-800">⚠️ Productos que necesitan reposición (Stock ≤ 5)</h2>
                </div>
                
                {productosBajoStock.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-semibold">
                        ¡Todo excelente! No hay productos con stock crítico en este momento.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock Actual</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {productosBajoStock.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {p.imagen_url ? (
                                            <img src={p.imagen_url} alt="Prod" className="w-8 h-8 rounded object-cover border" />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                        )}
                                        <span className="font-semibold text-gray-900">{p.nombre}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{p.sku}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-sm">
                                            Quedan {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href="/admin/productos" className="text-blue-600 hover:text-blue-900 font-bold text-sm">
                                            Ir a gestionar →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}