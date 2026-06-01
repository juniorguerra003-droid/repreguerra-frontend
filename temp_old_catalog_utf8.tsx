'use client';

/**
 * components/Catalog.tsx
 *
 * Componente principal de la tienda p├║blica.
 *
 * Renderiza:
 *  1. HeroCarousel (banners din├ímicos) ΓÇö justo debajo del Navbar global
 *  2. Secci├│n de cat├ílogo con filtros + grid de productos
 *  3. Secci├│n "┬┐Qui├⌐nes Somos?" con tarjetas institucionales
 *  4. Secci├│n "Encu├⌐ntranos" con mapa de Google Maps + contacto
 *  5. Footer corporativo
 *  6. Bot├│n flotante de WhatsApp
 *
 * NOTA: El Navbar y el CartDrawer ahora viven en layout.tsx (Navbar.tsx),
 * NO en este componente.
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import {
  ShoppingCart,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Shield,
  Truck,
  HeadphonesIcon,
  MapPin,
  Mail,
  Clock,
  Star,
  Store,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import HeroCarousel, { type Banner } from '@/components/HeroCarousel';
import type { Producto, Categoria } from '@/types/store';

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Hooks y Helpers de UI para Animaciones
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function useFadeIn() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });

    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return { isVisible, domRef };
}

function FadeInSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { isVisible, domRef } = useFadeIn();
  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size: number }>;
}) {
  return (
    <div className="text-center mb-16">
      {Icon && (
        <span className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-[0.25em] mb-4 bg-blue-50 px-4 py-1.5 rounded-full">
          <Icon size={12} /> Nuestra propuesta
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight relative inline-block">
        {title}
        {!Icon && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-600 rounded-full" />
        )}
      </h2>
      {subtitle && (
        <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Sub-componente: ProductCard
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function ProductCard({ producto }: { producto: Producto }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const precio = parseFloat(producto.precio);

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio,
      imagen_url: producto.imagen_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Link overlay que hace toda la tarjeta clickable menos el bot├│n */}
      <Link href={`/producto/${producto.id}`} className="absolute inset-0 z-0" aria-label={`Ver ${producto.nombre}`} />

      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center p-4 z-10 pointer-events-none">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            <ShoppingBag size={48} strokeWidth={1} />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}

        {/* Badge de categor├¡a */}
        <div className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {producto.category.nombre}
        </div>

        {/* Badge de stock bajo */}
        {producto.stock <= 5 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
            ┬í├Ültimas {producto.stock}!
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-grow gap-3 z-10 pointer-events-none">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {producto.nombre}
          </h3>
          <p className="text-[11px] text-gray-400 font-mono tracking-wider uppercase">
            SKU: {producto.sku}
          </p>
        </div>

        {producto.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-3 pointer-events-auto">
          {/* Precio */}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-400 font-semibold">S/</span>
            <span className="text-2xl font-extrabold text-blue-600 tracking-tight">
              {precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Bot├│n Agregar al Carrito */}
          <button
            id={`add-to-cart-${producto.id}`}
            onClick={handleAddToCart}
            className={`
              w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-300
              flex items-center justify-center gap-2 shadow-sm
              ${
                added
                  ? 'bg-emerald-500 text-white scale-[0.98] shadow-emerald-200 shadow-md'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-200 hover:shadow-md'
              }
            `}
          >
            {added ? (
              <>
                <Sparkles size={15} className="animate-spin" />
                ┬íAgregado!
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Componente principal exportado: Catalog
// ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

interface CatalogProps {
  productos: Producto[];
  categorias: Categoria[];
  banners: Banner[];
}

export default function Catalog({ productos, categorias, banners }: CatalogProps) {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');

  /* Filtrado del lado cliente (categor├¡a + b├║squeda) */
  const productosFiltrados = productos.filter((p) => {
    const matchCategoria =
      categoriaActiva === 'todas' || p.category.id === categoriaActiva;
    const matchBusqueda =
      busqueda.trim() === '' ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <>
      {/* ΓöÇΓöÇ Carrusel Din├ímico (debajo del Navbar global) ΓöÇΓöÇ */}
      <HeroCarousel banners={banners} />

      {/* ΓöÇΓöÇ Cat├ílogo ΓöÇΓöÇ */}
      <main id="catalogo" className="bg-gray-50 py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <SectionTitle
              title="NUESTRO CAT├üLOGO"
              subtitle="Explora nuestra amplia gama de productos y equipos tecnol├│gicos con stock real y precios transparentes."
            />
          </FadeInSection>

          {/* Barra de b├║squeda + filtros de categor├¡a */}
          <FadeInSection delay={100}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <Store size={20} className="text-blue-600" />
                <span className="font-bold text-gray-800">
                  {productosFiltrados.length} producto
                  {productosFiltrados.length !== 1 ? 's' : ''} disponible
                  {productosFiltrados.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-80">
                <input
                  id="product-search"
                  type="search"
                  placeholder="Buscar por nombre o SKUΓÇª"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Pills de categor├¡as */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                id="filter-todas"
                onClick={() => setCategoriaActiva('todas')}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                  categoriaActiva === 'todas'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-sm'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  id={`filter-${cat.id}`}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                    categoriaActiva === cat.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </FadeInSection>

          {/* Grid de productos */}
          {productosFiltrados.length === 0 ? (
            <FadeInSection delay={200}>
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <ShoppingBag
                  size={56}
                  strokeWidth={1.5}
                  className="text-gray-300"
                />
                <p className="font-bold text-lg text-gray-600">
                  No hay productos que coincidan
                </p>
                <button
                  onClick={() => {
                    setCategoriaActiva('todas');
                    setBusqueda('');
                  }}
                  className="text-blue-600 font-bold text-sm hover:underline mt-2"
                >
                  Limpiar filtros de b├║squeda
                </button>
              </div>
            </FadeInSection>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productosFiltrados.map((producto, idx) => (
                <FadeInSection key={producto.id} delay={(idx % 4) * 100}>
                  <ProductCard producto={producto} />
                </FadeInSection>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ΓöÇΓöÇ ┬┐Qui├⌐nes Somos? ΓöÇΓöÇ */}
      <section
        id="quienes-somos"
        className="bg-white py-20 border-b border-gray-100 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <SectionTitle
              title="┬┐QUI├ëNES SOMOS?"
              subtitle="Repreguerra es un proveedor de tecnolog├¡a y equipos con m├ís de 10 a├▒os de trayectoria en el mercado peruano. Nos especializamos en ofrecer calidad garantizada."
              icon={Star}
            />
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: Shield,
                title: 'Garant├¡a Real',
                desc: 'Todos nuestros productos cuentan con garant├¡a de f├íbrica y soporte post-venta. Tu compra est├í protegida.',
                color: 'text-blue-600 bg-blue-50',
                border: 'hover:border-blue-200 hover:shadow-blue-100',
              },
              {
                icon: Truck,
                title: 'Env├¡o a Todo el Pa├¡s',
                desc: 'Hacemos env├¡os a Lima y provincias a trav├⌐s de nuestras alianzas log├¡sticas de confianza.',
                color: 'text-emerald-600 bg-emerald-50',
                border: 'hover:border-emerald-200 hover:shadow-emerald-100',
              },
              {
                icon: HeadphonesIcon,
                title: 'Soporte Dedicado',
                desc: 'Nuestro equipo de atenci├│n al cliente est├í disponible para resolver cualquier duda antes y despu├⌐s de tu compra.',
                color: 'text-violet-600 bg-violet-50',
                border: 'hover:border-violet-200 hover:shadow-violet-100',
              },
            ].map(({ icon: Icon, title, desc, color, border }, idx) => (
              <FadeInSection key={title} delay={idx * 150}>
                <div
                  className={`group p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-500 bg-white h-full ${border}`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} transition-transform group-hover:scale-110 duration-500 shadow-sm`}
                  >
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-xl mb-3">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇ Contacto y Ubicaci├│n ΓöÇΓöÇ */}
      <section id="encuentranos" className="bg-gray-50 py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeInSection>
            <SectionTitle
              title="ENCU├ëNTRANOS"
              subtitle="Vis├¡tanos en nuestra tienda f├¡sica o cont├íctanos por nuestros canales digitales."
            />
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-xl">
            {/* Mapa Interactivo */}
            <FadeInSection delay={100}>
              <div className="w-full h-80 lg:h-full min-h-[300px] rounded-2xl overflow-hidden bg-gray-100 relative group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.890333202685!2d-77.06282862410317!3d-12.05101684209935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c93a02796fa3%3A0x6e2f4f2f9b86000c!2sAv.%20Argentina%203093%2C%20Callao%2007001!5e0!3m2!1ses-419!2spe!4v1700000000000!5m2!1ses-419!2spe"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </FadeInSection>

            {/* Info de contacto */}
            <FadeInSection delay={200}>
              <div className="flex flex-col justify-center space-y-6 p-4 sm:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">
                      Direcci├│n Principal
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Av. Argentina 3093, Carmen de la Legua Reynoso
                      <br />
                      Callao 07001, Per├║
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">
                      Horario de Atenci├│n
                    </h4>
                    <ul className="text-gray-500 text-sm leading-relaxed space-y-1">
                      <li>
                        <strong className="text-gray-700">Lunes a Viernes:</strong>{' '}
                        9:00 AM - 6:00 PM
                      </li>
                      <li>
                        <strong className="text-gray-700">S├íbados:</strong> 9:00 AM -
                        1:00 PM
                      </li>
                      <li>
                        <strong className="text-gray-700">Domingos:</strong> Cerrado
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">
                      Contacto Directo
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Escr├¡benos para cotizaciones corporativas:
                      <br />
                      <a
                        href="mailto:ventas@repreguerra.pe"
                        className="text-blue-600 font-bold hover:underline mt-1 inline-block"
                      >
                        ventas@repreguerra.pe
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ΓöÇΓöÇ Footer Corporativo ΓöÇΓöÇ */}
      <footer className="bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Marca */}
            <div>
              <Link
                href="/"
                className="text-3xl font-extrabold tracking-widest uppercase text-white hover:text-blue-400 transition inline-block mb-4"
              >
                Repreguerra
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Proveedor l├¡der en tecnolog├¡a y equipos para empresas y
                particulares en el Per├║. Garant├¡a, confianza y rapidez.
              </p>
            </div>

            {/* Links r├ípidos */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-6">
                Navegaci├│n R├ípida
              </h3>
              <ul className="space-y-4">
                {[
                  { href: '#catalogo', label: 'Cat├ílogo de Productos' },
                  { href: '/checkout', label: 'Procesar Pago' },
                  { href: '/mis-pedidos', label: 'Seguimiento de Pedidos' },
                  { href: '#quienes-somos', label: 'Nuestra Historia' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 hover:text-white text-sm transition flex items-center gap-2 group w-fit"
                    >
                      <ChevronRight
                        size={14}
                        className="text-blue-500 group-hover:translate-x-1 transition-transform"
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes */}
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-widest mb-6">
                S├¡guenos
              </h3>
              <div className="flex gap-4">
                {['f', 'in', 'IG', 'X'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg text-sm font-bold"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center sm:flex sm:justify-between sm:text-left text-gray-500 text-xs">
            <p>
              ┬⌐ {new Date().getFullYear()} Repreguerra SAC. Todos los derechos
              reservados.
            </p>
            <p className="mt-2 sm:mt-0">Desarrollado para la excelencia.</p>
          </div>
        </div>
      </footer>

      {/* ΓöÇΓöÇ Bot├│n flotante de WhatsApp ΓöÇΓöÇ */}
      <a
        href="https://wa.me/51999999999?text=Hola%2C%20me%20interesa%20un%20producto%20de%20Repreguerra"
        target="_blank"
        rel="noopener noreferrer"
        id="whatsapp-float-btn"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20b859] shadow-2xl shadow-green-900/40 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white relative z-10"
          aria-hidden="true"
        >
          <path d="M16.003 2.667C8.638 2.667 2.667 8.638 2.667 16c0 2.346.635 4.618 1.839 6.607L2.667 29.333l6.908-1.806A13.267 13.267 0 0016.003 29.333C23.365 29.333 29.333 23.362 29.333 16S23.365 2.667 16.003 2.667zm0 24.267a11 11 0 01-5.591-1.522l-.4-.239-4.098 1.072 1.092-3.993-.261-.41A10.96 10.96 0 015.002 16c0-6.075 4.925-11 11.001-11S27.003 9.925 27.003 16s-4.925 11-11 11zm6.027-8.224c-.33-.166-1.952-.962-2.255-1.072-.303-.11-.524-.166-.745.166-.22.332-.857 1.072-1.05 1.293-.194.22-.387.248-.717.083-.33-.166-1.393-.513-2.653-1.636-.98-.873-1.643-1.95-1.835-2.28-.193-.332-.02-.511.145-.677.15-.149.33-.387.495-.58.166-.194.22-.332.33-.553.11-.22.055-.415-.028-.58-.083-.166-.745-1.795-1.02-2.458-.27-.645-.544-.557-.745-.567l-.635-.011c-.22 0-.579.082-.883.415-.303.332-1.158 1.133-1.158 2.762 0 1.63 1.186 3.206 1.352 3.427.165.22 2.334 3.562 5.657 4.995.79.342 1.406.546 1.887.699.792.252 1.514.217 2.085.132.636-.094 1.952-.798 2.228-1.57.276-.773.276-1.434.194-1.572-.083-.138-.303-.22-.634-.387z" />
        </svg>
      </a>
    </>
  );
}
