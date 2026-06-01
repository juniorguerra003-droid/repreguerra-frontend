'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Send, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LibroReclamaciones() {
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorMsg('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      nombres: formData.get('nombres'),
      documento: formData.get('documento'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      domicilio: formData.get('domicilio'),
      tipoBien: formData.get('tipoBien')?.toString().toUpperCase(),
      montoReclamado: formData.get('montoReclamado') || undefined,
      descripcionBien: formData.get('descripcionBien'),
      tipoReclamo: formData.get('tipoReclamo')?.toString().toUpperCase(),
      detalle: formData.get('detalle'),
      pedido: formData.get('pedido'),
    };

    try {
      // Ajusta la URL a la ruta de tu API real
      const response = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('No se pudo registrar el reclamo en este momento. Intente de nuevo.');
      }

      setEnviado(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Cabecera */}
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition mb-6 group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Volver al inicio
          </Link>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-900 px-8 py-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 flex items-start sm:items-center gap-6 flex-col sm:flex-row">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <BookOpen className="text-gray-900" size={40} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Libro de Reclamaciones</h1>
                  <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor, esta institución cuenta con un Libro de Reclamaciones a su disposición.
                  </p>
                </div>
              </div>
            </div>

            {enviado ? (
              <div className="px-8 py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-green-500" size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">¡Reclamo Registrado Exitosamente!</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Hemos recibido su solicitud y se ha enviado una copia a su correo electrónico. Le responderemos en el plazo legal establecido.
                </p>
                <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
                  Volver a la Tienda
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-semibold">
                    {errorMsg}
                  </div>
                )}
                
                {/* 1. Datos del Consumidor */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                    Identificación del Consumidor Reclamante
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Nombres y Apellidos *</label>
                      <input required type="text" name="nombres" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="Ej. Juan Pérez" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Documento de Identidad (DNI/CE) *</label>
                      <input required type="text" name="documento" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="Ej. 12345678" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico *</label>
                      <input required type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="correo@ejemplo.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono / Celular</label>
                      <input type="tel" name="telefono" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="Ej. 987654321" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Domicilio *</label>
                      <input required type="text" name="domicilio" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="Dirección completa" />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100" />

                {/* 2. Identificación del bien contratado */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                    Identificación del Bien Contratado
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipoBien" value="producto" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                        <span className="font-semibold text-gray-700">Producto</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipoBien" value="servicio" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="font-semibold text-gray-700">Servicio</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Monto Reclamado (Opcional)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">S/</span>
                        <input type="number" name="montoReclamado" step="0.01" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50" placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Descripción del Producto o Servicio *</label>
                      <textarea required name="descripcionBien" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50 resize-none" placeholder="Indique el nombre del producto o servicio" />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-gray-100" />

                {/* 3. Detalle de la Reclamación */}
                <section>
                  <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                    Detalle de la Reclamación
                  </h2>
                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipoReclamo" value="reclamo" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                        <span className="font-semibold text-gray-700">Reclamo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tipoReclamo" value="queja" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="font-semibold text-gray-700">Queja</span>
                      </label>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl">
                      <strong>Reclamo:</strong> Disconformidad relacionada a los productos o servicios.<br />
                      <strong>Queja:</strong> Disconformidad no relacionada a los productos o servicios; o, malestar o descontento respecto a la atención al público.
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Detalle *</label>
                      <textarea required name="detalle" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50 resize-none" placeholder="Explique de manera detallada lo sucedido" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pedido (Lo que solicita) *</label>
                      <textarea required name="pedido" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-gray-50/50 resize-none" placeholder="¿Cuál es su solicitud o exigencia?" />
                    </div>
                  </div>
                </section>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                  <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
                  <p className="text-sm text-blue-900 leading-relaxed">
                    La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI. El proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={cargando} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center gap-3 disabled:opacity-50">
                    {cargando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                    {cargando ? 'Procesando...' : 'Enviar Reclamo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
