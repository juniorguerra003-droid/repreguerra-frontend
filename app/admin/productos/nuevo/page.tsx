"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos la forma que tienen las categorías que vienen de tu backend
interface Categoria {
    id: string;
    nombre: string;
}

export default function NuevoProducto() {
    const router = useRouter();

    // Memoria para guardar la lista de categorías que traeremos de la API
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const [formData, setFormData] = useState({
        nombre: "",
        sku: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoryId: "", // ¡Ahora empieza vacío, esperando que el usuario elija!
        imagen_url: ""
    });

    // 1. EL TRUCO DE MAGIA: Traemos las categorías reales apenas carga la página
    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const respuesta = await fetch("http://localhost:3000/api/categories");
                const data = await respuesta.json();

                if (data.success) {
                    setCategorias(data.data);
                }
            } catch (error) {
                console.error("Error al cargar las categorías del servidor.");
            }
        };

        cargarCategorias();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const paqueteParaBackend = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
        };

        try {
            const token = localStorage.getItem("adminToken");

            const respuesta = await fetch("http://localhost:3000/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(paqueteParaBackend),
            });

            if (respuesta.ok) {
                alert("🎉 ¡Producto guardado exitosamente en su categoría correcta!");
                router.push("/admin/productos");
            } else {
                const error = await respuesta.text();
                alert("🚨 EL GUARDIA DICE: " + error);
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 border border-gray-200 text-black">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">Crear Nuevo Producto</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                        className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="Ej: Cámara Domo 1080p" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKU (Código único)</label>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Ej: CAM-002" />
                    </div>
                    {/* --- NUEVO SELECTOR DINÁMICO DE CATEGORÍAS --- */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                        >
                            <option value="" disabled>Selecciona una categoría...</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (S/)</label>
                        <input type="number" name="precio" step="0.01" value={formData.precio} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="85.50" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="15" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">URL de la Imagen</label>
                    <input type="url" name="imagen_url" value={formData.imagen_url} onChange={handleChange}
                        className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                        placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4}
                        className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none resize-none"
                        placeholder="Especificaciones técnicas..."></textarea>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition shadow-md">
                    Guardar Producto en Base de Datos
                </button>
            </form>
        </div>
    );
}