'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  ShoppingBag,
  ChevronLeft,
  MapPin,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// ─────────────────────────────────────────────
// Supabase client (solo browser, credenciales públicas)
// ─────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'comprobantes';

// ─────────────────────────────────────────────
// Tipos locales
// ─────────────────────────────────────────────

type PaymentMethod = 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';

interface OrderSuccessData {
  id: string;
  total: number;
  estado_pedido: string;
  direccion_envio: string;
  createdAt: string;
}

interface FormState {
  direccion_envio: string;
  metodo_pago: PaymentMethod;
}

interface FormErrors {
  direccion_envio?: string;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'YAPE', label: 'Yape', icon: '💜' },
  { value: 'PLIN', label: 'Plin', icon: '💚' },
  { value: 'TARJETA', label: 'Tarjeta', icon: '💳' },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: '🏦' },
];

/** Métodos que requieren comprobante de transferencia */
const REQUIRES_COMPROBANTE: PaymentMethod[] = ['YAPE', 'PLIN'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─────────────────────────────────────────────
// Estado vacío
// ─────────────────────────────────────────────

function EmptyCartMessage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6 px-4">
      <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
        <ShoppingBag size={40} className="text-blue-300" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          Agrega productos desde el catálogo antes de proceder al pago.
        </p>
      </div>
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition shadow-md shadow-blue-200"
      >
        <ChevronLeft size={18} /> Volver al catálogo
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
// Success state
// ─────────────────────────────────────────────

function OrderSuccess({ order }: { order: OrderSuccessData }) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const total =
    typeof order.total === 'number' ? order.total : parseFloat(String(order.total));

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6 px-4">
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
        <div className="relative w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 size={64} className="text-emerald-500" strokeWidth={1.5} />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¡Pedido confirmado!</h2>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          Tu pedido ha sido registrado exitosamente. Lo procesaremos a la brevedad.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
            Número de pedido
          </span>
          <span className="font-mono font-extrabold text-gray-900 text-sm">#{shortId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" /> Envío a
          </span>
          <span className="text-sm font-semibold text-gray-800 text-right max-w-[55%] line-clamp-2">
            {order.direccion_envio}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-gray-600 font-semibold">Total pagado</span>
          <span className="text-2xl font-extrabold text-emerald-600">
            S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/mis-pedidos"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/"
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <ShoppingCart size={16} /> Seguir comprando
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-componente: FileUploader (comprobante)
// ─────────────────────────────────────────────

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
}

function FileUploader({ onUploadComplete, onUploadStart, onUploadEnd }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  // Mapeo de errores de Supabase a mensajes amigables
  function parseSupabaseError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('bucket not found') || lower.includes('not found'))
      return 'El bucket "comprobantes" no existe en Supabase. Créalo en Storage → New Bucket → nombre: comprobantes → Public: ✅.';
    if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('policy') || lower.includes('violates'))
      return 'Falta política de inserción en Supabase. Ve a Storage → comprobantes → Policies → New policy → INSERT para users anónimos.';
    if (lower.includes('unauthorized') || lower.includes('invalid api key'))
      return 'La clave Supabase configurada no tiene permisos de storage. Verifica NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local.';
    if (lower.includes('payload too large') || lower.includes('file size'))
      return 'El archivo excede el límite permitido por Supabase (máx. 50 MB por defecto).';
    if (lower.includes('duplicate') || lower.includes('already exists'))
      return 'Ya existe un archivo con ese nombre. Se reintentará con un nombre diferente.';
    return `Error de Supabase: ${message}`;
  }

  const handleFile = async (file: File) => {
    // Validar tipo MIME real (no solo extensión)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      setUploadError('Solo se permiten imágenes (JPG, PNG, WEBP, HEIC).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no puede pesar más de 5 MB.');
      return;
    }

    setUploadError(null);
    setUploaded(false);
    setUploading(true);
    onUploadStart();

    // Vista previa local inmediata (no espera al upload)
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
      // Path único para evitar colisiones
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Construir URL pública
      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública del comprobante.');
      }

      onUploadComplete(publicData.publicUrl);
      setUploaded(true);
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : 'Error desconocido al subir la imagen.';
      const friendlyMsg = parseSupabaseError(rawMsg);
      setUploadError(friendlyMsg);
      // Mantener la preview para que el usuario vea qué imagen falló
      onUploadComplete(''); // resetear URL en el padre
    } finally {
      setUploading(false);
      onUploadEnd();
    }
  };

  const clearFile = () => {
    setPreview(null);
    setUploaded(false);
    setUploadError(null);
    onUploadComplete('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">
        Captura de pago (Yape/Plin){' '}
        <span className="text-gray-400 font-normal">(opcional, pero recomendado)</span>
      </label>

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition">
            <Upload size={20} className="text-gray-400 group-hover:text-blue-500 transition" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              Arrastra tu captura o{' '}
              <span className="text-blue-600 underline">haz clic aquí</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP · Máx. 5 MB</p>
          </div>
          <input
            ref={inputRef}
            id="comprobante-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      ) : (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Comprobante"
            className="h-40 w-auto rounded-xl border border-gray-200 object-cover shadow-sm"
          />
          {uploading && (
            <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          )}
          {uploaded && !uploading && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
              <CheckCircle2 size={14} />
            </div>
          )}
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}
      {uploaded && !uploading && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={12} /> Comprobante subido correctamente
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal: CheckoutView
// ─────────────────────────────────────────────

export default function CheckoutView() {
  const { items, totalPrice, clearCart, isHydrated: cartHydrated } = useCart();
  const { user, token, isHydrated: authHydrated } = useAuth();

  const [form, setForm] = useState<FormState>({
    direccion_envio: '',
    metodo_pago: 'YAPE',
  });

  // Auto-completar dirección si el usuario tiene una por defecto
  useEffect(() => {
    if (user?.direccion_defecto && !form.direccion_envio) {
      setForm((f) => ({ ...f, direccion_envio: user.direccion_defecto! }));
    }
  }, [user?.direccion_defecto]);

  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<OrderSuccessData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsComprobante = REQUIRES_COMPROBANTE.includes(form.metodo_pago);

  if (!cartHydrated || !authHydrated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={36} />
      </div>
    );
  }

  if (items.length === 0 && !successData) return <EmptyCartMessage />;
  if (successData) return <OrderSuccess order={successData} />;

  if (!user && !successData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center">
          <AlertCircle size={40} className="text-orange-400" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Inicia sesión para continuar</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Por seguridad, necesitas una cuenta para poder realizar compras y hacer seguimiento a tus pedidos.
          </p>
        </div>
        <div className="flex gap-4 mt-2">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-md shadow-blue-200"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-8 py-3.5 rounded-xl transition"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    );
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (form.direccion_envio.trim().length < 5) {
      newErrors.direccion_envio = 'La dirección debe tener al menos 5 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    if (isUploading) {
      setServerError('Espera a que termine de subir el comprobante antes de confirmar.');
      return;
    }

    setIsSubmitting(true);

    const payload: Record<string, unknown> = {
      items: items.map((item) => ({ productId: item.id, cantidad: item.cantidad })),
      direccion_envio: form.direccion_envio.trim(),
      metodo_pago: form.metodo_pago,
    };
    if (comprobanteUrl) payload.comprobante_url = comprobanteUrl;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/orders/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.message ?? 'Error desconocido del servidor.');
        return;
      }

      clearCart();
      startTransition(() => setSuccessData(data.data as OrderSuccessData));
    } catch {
      setServerError('No pudimos conectar con el servidor. Verifica que el backend esté activo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const loading = isSubmitting || isPending || isUploading;
  const subtotal = items.reduce((a, i) => a + i.precio * i.cantidad, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-10">
        <Link href="/" className="hover:text-blue-600 font-semibold transition flex items-center gap-1">
          <ChevronLeft size={16} /> Catálogo
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-semibold">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* ── Columna Izquierda: Formulario ── */}
        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Finalizar compra</h1>
            <p className="text-gray-500 mt-1 text-sm">Completa tu información de envío y pago.</p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
            >
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{serverError}</p>
            </div>
          )}

          {/* Dirección */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-extrabold text-gray-800 flex items-center gap-2 text-base">
              <MapPin size={18} className="text-blue-500" /> Dirección de envío
            </h2>
            <div>
              <label htmlFor="direccion_envio" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Dirección completa <span className="text-red-500">*</span>
              </label>
              <textarea
                id="direccion_envio"
                name="direccion_envio"
                rows={3}
                placeholder="Ej: Av. Javier Prado Este 4600, San Borja, Lima"
                value={form.direccion_envio}
                onChange={(e) => {
                  setForm((f) => ({ ...f, direccion_envio: e.target.value }));
                  if (errors.direccion_envio)
                    setErrors((err) => ({ ...err, direccion_envio: undefined }));
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none transition ${
                  errors.direccion_envio
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/50'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
              {errors.direccion_envio && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.direccion_envio}
                </p>
              )}
            </div>
          </section>

          {/* Método de pago + comprobante */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-extrabold text-gray-800 flex items-center gap-2 text-base">
              <CreditCard size={18} className="text-blue-500" /> Método de pago
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={`pago-${opt.value}`}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                    form.metodo_pago === opt.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    id={`pago-${opt.value}`}
                    name="metodo_pago"
                    value={opt.value}
                    checked={form.metodo_pago === opt.value}
                    onChange={() => setForm((f) => ({ ...f, metodo_pago: opt.value }))}
                    className="sr-only"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <span
                    className={`font-bold text-sm ${
                      form.metodo_pago === opt.value ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {form.metodo_pago === opt.value && (
                    <CheckCircle2 size={16} className="text-blue-500 ml-auto" />
                  )}
                </label>
              ))}
            </div>

            {/* Uploader de comprobante — solo para YAPE/PLIN */}
            {needsComprobante && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={15} className="text-blue-500" />
                  <p className="text-sm text-blue-700 font-semibold">
                    Sube la captura de tu transferencia por {form.metodo_pago}
                  </p>
                </div>
                <FileUploader
                  onUploadComplete={(url) => setComprobanteUrl(url)}
                  onUploadStart={() => setIsUploading(true)}
                  onUploadEnd={() => setIsUploading(false)}
                />
              </div>
            )}
          </section>

          {/* Submit mobile */}
          <div className="lg:hidden">
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isUploading ? 'Subiendo comprobante…' : 'Procesando…'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Confirmar Pedido
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── Columna Derecha: Resumen ── */}
        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gray-950 text-white px-6 py-4 flex items-center gap-3">
              <Package size={18} />
              <h2 className="font-extrabold text-base">Resumen de tu orden</h2>
              <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {items.reduce((a, i) => a + i.cantidad, 0)} ítem
                {items.reduce((a, i) => a + i.cantidad, 0) !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} className="object-contain w-full h-full p-1" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-300" strokeWidth={1} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.cantidad} × S/ {item.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-gray-900 tabular-nums flex-shrink-0">
                    S/ {(item.precio * item.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">
                  S/ {subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="font-semibold text-emerald-600">Por definir</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-extrabold text-gray-800 text-base">Total</span>
                <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  S/ {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Submit desktop */}
            <div className="hidden lg:block px-5 pb-5">
              <button
                type="submit"
                form="checkout-form"
                id="checkout-submit-btn"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isUploading ? 'Subiendo comprobante…' : 'Procesando pedido…'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar Pedido · S/ {totalPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                🔒 Pago 100% seguro y garantizado
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
