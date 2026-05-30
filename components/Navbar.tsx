'use client';

/**
 * components/Navbar.tsx
 *
 * Barra de navegación corporativa global.
 *
 * Características:
 *  - Sticky top con glassmorphism + sombra sutil
 *  - Logo "Repreguerra" con tipografía de alto peso
 *  - Links de navegación fluida: Inicio, Catálogo, Quiénes Somos, Contacto
 *  - Zona derecha: Auth (Login/Registro vs Hola+MisPedidos+Salir) + Carrito
 *  - Menú hamburguesa en mobile (drawer lateral)
 *  - Se oculta automáticamente en rutas /admin
 *  - z-index: 40 (CartDrawer usa 50, modales 60)
 */

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Package,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '@/components/CartDrawer';

// ─────────────────────────────────────────────
// Links de navegación
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/#catalogo', label: 'Catálogo' },
  { href: '/#quienes-somos', label: 'Quiénes Somos' },
  { href: '/#encuentranos', label: 'Contacto' },
] as const;

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user, isHydrated, logout } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  // Detectar scroll para dar profundidad al header
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // No renderizar en rutas de admin
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              id="navbar-logo"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-200/60 group-hover:shadow-blue-300/80 transition-shadow">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors hidden sm:block">
                Repreguerra
              </span>
            </Link>

            {/* ── Nav links (desktop) ── */}
            <nav className="hidden md:flex items-center gap-1" id="navbar-desktop-nav">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('#')[0]));
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Zona derecha: Auth + Carrito + Hamburguesa ── */}
            <div className="flex items-center gap-2">

              {/* Auth zone — solo muestra al hidratar para evitar layout shift */}
              {isHydrated && (
                <div className="hidden md:flex items-center gap-2">
                  {user ? (
                    <>
                      <span className="text-sm text-gray-500 font-medium mr-1">
                        Hola, <strong className="text-gray-800">{user.nombre.split(' ')[0]}</strong>
                      </span>
                      <Link
                        href="/perfil"
                        className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold transition"
                      >
                        <User size={15} />
                        Mi Perfil
                      </Link>
                      <Link
                        href="/mis-pedidos"
                        id="nav-mis-pedidos"
                        className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-semibold transition"
                      >
                        <Package size={15} />
                        Mis Pedidos
                      </Link>
                      <button
                        id="nav-logout-btn"
                        onClick={logout}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-semibold transition"
                      >
                        <LogOut size={15} />
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      id="nav-login-btn"
                      className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                      <User size={15} />
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
              )}

              {/* Botón Carrito */}
              <button
                id="cart-open-btn"
                onClick={openCart}
                aria-label={`Abrir carrito, ${totalItems} productos`}
                className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-blue-200/60 hover:shadow-blue-300/80"
              >
                <ShoppingCart size={17} />
                <span className="hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-extrabold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Hamburguesa mobile */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menú de navegación"
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-5 pt-2 border-t border-gray-100 bg-white/95 backdrop-blur-xl space-y-1">
            {/* Nav links */}
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                {label}
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-2" />

            {/* Auth mobile */}
            {isHydrated && (
              user ? (
                <div className="space-y-1">
                  <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Hola, {user.nombre.split(' ')[0]}
                  </div>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <User size={17} className="text-blue-500" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/mis-pedidos"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    <Package size={17} className="text-blue-500" />
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut size={17} />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    href="/login"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-center py-3 rounded-xl text-sm font-bold transition"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-xl text-sm font-bold transition"
                  >
                    Registrarse
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* CartDrawer — z-50 (por encima del Navbar z-40) */}
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  );
}
