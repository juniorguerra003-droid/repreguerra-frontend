import React from 'react';
import { CheckCircle, Package, Truck, Home, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: string; // 'PENDIENTE', 'PROCESANDO', 'ENVIADO', 'COMPLETADO', 'CANCELADO'
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'CANCELADO') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <XCircle className="text-red-500" size={24} />
        <div>
          <p className="font-bold text-red-800">Pedido Cancelado</p>
          <p className="text-xs text-red-600">Este pedido ha sido cancelado y no será procesado.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 'CONFIRMADO', label: 'Confirmado', icon: CheckCircle },
    { id: 'EMPAQUETADO', label: 'Empaquetado', icon: Package },
    { id: 'EN_TRANSITO', label: 'En tránsito (Saliendo de Cercado de Lima)', icon: Truck },
    { id: 'ENTREGADO', label: 'Entregado', icon: Home },
  ];

  // Determinar el índice activo basado en el estado del backend
  let activeIndex = 0;
  if (status === 'PENDIENTE') activeIndex = 0; // Confirmado
  if (status === 'PROCESANDO') activeIndex = 1; // Empaquetado
  if (status === 'ENVIADO') activeIndex = 2; // En tránsito
  if (status === 'COMPLETADO') activeIndex = 3; // Entregado

  return (
    <div className="py-6 w-full">
      <div className="flex flex-col md:flex-row relative justify-between items-start md:items-center w-full gap-6 md:gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= activeIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex md:flex-col items-center relative w-full md:flex-1 group">
              {/* Línea conectora (Desktop) */}
              {!isLast && (
                <div 
                  className={`hidden md:block absolute top-6 left-[50%] w-full h-[2px] -z-10 transition-colors duration-500 ${
                    index < activeIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
              
              {/* Línea conectora (Mobile) */}
              {!isLast && (
                <div 
                  className={`md:hidden absolute left-6 top-10 w-[2px] h-full -z-10 transition-colors duration-500 ${
                    index < activeIndex ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Icono del paso */}
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 shrink-0 ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-100 text-white shadow-md shadow-emerald-200' 
                    : 'bg-white border-gray-100 text-gray-300'
                }`}
              >
                <Icon size={20} strokeWidth={isCompleted ? 2.5 : 2} />
              </div>

              {/* Etiqueta */}
              <div className="ml-4 md:ml-0 md:mt-3 md:text-center">
                <p className={`text-sm font-bold transition-colors ${
                  isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {index === activeIndex && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                    Estado actual
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
