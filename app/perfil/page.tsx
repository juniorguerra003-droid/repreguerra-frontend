'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, MapPin, CheckCircle2, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function ProfilePage() {
  const { user, isHydrated, token, updateUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    telefono: '',
    direccion_defecto: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirigir si no está logueado
  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/login');
    }
  }, [user, isHydrated, router]);

  // Poblar formulario cuando el usuario cargue
  useEffect(() => {
    if (user) {
      setForm({
        telefono: user.telefono || '',
        direccion_defecto: user.direccion_defecto || '',
      });
    }
  }, [user]);

  if (!isHydrated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={36} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telefono: form.telefono.trim(),
          direccion_defecto: form.direccion_defecto.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      // Actualizar el contexto para que se refleje globalmente
      updateUser({
        telefono: data.data.telefono,
        direccion_defecto: data.data.direccion_defecto,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-6 font-semibold">
            <ChevronLeft size={16} /> Volver al inicio
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Perfil</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
            <h2 className="font-bold text-lg">Información Personal</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm flex items-center gap-3 border border-emerald-100">
                <CheckCircle2 size={18} />
                <p className="font-semibold">Perfil actualizado correctamente.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre (Readonly) */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={user.nombre}
                  readOnly
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Phone size={15} className="text-blue-500" /> Teléfono
                </label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: 999 888 777"
                  value={form.telefono}
                  onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion_defecto" className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <MapPin size={15} className="text-blue-500" /> Dirección de envío por defecto
              </label>
              <textarea
                id="direccion_defecto"
                rows={3}
                placeholder="Escribe tu dirección para auto-completar rápidamente tus compras futuras..."
                value={form.direccion_defecto}
                onChange={(e) => setForm(f => ({ ...f, direccion_defecto: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Esta dirección se usará para rellenar automáticamente el formulario de pago (Checkout).
              </p>
            </div>

            {/* Botón */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
