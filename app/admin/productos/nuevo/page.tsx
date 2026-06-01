"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos la forma que tienen las categorías que vienen de tu backend
interface Categoria {
    id: string;
    nombre: string;
}

interface Marca {
    id: string;
    nombre: string;
}

export default function NuevoProducto() {
    const router = useRouter();

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [marcas, setMarcas] = useState<Marca[]>([]);

    const [formData, setFormData] = useState({
        nombre: "",
        sku: "",
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
                const resCat = await fetch("http://localhost:3000/api/categories");
                const dataCat = await resCat.json();
                if (dataCat.success) setCategorias(dataCat.data);

                const resBrand = await fetch("http://localhost:3000/api/brands");
                const dataBrand = await resBrand.json();
                if (dataBrand.success) setMarcas(dataBrand.data);
            } catch (error) {
                console.warn("Error al cargar datos.");
            }
        };

        cargarDatos();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        setFormData({ ...formData, [target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const paqueteParaBackend = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            brandId: formData.brandId || null,
            precioOferta: formData.enOferta && formData.precioOferta ? parseFloat(formData.precioOferta) : null,
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Marca (Opcional)</label>
                        <select
                            name="brandId"
                            value={formData.brandId}
                            onChange={handleChange}
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                        >
                            <option value="">Sin marca</option>
                            {marcas.map((marca) => (
                                <option key={marca.id} value={marca.id}>
                                    {marca.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="15" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 border-y py-6 border-gray-100 bg-gray-50 -mx-8 px-8">
                    <div className="col-span-2">
                        <h3 className="font-bold text-gray-800 text-lg">Reglas de Negocio</h3>
                        <p className="text-sm text-gray-500 mb-4">Configura ofertas y visibilidad del precio.</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio Normal (S/)</label>
                        <input type="number" name="precio" step="0.01" value={formData.precio} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="85.50" />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl bg-white">
                            <input 
                                type="checkbox" 
                                name="enOferta" 
                                checked={formData.enOferta} 
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                            />
                            <span className="font-semibold text-gray-700">Producto en Oferta</span>
                        </label>
                        
                        {formData.enOferta && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-bold text-red-600 mb-1">Precio de Oferta (S/)</label>
                                <input type="number" name="precioOferta" step="0.01" value={formData.precioOferta} onChange={handleChange} required={formData.enOferta}
                                    className="w-full p-3 bg-red-50 text-red-900 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500 outline-none font-bold"
                                    placeholder="65.00" />
                            </div>
                        )}
                    </div>

                    <div className="col-span-2 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl bg-white shadow-sm border-blue-100">
                            <input 
                                type="checkbox" 
                                name="mostrarPrecio" 
                                checked={formData.mostrarPrecio} 
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                            />
                            <div>
                                <span className="font-bold text-gray-900 block">Mostrar precio al público</span>
                                <span className="text-sm text-gray-500">Si lo desactivas, los clientes tendrán que cotizar por WhatsApp.</span>
                            </div>
                        </label>
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