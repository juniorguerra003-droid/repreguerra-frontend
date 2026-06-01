"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, X, FileSpreadsheet, Download, AlertCircle, Loader2 } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        nombre: "Producto de Ejemplo",
        sku: "PROD-001",
        descripcion: "Descripción del producto",
        precio: 99.99,
        stock: 10,
        categoryId: "AQUÍ_VA_EL_ID_DE_LA_CATEGORÍA",
        imagen_url: ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "Plantilla_Productos.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setLoading(true);
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          setError("El archivo está vacío o no tiene el formato correcto.");
          setPreviewData([]);
        } else {
          setPreviewData(jsonData);
        }
      } catch (err) {
        setError("Error al procesar el archivo. Asegúrate de que sea un Excel válido.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error al leer el archivo.");
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("adminToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/api/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(previewData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(data.message || `Se importaron productos exitosamente.`);
        setFile(null);
        setPreviewData([]);
        onSuccess();
        onClose();
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          // Extraer los mensajes de error detallados (ej: "body[0].categoryId: ID inválido")
          const errorDetails = data.errors.map((e: any) => {
            const path = e.path.join('.').replace('body.', 'Fila ');
            return `${path}: ${e.message}`;
          }).join(' | ');
          setError(`${data.message}: ${errorDetails}`);
        } else {
          setError(data.message || "Error al importar los productos. Verifica los datos.");
        }
      }
    } catch (err) {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Carga Masiva de Productos</h2>
            <p className="text-sm text-gray-500 mt-1">Sube tu inventario usando un archivo Excel.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="flex justify-end mb-4">
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <Download size={16} /> Descargar Plantilla de Ejemplo
            </button>
          </div>

          {!file ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={48} className="text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">Haz clic para subir tu Excel</h3>
              <p className="text-gray-500 text-sm">Soporta archivos .xlsx y .csv</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx, .csv" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewData([]); setError(null); }}
                  className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Cambiar archivo
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Procesando archivo...</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold">¡Archivo listo!</p>
                    <p className="text-sm mt-1">Se detectaron <strong>{previewData.length}</strong> productos listos para importar.</p>
                  </div>
                  <CheckCircle size={24} className="text-blue-600" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!file || loading || previewData.length === 0 || !!error}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
            Confirmar Importación
          </button>
        </div>

      </div>
    </div>
  );
}

// Componente helper temporal
function CheckCircle({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
