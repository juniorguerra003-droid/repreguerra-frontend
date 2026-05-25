"use client";
import { useState } from "react";

export default function LoginAdmin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Tocamos la puerta de autenticación de tu API
            const respuesta = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Empaquetamos las credenciales
                body: JSON.stringify({ email, password }),
            });

            const data = await respuesta.json();
            console.log("🚨 ESTRUCTURA REAL DEL BACKEND:", data);

            if (respuesta.ok) {
                // ¡Éxito! Guardamos el token de seguridad en la memoria del navegador
                localStorage.setItem("adminToken", data.data.token);
                alert("🔑 ¡Acceso concedido! Token guardado con éxito.");

                // Redirigimos automáticamente al panel de crear productos
                window.location.href = "/admin/productos";
            } else {
                alert("Acceso denegado: " + (data.message || "Credenciales incorrectas"));
            }
        } catch (error) {
            alert("Error de conexión. ¿El backend está encendido?");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-lg border border-gray-200">
                <h1 className="text-2xl font-extrabold text-center text-gray-900 mb-8 border-b pb-4">
                    Acceso Administrativo
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="admin@repreguerra.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-800 transition shadow-md"
                    >
                        Ingresar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
}