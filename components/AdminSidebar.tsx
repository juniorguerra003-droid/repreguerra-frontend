'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/constants';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PackageOpen, 
  Tags, 
  Image as ImageIcon,
  Star,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const ADMIN_LINKS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { name: 'Inventario', href: '/admin/productos', icon: PackageOpen },
  { name: 'Categorías', href: '/admin/categorias', icon: Tags },
  { name: 'Marcas', href: '/admin/marcas', icon: Star },
  { name: 'Publicidad', href: '/admin/publicidad', icon: ImageIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
            <img src="https://graph.facebook.com/repreguerra.pe/picture?type=large" alt={siteConfig.shortName} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">{siteConfig.shortName} Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-500 hover:text-slate-800 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 right-0 bg-white border-b border-slate-200 shadow-md z-20 px-4 pt-2 pb-4 flex flex-col gap-1">
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-10 shrink-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-blue-200/50 group-hover:shadow-blue-300/80 transition-shadow border border-gray-100">
              <img src="https://graph.facebook.com/repreguerra.pe/picture?type=large" alt={siteConfig.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-tight text-slate-900 leading-tight truncate w-40" title={siteConfig.name}>{siteConfig.name}</span>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Back-Office</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Navegación</div>
          {ADMIN_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} 
                />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            Ir a la tienda
          </Link>
        </div>
      </aside>
    </>
  );
}
