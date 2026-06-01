"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquareWarning,
  ChevronLeft,
  Eye,
  X,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  FileText
} from "lucide-react";

interface Complaint {
  id: string;
  nombres: string;
  documento: string;
  email: string;
  telefono: string | null;
  domicilio: string;
  tipoBien: string;
  montoReclamado: string | null;
  descripcionBien: string;
  tipoReclamo: string;
  detalle: string;
  pedido: string;
  estado: string;
  respuesta: string | null;
  createdAt: string;
}

type ComplaintStatus = "PENDIENTE" | "EN_PROCESO" | "RESUELTO";

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 border-amber-200",
  EN_PROCESO: "bg-blue-100 text-blue-800 border-blue-200",
  RESUELTO: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

// ─────────────────────────────────────────────
// Modal de detalle
// ─────────────────────────────────────────────

function ComplaintDetailModal({
  complaint,
  onClose,
  onStatusChange,
}: {
  complaint: Complaint;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
}) {
  const fecha = new Date(complaint.createdAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-0.5">
                Hoja de Reclamación
              </p>
              <h2 className="font-extrabold text-lg font-mono">
                #{complaint.id.slice(0, 8).toUpperCase()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {/* Info Consumidor */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2 col-span-2">
                <User size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Consumidor</p>
                  <p className="text-sm font-bold text-slate-800">{complaint.nombres}</p>
                  <p className="text-xs text-slate-500">{complaint.documento} • {complaint.email} {complaint.telefono ? `• ${complaint.telefono}` : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <MapPin size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Domicilio</p>
                  <p className="text-sm font-medium text-slate-800">{complaint.domicilio}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Fecha de Registro</p>
                  <p className="text-sm font-medium text-slate-800">{fecha}</p>
                </div>
              </div>
            </div>

            {/* Info del Bien */}
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <FileText size={14} /> Bien Contratado ({complaint.tipoBien})
              </h3>
              <p className="text-sm text-slate-800 font-medium mb-2">{complaint.descripcionBien}</p>
              {complaint.montoReclamado && (
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-400">Monto reclamado: </span>
                  S/ {parseFloat(complaint.montoReclamado).toFixed(2)}
                </p>
              )}
            </div>

            {/* Detalle del Reclamo */}
            <div className="px-6 py-4 bg-slate-50">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <AlertCircle size={14} /> Detalle del {complaint.tipoReclamo}
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-200">
                  {complaint.detalle}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Pedido (Lo que solicita)</h3>
                <p className="text-sm font-semibold text-blue-900 whitespace-pre-wrap bg-blue-50 p-4 rounded-xl border border-blue-100">
                  {complaint.pedido}
                </p>
              </div>
            </div>
          </div>

          {/* Footer: Cambio de estado */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-4 flex-shrink-0">
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-semibold mb-1">Estado de la queja</p>
              <select
                value={complaint.estado}
                onChange={(e) => onStatusChange(complaint.id, e.target.value)}
                className={`font-bold px-4 py-2 rounded-xl text-sm border-2 outline-none cursor-pointer transition ${
                  STATUS_STYLES[complaint.estado as ComplaintStatus] ?? "bg-slate-100 text-slate-600"
                }`}
              >
                {["PENDIENTE", "EN_PROCESO", "RESUELTO"].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────

export default function ReclamosAdmin() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    const cargarReclamos = async () => {
      try {
        const token = localStorage.getItem("adminToken") || "";
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
        const res = await fetch(`${API_BASE}/api/complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);
        } else {
          setError(data.message || "Error al cargar reclamos");
        }
      } catch (err: any) {
        setError("Falla de red: " + err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarReclamos();
  }, []);

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem("adminToken") || "";
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
        );
        if (selectedComplaint?.id === id) {
          setSelectedComplaint((prev) => (prev ? { ...prev, estado: nuevoEstado } : prev));
        }
      } else {
        alert(`❌ Error al actualizar: ${data.message}`);
      }
    } catch {
      alert("⚠️ Error de conexión.");
    }
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><p className="animate-pulse font-bold text-blue-600">Cargando Libro de Reclamaciones...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusChange={actualizarEstado}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <MessageSquareWarning size={28} className="text-blue-500" />
              Libro de Reclamaciones
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Gestiona quejas y reclamos (Ley N° 29571)
            </p>
          </div>
          <Link href="/admin" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl transition text-sm">
            <ChevronLeft size={16} /> Dashboard
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold">⚠️ {error}</div>}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-900 text-white">
                {["ID", "Fecha", "Cliente", "Tipo", "Estado", "Acción"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">No hay reclamos registrados.</td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono font-bold text-slate-900">#{c.id.slice(0, 6).toUpperCase()}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{new Date(c.createdAt).toLocaleDateString("es-PE")}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{c.nombres}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${c.tipoReclamo === 'RECLAMO' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.tipoReclamo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={c.estado}
                        onChange={(e) => actualizarEstado(c.id, e.target.value)}
                        className={`font-bold px-3 py-1.5 rounded-xl text-xs border-2 outline-none cursor-pointer ${STATUS_STYLES[c.estado as ComplaintStatus]}`}
                      >
                        {["PENDIENTE", "EN_PROCESO", "RESUELTO"].map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedComplaint(c)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg transition">
                        <Eye size={13} /> Leer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
