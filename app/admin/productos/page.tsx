"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Categoria {
    id: string;
    nombre: string;
}

interface Producto {
    id: string;
    nombre: string;
    sku: string;
    precio: number;
    stock: number;
    estado: boolean;
    categoryId?: string;
    category?: {
        id: string;
        nombre: string;
    };
}

export default function ListaProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(true);

    const [busqueda, setBusqueda] = useState("");

    const [mostrarModal, setMostrarModal] = useState(false);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        stock: "",
        categoryId: ""
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resProductos = await fetch("http://localhost:3000/api/products");
                const dataProductos = await resProductos.json();
                if (dataProductos.success) setProductos(dataProductos.data);
            } catch (error) {
                console.error("Error al cargar productos.");
            }

            try {
                const resCategorias = await fetch("http://localhost:3000/api/categories");
                const dataCategorias = await resCategorias.json();
                if (dataCategorias.success) setCategorias(dataCategorias.data);
            } catch (error) {
                console.error("Error al cargar categorías.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, []);

    const eliminarProducto = async (id: string) => {
        const confirmar = window.confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.");
        if (!confirmar) return;

        try {
            const token = localStorage.getItem("adminToken");
            const respuesta = await fetch(`http://localhost:3000/api/products/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (respuesta.ok) {
                setProductos(productos.filter((producto) => producto.id !== id));
                alert("🗑️ Producto eliminado correctamente.");
            } else {
                const errorReal = await respuesta.text();
                alert("🚨 EL GUARDIA DICE: " + errorReal);
            }
        } catch (error) {
            alert("Error de conexión al intentar eliminar.");
        }
    };

    const abrirModal = (producto: Producto) => {
        setProductoEditando(producto);
        setFormData({
            nombre: producto.nombre,
            precio: producto.precio.toString(),
            stock: producto.stock.toString(),
            categoryId: producto.categoryId || ""
        });
        setMostrarModal(true);
    };

    const guardarCambios = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoEditando) return;

        const paqueteActualizado = {
            nombre: formData.nombre,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            categoryId: formData.categoryId
        };

        try {
            const token = localStorage.getItem("adminToken");
            const respuesta = await fetch(`http://localhost:3000/api/products/${productoEditando.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(paqueteActualizado)
            });

            if (respuesta.ok) {
                const catSeleccionada = categorias.find(c => c.id === formData.categoryId);

                setProductos(productos.map((p) =>
                    p.id === productoEditando.id ? {
                        ...p,
                        ...paqueteActualizado,
                        category: catSeleccionada ? { id: catSeleccionada.id, nombre: catSeleccionada.nombre } : p.category
                    } : p
                ));
                setMostrarModal(false);
                alert("✅ Producto actualizado con éxito.");
            } else {
                const errorReal = await respuesta.text();
                alert("🚨 EL GUARDIA DICE: " + errorReal);
            }
        } catch (error) {
            alert("Error de conexión al intentar actualizar.");
        }
    };

    const limpiarTexto = (texto?: string) => {
        if (!texto) return "";
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    const busquedaLimpia = limpiarTexto(busqueda);
    const productosFiltrados = productos.filter((producto) => {
        const nombreLimpio = limpiarTexto(producto.nombre);
        const skuLimpio = limpiarTexto(producto.sku);
        const categoriaLimpia = limpiarTexto(producto.category?.nombre);

        return nombreLimpio.includes(busquedaLimpia) ||
            skuLimpio.includes(busquedaLimpia) ||
            categoriaLimpia.includes(busquedaLimpia);
    });

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen relative">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Inventario Repreguerra</h1>

                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre, SKU o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-72 text-gray-900"
                    />

                    <Link
                        href="/admin/productos/nuevo"
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition shadow-md whitespace-nowrap"
                    >
                        + Nuevo Producto
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Nombre del Producto</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cargando ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-semibold">Cargando datos desde Supabase...</td>
                            </tr>
                        ) : productosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-semibold">No se encontraron productos con esa búsqueda.</td>
                            </tr>
                        ) : (
                            productosFiltrados.map((producto) => (
                                <tr key={producto.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.sku}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{producto.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                        {producto.category?.nombre || "Sin Categoría"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">S/ {Number(producto.precio).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{producto.stock} uds.</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${producto.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {producto.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => abrirModal(producto)}
                                            className="text-blue-600 hover:text-blue-900 font-semibold"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => eliminarProducto(producto.id)}
                                            className="text-red-600 hover:text-red-900 font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 text-black">
                        <h2 className="text-2xl font-bold mb-6 text-black border-b pb-3">Editar Producto</h2>
                        <form onSubmit={guardarCambios} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full p-2 bg-white text-black border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-black mb-1">Categoría</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full p-2 bg-white text-black border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="" disabled>Selecciona una categoría...</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-1">Precio (S/)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                        className="w-full p-2 bg-white text-black border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-1">Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full p-2 bg-white text-black border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition"
                                >
                  // --- LÓGICA MÁGICA DEL BUSCADOR BLINDADA AL 200% ---
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition shadow-md"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}