"use client";
import { useState, useEffect } from "react";
import { Tag, Search, Plus, Edit, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Categoria {
    id: string;
    nombre: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
                const respuesta = await fetch(`${API_URL}/api/categories`);
                const data = await respuesta.json();
                if (data.success) {
                    setCategorias(data.data);
                }
            } catch (error) {
                console.warn("Error al cargar categorías.");
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
            const res = await fetch(`${API_URL}/api/categories/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (res.ok) {
                setCategorias(categorias.filter(c => c.id !== id));
            } else {
                const errorReal = await res.text();
                alert("🚨 Error: " + errorReal);
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
            ? `${API_URL}/api/categories/${categoriaEditando.id}` 
            : `${API_URL}/api/categories`;

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
                    setCategorias(categorias.map(c => c.id === categoriaEditando.id ? { ...c, nombre: formData.nombre } : c));
                } else {
                    setCategorias([...categorias, dataGuardada.data]);
                }
                setMostrarModal(false);
            } else {
                const errorReal = await res.text();
                alert("🚨 Error: " + errorReal);
            }
        } catch (error) {
            alert("Error de conexión al guardar.");
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <Tag className="text-violet-500" />
                        Categorías
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestiona las categorías de tus productos para organizar el catálogo.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar categoría..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)} 
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all" 
                        />
                    </div>
                    <button 
                        onClick={abrirModalNuevo} 
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-slate-200 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Nueva Categoría</span>
                    </button>
                </div>
            </div>

            {/* Contenedor Tabla */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">
                                    ID Categoría
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                                            <p className="text-sm font-medium mt-2">Cargando categorías...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categoriasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <AlertTriangle size={32} className="text-slate-300" />
                                            <p className="text-sm font-medium text-slate-600">No se encontraron categorías</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                categoriasFiltradas.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono select-all">
                                            {c.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-2 font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                                <Tag size={14} className="text-slate-500" />
                                                {c.nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button 
                                                onClick={() => abrirModalEdicion(c)} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => eliminarCategoria(c.id)} 
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PARA CREAR Y EDITAR */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Tag size={18} className="text-violet-500" />
                                {categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
                            </h2>
                        </div>
                        
                        <form onSubmit={guardarCambios} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nombre de la categoría
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.nombre} 
                                    onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white" 
                                    placeholder="Ej: Accesorios, Cables..." 
                                    required 
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setMostrarModal(false)} 
                                    className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-200 flex items-center gap-2"
                                >
                                    {categoriaEditando ? (
                                        <>Guardar Cambios <CheckCircle size={16} /></>
                                    ) : (
                                        <>Crear Categoría <Plus size={16} /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}