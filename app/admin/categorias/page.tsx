"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Categoria {
    id: string;
    nombre: string;
}

export default function ListaCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    
    // Estados para el Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
    const [formData, setFormData] = useState({ nombre: "" });

    // Cargar Categorías
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const respuesta = await fetch("http://localhost:3000/api/categories");
                const data = await respuesta.json();
                if (data.success) {
                    setCategorias(data.data);
                }
            } catch (error) {
                console.error("Error al cargar categorías.");
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    // Buscador Blindado
    const limpiarTexto = (texto: any) => {
        if (!texto) return "";
        return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const busquedaLimpia = limpiarTexto(busqueda);
    const categoriasFiltradas = categorias.filter((c) => {
        const nombreLimpio = limpiarTexto(c.nombre);
        return nombreLimpio.includes(busquedaLimpia);
    });

    // Eliminar Categoría
    const eliminarCategoria = async (id: string) => {
        if (!window.confirm("¿Seguro de eliminar esta categoría? Si tiene productos asignados, podría haber problemas.")) return;
        
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.ok) {
                setCategorias(categorias.filter(c => c.id !== id));
                alert("🗑️ Categoría eliminada.");
            } else {
                const errorReal = await res.text();
                alert("🚨 EL GUARDIA DICE: " + errorReal);
            }
        } catch (error) {
            alert("Error de conexión.");
        }
    };

    // Control del Modal
    const abrirModalNuevo = () => {
        setCategoriaEditando(null);
        setFormData({ nombre: "" });
        setMostrarModal(true);
    };

    const abrirModalEdicion = (categoria: Categoria) => {
        setCategoriaEditando(categoria);
        setFormData({ nombre: categoria.nombre });
        setMostrarModal(true);
    };

    // Guardar (Crear o Editar)
    const guardarCambios = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("adminToken");
        
        const url = categoriaEditando 
            ? `http://localhost:3000/api/categories/${categoriaEditando.id}` // Si estamos editando
            : `http://localhost:3000/api/categories`; // Si es nueva

        const metodo = categoriaEditando ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ nombre: formData.nombre })
            });

            if (res.ok) {
                const dataGuardada = await res.json();
                
                if (categoriaEditando) {
                    // Actualizar en la lista sin recargar la página
                    setCategorias(categorias.map(c => c.id === categoriaEditando.id ? { ...c, nombre: formData.nombre } : c));
                    alert("✅ Categoría actualizada.");
                } else {
                    // Agregar la nueva a la lista sin recargar
                    setCategorias([...categorias, dataGuardada.data]);
                    alert("✅ Categoría creada con éxito.");
                }
                setMostrarModal(false);
            } else {
                const errorReal = await res.text();
                alert("🚨 EL GUARDIA DICE: " + errorReal);
            }
        } catch (error) {
            alert("Error de conexión al guardar.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Categorías</h1>
                
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="🔍 Buscar categoría..." 
                        value={busqueda} 
                        onChange={e => setBusqueda(e.target.value)} 
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-72 text-gray-900" 
                    />
                    <button 
                        onClick={abrirModalNuevo} 
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition shadow-md whitespace-nowrap"
                    >
                        + Nueva Categoría
                    </button>
                    
                    {/* Botón rápido para volver a los productos */}
                    <Link href="/admin/productos" className="bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-900 transition shadow-md whitespace-nowrap">
                        📦 Volver a Productos
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider w-1/3">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nombre de Categoría</th>
                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider w-1/4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cargando ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-semibold">Cargando datos...</td></tr>
                        ) : categoriasFiltradas.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-semibold">No se encontraron categorías.</td></tr>
                        ) : (
                            categoriasFiltradas.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{c.id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{c.nombre}</td>
                                    <td className="px-6 py-4 text-center text-sm font-medium space-x-4">
                                        <button onClick={() => abrirModalEdicion(c)} className="text-blue-600 hover:text-blue-900 font-bold">Editar</button>
                                        <button onClick={() => eliminarCategoria(c.id)} className="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL PARA CREAR Y EDITAR */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md text-black border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">
                            {categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
                        </h2>
                        
                        <form onSubmit={guardarCambios} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Nombre</label>
                                <input 
                                    type="text" 
                                    value={formData.nombre} 
                                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="Ej: Accesorios, Cables..." 
                                    required 
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setMostrarModal(false)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded hover:bg-gray-300 transition">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700 transition shadow-md">
                                    {categoriaEditando ? "Guardar Cambios" : "Crear Categoría"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}