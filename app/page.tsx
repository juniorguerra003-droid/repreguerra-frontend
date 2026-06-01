import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Tag, Star as StarIcon, Zap, Shield, Truck, HeadphonesIcon, MapPin, Clock, Mail, ChevronRight } from 'lucide-react';
import HeroCarousel, { Banner } from '@/components/HeroCarousel';
import BrandMarquee from '@/components/BrandMarquee';
import FadeInSection from '@/components/FadeInSection';
import type { Producto, Categoria, ApiResponse } from '@/types/store';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${siteConfig.name} – Tienda Oficial | Inicio`,
  description: `Encuentra los mejores equipos y tecnología en la tienda oficial de ${siteConfig.name}.`,
};

export const revalidate = 60;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE}/api/banners`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? (json.data as Banner[]) : [];
  } catch {
    return [];
  }
}

async function fetchOfertas(): Promise<Producto[]> {
  try {
    // Para simplificar, traemos los productos y filtramos los enOferta
    const res = await fetch(`${API_BASE}/api/products`, { next: { revalidate: 60 } });
    const json = await res.json();
    if (!json.success) return [];
    return json.data.filter((p: Producto) => p.enOferta && p.estado && p.stock > 0).slice(0, 4);
  } catch {
    return [];
  }
}

async function fetchMarcas(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/brands`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const [banners, ofertas, marcas] = await Promise.all([
    fetchBanners(),
    fetchOfertas(),
    fetchMarcas(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Carousel */}
      <HeroCarousel banners={banners} />

      {/* Marcas en formato Marquee (Ticker animado) */}
      <BrandMarquee marcas={marcas} />

      {/* 2. Ofertas de Locura */}
      {ofertas.length > 0 && (
        <section className="py-20 bg-red-50 border-y border-red-100">
          <FadeInSection delay={100}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold text-red-700 flex items-center gap-3">
                    <Zap className="text-red-500 fill-red-500" />
                    Ofertas de Locura
                  </h2>
                  <p className="text-red-600/80 mt-2 font-medium">Precios especiales por tiempo limitado.</p>
                </div>
                <Link href="/catalogo?ofertas=true" className="hidden sm:flex text-red-600 font-bold items-center gap-2 hover:text-red-800 transition-colors">
                  Ver más ofertas <ArrowRight size={18} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ofertas.map(producto => (
                  <Link key={producto.id} href={`/producto/${producto.id}`} className="bg-white rounded-2xl shadow-sm border border-red-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-md">
                      OFERTA
                    </div>
                    <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
                      {producto.imagen_url ? (
                         <img src={producto.imagen_url} alt={producto.nombre} className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                         <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{producto.nombre}</h3>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through font-semibold">S/ {parseFloat(producto.precio.toString()).toFixed(2)}</span>
                      <span className="text-2xl font-black text-red-600">S/ {parseFloat(producto.precioOferta!.toString()).toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>
      )}



      {/* 5. Quiénes Somos */}
      <section id="quienes-somos" className="bg-slate-50 py-20 border-t border-slate-100 overflow-hidden">
        <FadeInSection delay={150}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight relative inline-block">
                ¿QUIÉNES SOMOS?
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-600 rounded-full" />
              </h2>
              <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Repreguerra es un proveedor de tecnología y equipos con más de 10 años de trayectoria en el mercado peruano. Nos especializamos en ofrecer calidad garantizada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: Shield,
                  title: 'Garantía Real',
                  desc: 'Todos nuestros productos cuentan con garantía de fábrica y soporte post-venta. Tu compra está protegida.',
                  color: 'text-blue-600 bg-blue-50',
                  border: 'hover:border-blue-200 hover:shadow-blue-100',
                },
                {
                  icon: Truck,
                  title: 'Envío a Todo el País',
                  desc: 'Hacemos envíos a Lima y provincias a través de nuestras alianzas logísticas de confianza.',
                  color: 'text-emerald-600 bg-emerald-50',
                  border: 'hover:border-emerald-200 hover:shadow-emerald-100',
                },
                {
                  icon: HeadphonesIcon,
                  title: 'Soporte Dedicado',
                  desc: 'Nuestro equipo de atención al cliente está disponible para resolver cualquier duda antes y después de tu compra.',
                  color: 'text-violet-600 bg-violet-50',
                  border: 'hover:border-violet-200 hover:shadow-violet-100',
                },
              ].map(({ icon: Icon, title, desc, color, border }, idx) => (
                <div key={title} className={`group p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-500 bg-white h-full ${border}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color} transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-xl mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* 6. Encuéntranos */}
      <section id="encuentranos" className="bg-white py-20 border-t border-gray-200">
        <FadeInSection delay={150}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight relative inline-block">
                ENCUÉNTRANOS
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-blue-600 rounded-full" />
              </h2>
              <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                Visítanos en nuestra tienda física o contáctanos por nuestros canales digitales.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-xl">
              <div className="w-full h-80 lg:h-full min-h-[300px] rounded-2xl overflow-hidden bg-gray-100 relative group">
                <iframe
                  src={siteConfig.mapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="flex flex-col justify-center space-y-6 p-4 sm:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">Dirección Principal</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{siteConfig.address}</p>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100" />
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">Horario de Atención</h4>
                    <ul className="text-gray-500 text-sm leading-relaxed space-y-1">
                      <li><strong className="text-gray-700">Lunes a Viernes:</strong> 9:30 AM - 6:00 PM</li>
                      <li><strong className="text-gray-700">Sábados:</strong> 9:30 AM - 4:00 PM</li>
                      <li><strong className="text-gray-700">Domingos:</strong> Cerrado</li>
                    </ul>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100" />
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">Contacto Directo</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Escríbenos para cotizaciones corporativas:<br />
                      <a href={`mailto:${siteConfig.email}`} className="text-blue-600 font-bold hover:underline mt-1 inline-block">{siteConfig.email}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

    </div>
  );
}