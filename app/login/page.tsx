'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Ingresa un correo electrónico válido.';
    if (password.length < 1) e.password = 'Ingresa tu contraseña.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message ?? 'Credenciales incorrectas.');
        return;
      }

      login(data.data.token, data.data.user);

      // Redirigir según rol: admins van al panel, clientes a la tienda
      if (data.data.user.rol === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setServerError('No pudimos conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header mínimo */}
      <header className="bg-gray-950 text-white py-4 px-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-widest uppercase hover:text-blue-400 transition"
        >
          Repreguerra
        </Link>
        <Link
          href="/registro"
          className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition"
        >
          ¿No tienes cuenta? Regístrate
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Franja decorativa */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            <div className="p-8 sm:p-10">
              {/* Título */}
              <div className="mb-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 font-semibold transition mb-5"
                >
                  <ChevronLeft size={14} /> Volver a la tienda
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Iniciar sesión
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Accede para ver tus pedidos y tu historial de compras.
                </p>
              </div>

              {/* Error global */}
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6"
                >
                  <AlertCircle size={17} className="flex-shrink-0 mt-0.5" />
                  <p>{serverError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-semibold text-slate-600 mb-1.5"
                  >
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                      }}
                      className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:border-transparent transition
                        ${errors.email ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-slate-600 mb-1.5"
                  >
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((er) => ({ ...er, password: undefined }));
                      }}
                      className={`w-full pl-10 pr-10 py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-400
                        focus:outline-none focus:ring-2 focus:border-transparent transition
                        ${errors.password ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Verificando…
                    </>
                  ) : (
                    <>
                      <LogIn size={17} />
                      Iniciar sesión
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-blue-600 font-bold hover:underline">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
