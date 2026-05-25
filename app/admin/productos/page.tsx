"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // <-- Importamos Supabase

// --- CONEXIÓN A SUPABASE ---
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
    precio: number;
    stock: number;
    estado: boolean;
    imagen_url?: string; // <-- Agregamos el campo de la imagen
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
    const [subiendoImagen, setSubiendoImagen] = useState(false); // Estado para el cargador de la imagen

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoryId: "",
        imagen_url: "" // <-- Memoria para la URL de la imagen
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resProductos = await fetch("http://localhost:3000/api/products");
                const dataProductos = await resProductos.json();
                if (dataProductos.success) setProductos(dataProductos.data);

                const resCategorias = await fetch("http://localhost:3000/api/categories");
                const dataCategorias = await resCategorias.json();
                if (dataCategorias.success) setCategorias(dataCategorias.data);
            } catch (error) {
                console.error("Error al cargar datos.");
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
        const res = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            setProductos(productos.filter(p => p.id !== id));
            alert("Eliminado.");
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
            imagen_url: p.imagen_url || "" // Cargamos la imagen si ya la tiene
        });
        setMostrarModal(true);
    };

    // --- MAGIA: FUNCIÓN PARA SUBIR LA IMAGEN A SUPABASE ---
    const subirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        setSubiendoImagen(true);

        try {
            // 1. Creamos un nombre único para que no se sobreescriban fotos iguales
            const extension = archivo.name.split('.').pop();
            const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

            // 2. Subimos al Bucket 'productos'
            const { data, error } = await supabase.storage
                .from('productos')
                .upload(nombreArchivo, archivo);

            if (error) throw error;

            // 3. Obtenemos la URL pública para guardarla en la base de datos
            const { data: publicData } = supabase.storage
                .from('productos')
                .getPublicUrl(nombreArchivo);

            // 4. Actualizamos el formulario con la URL mágica
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
            stock: parseInt(formData.stock),
            categoryId: formData.categoryId,
            imagen_url: formData.imagen_url // Mandamos la URL al Backend
        };

        const res = await fetch(`http://localhost:3000/api/products/${productoEditando.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(paqueteActualizado)
        });

        if (res.ok) {
            const cat = categorias.find(c => c.id === formData.categoryId);
            setProductos(productos.map(p => p.id === productoEditando.id ? { ...p, ...paqueteActualizado, category: cat } : p));
            setMostrarModal(false);
            alert("Actualizado.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Inventario Repreguerra</h1>
                <div className="flex gap-4">
                    <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="p-2 border rounded shadow-sm focus:ring-2 outline-none w-72" />
                    <Link href="/admin/productos/nuevo" className="bg-blue-600 text-white p-2 rounded font-bold shadow-md">+ Nuevo</Link>
                </div>
            </div>

            <table className="min-w-full bg-white border rounded-lg shadow-sm">
                <thead className="bg-gray-900 text-white">
                    <tr>
                        <th className="p-4 text-left w-16">Foto</th>
                        <th className="p-4 text-left">SKU</th>
                        <th className="p-4 text-left">Nombre</th>
                        <th className="p-4 text-left">Categoría</th>
                        <th className="p-4 text-left">Precio</th>
                        <th className="p-4 text-left">Stock</th>
                        <th className="p-4 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productosFiltrados.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            {/* MINIATURA DE LA IMAGEN EN LA TABLA */}
                            <td className="p-4 text-center">
                                {p.imagen_url ? (
                                    <img src={p.imagen_url} alt="Prod" className="w-10 h-10 object-cover rounded shadow-sm border" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded text-xs flex items-center justify-center text-gray-400">N/A</div>
                                )}
                            </td>
                            <td className="p-4 font-mono text-sm">{p.sku}</td>
                            <td className="p-4 font-semibold text-gray-800">{p.nombre}</td>
                            <td className="p-4 text-gray-600">{p.category?.nombre || "N/A"}</td>
                            <td className="p-4 text-green-700 font-bold">S/ {p.precio}</td>
                            <td className="p-4">{p.stock}</td>
                            <td className="p-4 text-center space-x-3">
                                <button onClick={() => abrirModal(p)} className="text-blue-600 font-bold">Editar</button>
                                <button onClick={() => eliminarProducto(p.id)} className="text-red-600 font-bold">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL DE EDICIÓN CON CARGA DE IMÁGENES */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg text-black max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Editar Producto</h2>
                        
                        <form onSubmit={guardarCambios} className="space-y-4">
                            
                            {/* ZONA DE CARGA DE IMAGEN */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                                <label className="block text-sm font-semibold mb-2">Imagen del Producto</label>
                                <div className="flex items-center gap-4">
                                    {formData.imagen_url ? (
                                        <img src={formData.imagen_url} alt="Preview" className="w-20 h-20 object-cover rounded shadow-md border" />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded border text-gray-400 text-xs text-center">Sin foto</div>
                                    )}
                                    <div className="flex-1">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={subirImagen} 
                                            disabled={subiendoImagen}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                        />
                                        {subiendoImagen && <p className="text-sm text-blue-600 mt-2 font-bold animate-pulse">⏳ Subiendo imagen a Supabase...</p>}
                                    </div>
                                </div>
                            </div>

                            <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border p-2 rounded focus:ring-2 outline-none" placeholder="Nombre" required />
                            <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full border p-2 rounded focus:ring-2 outline-none" placeholder="Descripción" rows={3} />
                            
                            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border p-2 rounded focus:ring-2 outline-none" required>
                                <option value="" disabled>Selecciona una categoría...</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Precio (S/)</label>
                                    <input type="number" step="0.01" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} className="w-full border p-2 rounded focus:ring-2 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Stock</label>
                                    <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border p-2 rounded focus:ring-2 outline-none" required />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setMostrarModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold p-2 rounded px-4 transition">Cancelar</button>
                                <button type="submit" disabled={subiendoImagen} className={`text-white font-bold p-2 rounded px-4 transition ${subiendoImagen ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}