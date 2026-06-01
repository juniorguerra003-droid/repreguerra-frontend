'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '@/lib/constants';

export default function Footer() {
  const pathname = usePathname();
  
  // No mostrar el footer en las rutas de administrador
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden mt-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="text-3xl font-extrabold tracking-widest uppercase text-white hover:text-blue-400 transition inline-block mb-4">
              Representaciones Guerra
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Proveedor líder en tecnología y equipos para empresas y particulares en el Perú. Garantía, confianza y rapidez con más de 10 años en el mercado.
            </p>
          </div>
          
          <div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-6">Atención al Cliente</h3>
            <ul className="space-y-4">
              {[
                { href: '/catalogo', label: 'Catálogo de Productos' },
                { href: '/mis-pedidos', label: 'Seguimiento de Pedidos' },
                { href: '/libro-de-reclamaciones', label: 'Libro de Reclamaciones' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition flex items-center gap-2 group w-fit">
                    <ChevronRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-6">Políticas y Legal</h3>
            <ul className="space-y-4">
              {[
                { href: '/terminos', label: 'Términos y Condiciones' },
                { href: '/politicas-de-envio', label: 'Políticas de Envío' },
                { href: '/politicas-de-privacidad', label: 'Políticas de Privacidad' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition flex items-center gap-2 group w-fit">
                    <ChevronRight size={14} className="text-blue-500 group-hover:translate-x-1 transition-transform" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} Representaciones Guerra S.A.C. Todos los derechos reservados.</p>
          
          <div className="flex items-center gap-4">
            <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 text-white font-bold">
              f
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
