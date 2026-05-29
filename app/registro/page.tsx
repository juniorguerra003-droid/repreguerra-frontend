'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  IdCard,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type DocType = 'DNI' | 'RUC';

interface FormState {
  nombre_completo: string;
  tipo_documento: DocType;
  num_documento: string;
  email: string;
  password: string;
  telefono: string;
}

interface FieldErrors {
  nombre_completo?: string;
  num_documento?: string;
  email?: string;
  password?: string;
}

// ─────────────────────────────────────────────
// Helpers de UI
// ─────────────────────────────────────────────

function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  suffix,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon: React.ElementType;
  required?: boolean;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-${suffix ? '10' : '4'} py-3 text-sm rounded-xl border bg-white text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:border-transparent transition
            ${error ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente de Registro
// ─────────────────────────────────────────────

export default function RegistroPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>({
    nombre_completo: '',
    tipo_documento: 'DNI',
    num_documento: '',
    email: '',
    password: '',
    telefono: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function validate(): boolean {
    const e: FieldErrors = {};
    if (form.nombre_completo.trim().length < 3)
      e.nombre_completo = 'El nombre debe tener al menos 3 caracteres.';
    if (form.num_documento.trim().length < 8)
      e.num_documento = 'Ingresa un número de documento válido (mín. 8 dígitos).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Ingresa un correo electrónico válido.';
    if (form.password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);

    try {
      const payload: Record<string, string> = {
        nombre_completo: form.nombre_completo.trim(),
        tipo_documento: form.tipo_documento,
        num_documento: form.num_documento.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      if (form.telefono.trim()) payload.telefono = form.telefono.trim();

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message ?? 'Error al crear la cuenta.');
        return;
      }

      // Guardar sesión y redirigir
      login(data.data.token, data.data.user);
      router.push('/');
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
        <Link href="/" className="text-xl font-extrabold tracking-widest uppercase hover:text-blue-400 transition">
          Repreguerra
        </Link>
        <Link href="/login" className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition">
          ¿Ya tienes cuenta? Iniciar sesión
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
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
                  Crear cuenta
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Regístrate para ver tu historial de pedidos y más.
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
                {/* Nombre */}
                <InputField
                  id="nombre_completo"
                  label="Nombre completo"
                  placeholder="Juan García López"
                  value={form.nombre_completo}
                  onChange={set('nombre_completo')}
                  error={errors.nombre_completo}
                  icon={User}
                  required
                />

                {/* Tipo + Número de documento */}
                <div className="grid grid-cols-[140px_1fr] gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                      Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipo_documento"
                      value={form.tipo_documento}
                      onChange={(e) => set('tipo_documento')(e.target.value)}
                      className="w-full h-[46px] px-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>
                  <InputField
                    id="num_documento"
                    label="Número"
                    placeholder={form.tipo_documento === 'DNI' ? '12345678' : '20512345678'}
                    value={form.num_documento}
                    onChange={set('num_documento')}
                    error={errors.num_documento}
                    icon={IdCard}
                    required
                  />
                </div>

                {/* Email */}
                <InputField
                  id="email"
                  label="Correo electrónico"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={form.email}
                  onChange={set('email')}
                  error={errors.email}
                  icon={Mail}
                  required
                />

                {/* Contraseña */}
                <InputField
                  id="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  icon={Lock}
                  required
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Teléfono (opcional) */}
                <InputField
                  id="telefono"
                  label="Teléfono"
                  type="tel"
                  placeholder="987 654 321 (opcional)"
                  value={form.telefono}
                  onChange={set('telefono')}
                  icon={Phone}
                />

                {/* Submit */}
                <button
                  type="submit"
                  id="register-submit-btn"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creando cuenta…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Crear mi cuenta
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-6">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
