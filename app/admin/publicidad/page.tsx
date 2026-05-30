'use client';

/**
 * app/admin/publicidad/page.tsx
 *
 * Gestión de banners publicitarios.
 * Sube imágenes al bucket 'publicidad' de Supabase Storage,
 * guarda la URL en la API y permite activar/desactivar banners.
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const BUCKET = 'banners';

interface Banner {
  id: string;
  titulo: string;
  imagen_url: string;
  enlace_opcional: string | null;
  activo: boolean;
  orden: number;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Subcomponente: ImageUploader
// ─────────────────────────────────────────────

function ImageUploader({
  onUploaded,
  onUploading,
}: {
  onUploaded: (url: string) => void;
  onUploading: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Máximo 10 MB.'); return; }

    setError(null);
    setDone(false);
    setUploading(true);
    onUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
      const path = `banner-${Date.now()}.${ext}`;
      const { data, error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
      onUploaded(pub.publicUrl);
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir');
      onUploaded('');
    } finally {
      setUploading(false);
      onUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
        className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition group
          ${preview ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/20'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="max-h-32 rounded-lg object-cover shadow" />
            {uploading && (
              <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            )}
            {done && !uploading && (
              <span className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                <CheckCircle2 size={14} />
              </span>
            )}
          </>
        ) : (
          <>
            <Upload size={28} className="text-slate-400 group-hover:text-blue-500 transition" />
            <p className="text-sm font-semibold text-slate-600">Arrastra o haz clic</p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP · Máx. 10 MB</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────

export default function PublicidadAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario de nuevo banner
  const [titulo, setTitulo] = useState('');
  const [enlace, setEnlace] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('adminToken') ?? '' : ''; }

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/banners/admin`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setBanners(data.data);
      else setError(data.message ?? 'Error al cargar banners');
    } catch { setError('Error de red'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchBanners(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError('');
    if (!titulo.trim() || !imagenUrl) { setSaveError('El título y la imagen son obligatorios.'); return; }
    if (isUploading) { setSaveError('Espera a que termine la subida de imagen.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/banners/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ titulo: titulo.trim(), imagen_url: imagenUrl, enlace_opcional: enlace.trim() || null, orden: banners.length }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setSaveError(data.message ?? 'Error al guardar'); return; }
      setTitulo(''); setEnlace(''); setImagenUrl('');
      fetchBanners();
    } catch { setSaveError('Error de red'); }
    finally { setSaving(false); }
  }

  async function toggleActivo(id: string, activo: boolean) {
    await fetch(`${API_BASE}/api/banners/admin/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ activo: !activo }),
    });
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, activo: !b.activo } : b));
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este banner?')) return;
    await fetch(`${API_BASE}/api/banners/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function reorder(id: string, direction: 'up' | 'down') {
    const idx = banners.findIndex((b) => b.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === banners.length - 1)) return;
    const newBanners = [...banners];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newBanners[idx], newBanners[swapIdx]] = [newBanners[swapIdx], newBanners[idx]];
    setBanners(newBanners);
    // Persist orden
    await Promise.all([
      fetch(`${API_BASE}/api/banners/admin/${newBanners[idx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ orden: idx }),
      }),
      fetch(`${API_BASE}/api/banners/admin/${newBanners[swapIdx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ orden: swapIdx }),
      }),
    ]);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <ImageIcon size={28} className="text-blue-500" />
              Gestión de Publicidad
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configura los banners del carrusel principal de la tienda
            </p>
          </div>
          <Link href="/admin" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm shadow">
            <ChevronLeft size={16} /> Dashboard
          </Link>
        </div>

        {/* ── Formulario de nuevo banner ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <h2 className="font-extrabold text-slate-800 text-base mb-5 flex items-center gap-2">
            <Plus size={18} className="text-blue-500" /> Agregar nuevo banner
          </h2>

          {saveError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {saveError}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Título del banner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="banner-titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Gran oferta de verano"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                  Enlace (opcional)
                </label>
                <input
                  type="url"
                  id="banner-enlace"
                  value={enlace}
                  onChange={(e) => setEnlace(e.target.value)}
                  placeholder="https://... o /checkout"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                Imagen del banner <span className="text-red-500">*</span>
              </label>
              <ImageUploader
                onUploaded={(url) => setImagenUrl(url)}
                onUploading={setIsUploading}
              />
              {imagenUrl && (
                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={12} /> Imagen lista para guardar
                </p>
              )}
            </div>

            <button
              type="submit"
              id="create-banner-btn"
              disabled={saving || isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Plus size={16} /> Publicar Banner</>}
            </button>
          </form>
        </div>

        {/* ── Lista de banners ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <ImageIcon size={18} /> Banners activos en carrusel
            </h2>
            <span className="text-slate-400 text-sm">{banners.filter(b => b.activo).length} de {banners.length} activos</span>
          </div>

          {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={28} /></div>
          ) : error ? (
            <div className="p-6 text-red-600 font-semibold text-sm">{error}</div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <ImageIcon size={40} className="mx-auto mb-3" strokeWidth={1} />
              <p className="font-bold text-slate-600">Sin banners configurados</p>
              <p className="text-sm mt-1">Agrega tu primer banner usando el formulario de arriba.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {banners.map((banner, idx) => (
                <div key={banner.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                  {/* Miniatura */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={banner.imagen_url} alt={banner.titulo} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{banner.titulo}</p>
                    {banner.enlace_opcional && (
                      <p className="text-xs text-blue-500 truncate mt-0.5">{banner.enlace_opcional}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(banner.createdAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>

                  {/* Estado badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    banner.activo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {banner.activo ? 'Activo' : 'Oculto'}
                  </span>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => reorder(banner.id, 'up')} disabled={idx === 0}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition">
                      <ArrowUp size={14} />
                    </button>
                    <button onClick={() => reorder(banner.id, 'down')} disabled={idx === banners.length - 1}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition">
                      <ArrowDown size={14} />
                    </button>
                    <button onClick={() => toggleActivo(banner.id, banner.activo)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        banner.activo ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                      }`}>
                      {banner.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => handleDelete(banner.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          💡 Asegúrate de crear el bucket <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">publicidad</code> en Supabase Storage con acceso público.
        </p>
      </div>
    </div>
  );
}
