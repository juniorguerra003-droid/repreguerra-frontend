"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { 
    PackageOpen, Search, Plus, Edit, Trash2, CheckCircle, 
    AlertTriangle, Image as ImageIcon, Box, DollarSign, UploadCloud
} from "lucide-react";
import BulkUploadModal from "@/components/BulkUploadModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface Categoria {
    id: string;
    nombre: string;
}

interface Producto {
    id: string;
    nombre: string;
    sku: string;
    descripcion: string;
    precio: number | string;
    enOferta: boolean;
    precioOferta?: number | string | null;
    mostrarPrecio: boolean;
    stock: number;
    estado: boolean;
    categoryId: string;
    brandId?: string | null;
    imagen_url: string;
    category?: {
        id: string;
        nombre: string;
    };
    brand?: {
        id: string;
        nombre: string;
    };
}

export default function ListaProductos() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [marcas, setMarcas] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarBulkModal, setMostrarBulkModal] = useState(false);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoryId: "",
        brandId: "",
        enOferta: false,
        precioOferta: "",
        mostrarPrecio: true,
        imagen_url: ""
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resProductos = await fetch(`${API_URL}/api/products`);
                const dataProductos = await resProductos.json();
                if (dataProductos.success) setProductos(dataProductos.data);

                const resCategorias = await fetch(`${API_URL}/api/categories`);
                const dataCategorias = await resCategorias.json();
                if (dataCategorias.success) setCategorias(dataCategorias.data);

                const resMarcas = await fetch(`${API_URL}/api/brands`);
                const dataMarcas = await resMarcas.json();
                if (dataMarcas.success) setMarcas(dataMarcas.data);

                try {
                    const userStr = localStorage.getItem('adminUser');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        setUserRole(user.rol || null);
                    }
                } catch (e) {}
            } catch (error) {
                console.warn("Fallo de red al cargar datos.");
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const limpiarTexto = (texto: any) => {
        if (!texto) return "";
        return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const busquedaLimpia = limpiarTexto(busqueda);
    const productosFiltrados = productos.filter((p) => {
        const nombreLimpio = limpiarTexto(p.nombre);
        const skuLimpio = limpiarTexto(p.sku);
        const catLimpia = limpiarTexto(p.category?.nombre);
        return nombreLimpio.includes(busquedaLimpia) || skuLimpio.includes(busquedaLimpia) || catLimpia.includes(busquedaLimpia);
    });

    const eliminarProducto = async (id: string) => {
        if (!window.confirm("¿Seguro de eliminar?")) return;
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setProductos(productos.filter(p => p.id !== id));
        }
    };

    const abrirModal = (p: Producto) => {
        setProductoEditando(p);
        setFormData({
            nombre: p.nombre,
            descripcion: p.descripcion || "",
            precio: p.precio.toString(),
            stock: p.stock.toString(),
            categoryId: p.categoryId || "",
            brandId: p.brandId || "",
            enOferta: p.enOferta || false,
            precioOferta: p.precioOferta ? p.precioOferta.toString() : "",
            mostrarPrecio: p.mostrarPrecio !== undefined ? p.mostrarPrecio : true,
            imagen_url: p.imagen_url || "" 
        });
        setMostrarModal(true);
    };

    const subirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        setSubiendoImagen(true);

        try {
            const extension = archivo.name.split('.').pop();
            const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

            const { data, error } = await supabase.storage
                .from('productos')
                .upload(nombreArchivo, archivo);

            if (error) throw error;

            const { data: publicData } = supabase.storage
                .from('productos')
                .getPublicUrl(nombreArchivo);

            setFormData({ ...formData, imagen_url: publicData.publicUrl });
        } catch (error: any) {
            alert("Error al subir la imagen. Verifica que el Bucket 'productos' sea público. Detalle: " + error.message);
        } finally {
            setSubiendoImagen(false);
        }
    };

    const guardarCambios = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoEditando) return;
        const token = localStorage.getItem("adminToken");
        
        const paqueteActualizado = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            categoryId: formData.categoryId,
            brandId: formData.brandId || null,
            enOferta: formData.enOferta,
            precioOferta: formData.enOferta && formData.precioOferta ? parseFloat(formData.precioOferta) : null,
            mostrarPrecio: formData.mostrarPrecio,
            imagen_url: formData.imagen_url
        };

        const res = await fetch(`${API_URL}/api/products/${productoEditando.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(paqueteActualizado)
        });

        if (res.ok) {
            const cat = categorias.find(c => c.id === formData.categoryId);
            setProductos(productos.map(p => p.id === productoEditando.id ? { ...p, ...paqueteActualizado, category: cat } : p));
            setMostrarModal(false);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <PackageOpen className="text-blue-500" />
                        Inventario Repreguerra
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestiona todos los productos de tu tienda.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            value={busqueda} 
                            onChange={e => setBusqueda(e.target.value)} 
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all" 
                        />
                    </div>
                    <button 
                        onClick={() => setMostrarBulkModal(true)}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                        <UploadCloud size={16} /> Importar
                    </button>
                    <Link 
                        href="/admin/productos/nuevo" 
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-slate-200 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Nuevo Producto</span>
                    </Link>
                </div>
            </div>

            {/* Contenedor Tabla */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Foto</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargando ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                                            <p className="text-sm font-medium mt-2">Cargando inventario...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : productosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <PackageOpen size={32} className="text-slate-300" />
                                            <p className="text-sm font-medium text-slate-600">No se encontraron productos</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                productosFiltrados.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 text-center">
                                            {p.imagen_url ? (
                                                <img src={p.imagen_url} alt="Prod" className="w-10 h-10 object-cover rounded-lg shadow-sm border border-slate-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{p.sku}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{p.nombre}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                                {p.category?.nombre || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">S/ {Number(p.precio).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {p.stock <= 5 ? (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                                                    <AlertTriangle size={14} />
                                                    {p.stock}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Box size={14} className="text-slate-500" />
                                                    {p.stock}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.estado ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex justify-end gap-2">
                                            <button 
                                                onClick={() => abrirModal(p)} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {userRole === 'SUPER_ADMIN' && (
                                                <button 
                                                    onClick={() => eliminarProducto(p.id)} 
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE EDICIÓN CON CARGA DE IMÁGENES */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <PackageOpen size={18} className="text-blue-500" />
                                Editar Producto
                            </h2>
                        </div>
                        
                        <div className="overflow-y-auto p-6">
                            <form onSubmit={guardarCambios} className="space-y-5">
                                {/* ZONA DE CARGA DE IMAGEN */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-200">
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Imagen del Producto</label>
                                    <div className="flex items-center gap-4">
                                        {formData.imagen_url ? (
                                            <img src={formData.imagen_url} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow-sm border border-slate-200 bg-white" />
                                        ) : (
                                            <div className="w-20 h-20 bg-white flex items-center justify-center rounded-xl border border-slate-200 text-slate-400">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={subirImagen} 
                                                disabled={subiendoImagen}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors"
                                            />
                                            {subiendoImagen && <p className="text-xs text-blue-600 mt-2 font-bold animate-pulse flex items-center gap-1"><CheckCircle size={12}/> Subiendo a Supabase...</p>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre</label>
                                    <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white" required />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
                                    <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white resize-none" rows={3} />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
                                    <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white" required>
                                        <option value="" disabled>Selecciona una categoría...</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Marca (Opcional)</label>
                                    <select value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white">
                                        <option value="">Sin marca</option>
                                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.enOferta} onChange={e => setFormData({...formData, enOferta: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                        <span className="font-bold text-slate-800">Producto en Oferta</span>
                                    </label>
                                    
                                    {formData.enOferta && (
                                        <div>
                                            <label className="block text-sm font-bold text-red-600 mb-1.5 flex items-center gap-1">Precio Oferta (S/)</label>
                                            <input type="number" step="0.01" value={formData.precioOferta} onChange={e => setFormData({...formData, precioOferta: e.target.value})} className="w-full px-4 py-2.5 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-red-900 bg-red-50 focus:bg-white font-bold" required={formData.enOferta} />
                                        </div>
                                    )}

                                    <label className="flex items-start gap-3 cursor-pointer mt-4">
                                        <input type="checkbox" checked={formData.mostrarPrecio} onChange={e => setFormData({...formData, mostrarPrecio: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-slate-800 block">Mostrar precio al público</span>
                                            <span className="text-xs text-slate-500">Desactiva para requerir cotización.</span>
                                        </div>
                                    </label>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                            <DollarSign size={14} className="text-slate-400"/> Precio (S/)
                                        </label>
                                        <input type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                                            <Box size={14} className="text-slate-400"/> Stock
                                        </label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 bg-slate-50 focus:bg-white" required />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                                    <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={subiendoImagen} className={`text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 ${subiendoImagen ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                                        Guardar Cambios <CheckCircle size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            <BulkUploadModal 
                isOpen={mostrarBulkModal} 
                onClose={() => setMostrarBulkModal(false)} 
                onSuccess={() => {
                    fetch(`${API_URL}/api/products`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) setProductos(data.data);
                        });
                }} 
            />
        </div>
    );
}