'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* 
        El Navbar global tiene lógica para no renderizarse en rutas /admin, 
        por lo que no necesitamos ocultarlo explícitamente aquí.
        Aquí simplemente inyectamos el layout del back-office.
      */}
      
      {/* Sidebar fijo a la izquierda (desktop) / topbar (mobile) */}
      {!isLoginPage && <AdminSidebar />}
      
      {/* Contenedor principal para las páginas admin */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

// Importamos AdminSidebar al final para evitar problemas de Next.js si fuera 'use client'
import AdminSidebar from '@/components/AdminSidebar';
import { usePathname } from 'next/navigation';
