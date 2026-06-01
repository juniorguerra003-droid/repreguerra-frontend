"use client";
import { useState, useRef, useEffect } from "react";
import { siteConfig } from "@/lib/constants";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ocultar en la ruta de administración
  if (pathname?.startsWith("/admin")) return null;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Panel Emergente */}
      <div 
        className={`mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="bg-[#25D366] p-5 text-white flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg leading-tight">¡Hola! 👋</h3>
            <p className="text-sm text-green-50 mt-1 opacity-90">¿En qué podemos ayudarte?</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
            aria-label="Cerrar WhatsApp"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-2 bg-gray-50">
          <div className="flex flex-col gap-1">
            {siteConfig.whatsappNumbers.map((agent, index) => (
              <a
                key={index}
                href={`https://wa.me/${agent.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <MessageCircle size={20} className="fill-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{agent.label}</p>
                    <p className="text-xs text-gray-500">En línea</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contactar por WhatsApp"
        className="w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20b859] shadow-2xl shadow-green-900/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
      >
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
        )}
        {isOpen ? (
          <X size={28} className="text-white relative z-10" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-8 h-8 fill-white relative z-10"
            aria-hidden="true"
          >
            <path d="M16.003 2.667C8.638 2.667 2.667 8.638 2.667 16c0 2.346.635 4.618 1.839 6.607L2.667 29.333l6.908-1.806A13.267 13.267 0 0016.003 29.333C23.365 29.333 29.333 23.362 29.333 16S23.365 2.667 16.003 2.667zm0 24.267a11 11 0 01-5.591-1.522l-.4-.239-4.098 1.072 1.092-3.993-.261-.41A10.96 10.96 0 015.002 16c0-6.075 4.925-11 11.001-11S27.003 9.925 27.003 16s-4.925 11-11 11zm6.027-8.224c-.33-.166-1.952-.962-2.255-1.072-.303-.11-.524-.166-.745.166-.22.332-.857 1.072-1.05 1.293-.194.22-.387.248-.717.083-.33-.166-1.393-.513-2.653-1.636-.98-.873-1.643-1.95-1.835-2.28-.193-.332-.02-.511.145-.677.15-.149.33-.387.495-.58.166-.194.22-.332.33-.553.11-.22.055-.415-.028-.58-.083-.166-.745-1.795-1.02-2.458-.27-.645-.544-.557-.745-.567l-.635-.011c-.22 0-.579.082-.883.415-.303.332-1.158 1.133-1.158 2.762 0 1.63 1.186 3.206 1.352 3.427.165.22 2.334 3.562 5.657 4.995.79.342 1.406.546 1.887.699.792.252 1.514.217 2.085.132.636-.094 1.952-.798 2.228-1.57.276-.773.276-1.434.194-1.572-.083-.138-.303-.22-.634-.387z" />
          </svg>
        )}
      </button>
    </div>
  );
}
