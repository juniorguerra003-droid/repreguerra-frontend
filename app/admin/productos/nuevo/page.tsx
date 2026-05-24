"use client";
import { useState } from "react";

export default function NuevoProducto() {
    // Inicializamos la memoria del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        sku: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoryId: "f47ac10b-58cc-4372-a567-0e02b2c3d479", // El UUID de tu categoría "Cámaras" por defecto
        imagen_url: ""
    });

    // Función para capturar lo que el usuario escribe en tiempo real
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Función que se ejecutará al presionar el botón de guardar
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const paqueteParaBackend = {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
        };

        try {
            // Sacamos la llave de la memoria del navegador
            const token = localStorage.getItem("adminToken");

            const respuesta = await fetch("http://localhost:3000/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // <--- ¡Aquí le mostramos la llave al guardia!
                },
                body: JSON.stringify(paqueteParaBackend),
            });

            if (respuesta.ok) {
                alert("🎉 ¡Producto guardado exitosamente con seguridad JWT!");
                setFormData({ ...formData, nombre: "", sku: "", descripcion: "", precio: "", stock: "", imagen_url: "" });
            } else {
                const error = await respuesta.json();
                alert("Hubo un error de validación: " + JSON.stringify(error));
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-10 border border-gray-200">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">Crear Nuevo Producto</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                        className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej: Cámara Domo 1080p" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKU (Código único)</label>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej: CAM-002" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (S/)</label>
                        <input type="number" name="precio" step="0.01" value={formData.precio} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="85.50" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Stock Inicial</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="15" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">URL de la Imagen</label>
                        <input type="url" name="imagen_url" value={formData.imagen_url} onChange={handleChange}
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..." />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4}
                        className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Especificaciones técnicas..."></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition shadow-md">
                    Guardar Producto en Base de Datos
                </button>
            </form>
        </div>
    );
}