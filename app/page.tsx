import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';

// --- COMPONENTES ---

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm h-20 w-full flex items-center justify-center">
      <div className="container mx-auto px-4 lg:px-8 h-full flex items-center justify-between">
        
        {/* Izquierda: Logo */}
        <div className="flex-shrink-0">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            REPREGUERRA
          </span>
        </div>

        {/* Centro: Barra de Búsqueda */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
          <input 
            type="text" 
            placeholder="Buscar cámaras, DVRs, accesorios..." 
            className="w-full bg-gray-100 rounded-lg py-2.5 pl-4 pr-10 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
            <Search size={20} />
          </button>
        </div>

        {/* Derecha: Mi Cuenta & Carrito */}
        <div className="flex items-center space-x-6">
          <a href="#" className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Mi Cuenta
          </a>
          <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
            <ShoppingCart size={26} strokeWidth={2.5} />
            <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

const HeroBanner = () => {
  return (
    <section className="w-full bg-gradient-to-r from-slate-900 to-blue-900 text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
          SEGURIDAD INTELIGENTE
        </h1>
        <p className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto">
          Protege lo que más importa con nuestra tecnología CCTV de última generación.
        </p>
        <div className="pt-4">
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
            Ver Catálogo
          </button>
        </div>
      </div>
    </section>
  );
};

interface ProductCardProps {
  id: string; // Cambiado a string para soportar UUID de la BD real
  nombre: string;
  categoria: string;
  precio: number;
  imagen_url?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ nombre, categoria, precio }) => {
  // Asegurarnos de que el precio sea numérico (por si Prisma/Fetch lo devuelve como string decimal)
  const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;

  return (
    <article className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Arriba: Contenedor de Imagen (Gris claro simulando imagen) */}
      <div className="aspect-square bg-gray-200 w-full relative overflow-hidden flex items-center justify-center">
        {/* Un icono opcional como placeholder de imagen */}
        <span className="text-gray-400 opacity-50 font-medium">Imagen</span>
      </div>

      {/* Medio: Información del Producto */}
      <div className="p-5 flex-1 flex flex-col">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {categoria || 'Sin categoría'}
        </span>
        <h3 className="text-base font-bold text-gray-800 leading-snug mb-3 flex-1 group-hover:text-blue-600 transition-colors">
          {nombre}
        </h3>
        <div className="mt-auto">
          <span className="text-2xl text-blue-600 font-extrabold block mb-4">
            S/ {precioNumerico.toFixed(2)}
          </span>
          
          {/* Abajo: Botón */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
};

// --- FETCH DATA (SERVER SIDE) ---

async function getProductos() {
  try {
    const res = await fetch('http://localhost:3000/api/products', {
      cache: 'no-store' // Para que los datos siempre estén frescos
    });
    
    if (!res.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await res.json();
    
    if (data.success) {
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    return null; // Retornamos null para manejar el error amigablemente en la UI
  }
}

// --- PÁGINA PRINCIPAL (SERVER COMPONENT) ---

export default async function Home() {
  const productos = await getProductos();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main>
        <HeroBanner />
        
        {/* Catálogo de Productos */}
        <section className="container mx-auto px-4 lg:px-8 py-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Productos Destacados
            </h2>
            <a href="#" className="text-blue-600 hover:underline font-medium">
              Ver todos &rarr;
            </a>
          </div>

          {/* Manejo de Estados: Error, Vacío o Lista */}
          {productos === null ? (
            <div className="text-center py-10">
              <p className="text-red-500 font-semibold text-lg">Hubo un problema al cargar el catálogo. Por favor, intenta de nuevo más tarde.</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-semibold text-lg">Aún no hay productos disponibles en el catálogo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {productos.map((product: any) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  nombre={product.nombre}
                  // Dependiendo de si tu API devuelve 'categoria' directo o 'category.nombre'
                  categoria={product.categoria || product.category?.nombre} 
                  precio={product.precio}
                  imagen_url={product.imagen_url}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}