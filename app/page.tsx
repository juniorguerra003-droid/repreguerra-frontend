"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url?: string;
  category?: {
    id: string;
    nombre: string;
  };
}

interface Categoria {
  id: string;
  nombre: string;
}

// Nueva interfaz para los elementos dentro del carrito
interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function CatalogoPublico() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
  const [cargando, setCargando] = useState(true);

  // ESTADOS PARA EL CARRITO
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch("http://localhost:3000/api/products"),
          fetch("http://localhost:3000/api/categories")
        ]);

        const dataProd = await resProd.json();
        const dataCat = await resCat.json();

        if (dataProd.success) setProductos(dataProd.data);
        if (dataCat.success) setCategorias(dataCat.data);
      } catch (error) {
        console.error("Error cargando catálogo");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // --- LOGICA RESTRICCIVA DEL CARRITO ---

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prevCarrito => {
      const existe = prevCarrito.find(item => item.id === producto.id);

      if (existe) {
        // BLINDAJE: Si la cantidad actual ya es igual o mayor al stock, no hace nada
        if (existe.cantidad >= producto.stock) {
          alert(`🚨 Límite alcanzado: Solo contamos con ${producto.stock} unidades de este producto.`);
          return prevCarrito;
        }
        return prevCarrito.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Si es el primero que agrega, entra con cantidad 1
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });

    // 🔥 LA MAGIA NUEVA: Abre la pestaña lateral inmediatamente al agregar
    setMostrarCarrito(true);
  };
  const cambiarCantidad = (id: string, cambio: number) => {
    setCarrito(prevCarrito => {
      return prevCarrito.map(item => {
        if (item.id === id) {
          const nuevaCantidad = item.cantidad + cambio;

          // BLINDAJE: Bloquear si supera el stock real
          if (nuevaCantidad > item.stock) {
            alert(`🚨 Control de Stock: Solo hay ${item.stock} unidades disponibles.`);
            return item;
          }
          // Impedir cantidades menores a 1
          if (nuevaCantidad < 1) return item;

          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      });
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prevCarrito => prevCarrito.filter(item => item.id !== id));
  };

  const procesarPedido = async () => {
    // 1. Pedimos la dirección validando que cumpla la regla de Zod (min 5 caracteres)
    const direccion = window.prompt("📍 Ingresa tu dirección de envío exacta:");
    if (!direccion || direccion.length < 5) {
      return alert("🚨 Por favor ingresa una dirección válida (mínimo 5 caracteres).");
    }

    // 2. Armamos el paquete EXACTAMENTE como lo exige el schema.ts
    const payload = {
      items: carrito.map(item => ({
        productId: item.id,
        cantidad: item.cantidad
      })),
      direccion_envio: direccion,
      metodo_pago: "YAPE" // Por ahora mandamos YAPE por defecto para cumplir con Zod
    };

    try {
      // 3. Enviamos la petición a la ruta pública que habilitamos
      const res = await fetch("http://localhost:3000/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ ¡Pedido creado con éxito! El stock ha sido descontado.");
        setCarrito([]); // Vaciamos el carrito
        setMostrarCarrito(false); // Cerramos el panel
        window.location.reload(); // Recargamos la página para que el cliente vea el nuevo stock real
      } else {
        alert("🚨 Error del servidor: " + (data.message || "Verifica los datos"));
      }
    } catch (error) {
      alert("Error de conexión al procesar el pedido.");
    }
  };

  // Cálculos rápidos para la interfaz
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const precioTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const productosVisibles = productos.filter(p => {
    const tieneStock = p.stock > 0;
    const coincideCategoria = categoriaActiva === "todas" || p.category?.id === categoriaActiva;
    return tieneStock && coincideCategoria;
  });

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-gray-500 animate-pulse">Cargando vitrina...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden">

      {/* HEADER PÚBLICO */}
      <header className="bg-gray-900 text-white py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-widest uppercase">Repreguerra</h1>

          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition">
              Acceso Admin
            </Link>

            {/* BOTÓN DEL CARRITO EN EL HEADER */}
            <button
              onClick={() => setMostrarCarrito(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition relative shadow-md"
            >
              🛒 Carrito
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-extrabold animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Catálogo de Productos</h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">Encuentra equipos y tecnología con stock real y garantía del mercado.</p>
        </div>

        {/* BOTONES DE FILTRO */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setCategoriaActiva("todas")}
            className={`px-6 py-2 rounded-full font-bold transition shadow-sm text-sm ${categoriaActiva === "todas" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
          >
            Todas
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoriaActiva(c.id)}
              className={`px-6 py-2 rounded-full font-bold transition shadow-sm text-sm ${categoriaActiva === c.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productosVisibles.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col group">
              <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4 border-b border-gray-50">
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.nombre} className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-gray-300 font-bold text-sm">Sin Imagen</span>
                )}
                <div className="absolute top-3 right-3 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase">
                  {p.category?.nombre || "Varios"}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{p.nombre}</h3>
                {/* Pequeño aviso de stock en la tarjeta */}
                <p className="text-xs font-semibold text-gray-400 mb-4">Disponibles: {p.stock} uds.</p>

                <div className="mt-auto pt-2 flex flex-col gap-4">
                  <p className="text-blue-600 font-extrabold text-xl">
                    S/ {p.precio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => agregarAlCarrito(p)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm text-sm text-center"
                  >
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- INTERFAZ DEL CARRITO LATERAL ESTILO FLOTANTE --- */}
      {mostrarCarrito && (
        // Fondo con Desenfoque (Blur) y color muy suave para no apagar la página
        <div className="fixed inset-0 z-50 flex justify-end p-4 md:p-6 transition-opacity backdrop-blur-sm bg-black/10">

          {/* Fondo invisible cerrable para clicks afuera */}
          <div className="absolute inset-0" onClick={() => setMostrarCarrito(false)}></div>

          {/* Panel Flotante y Súper Redondeado */}
          <div className="bg-white w-full max-w-md h-[calc(100dvh-2rem)] md:h-[calc(100dvh-3rem)] relative z-10 shadow-2xl flex flex-col text-black rounded-[30px] border border-gray-100 overflow-hidden animate-fade-in-right">

            {/* Encabezado del Carrito (Súper Redondeado arriba) */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-950 text-white rounded-t-[30px]">
              <h2 className="text-xl font-extrabold tracking-wide">Tu Pedido</h2>
              <button
                onClick={() => setMostrarCarrito(false)}
                className="text-gray-400 hover:text-white font-bold text-xs bg-gray-800 p-2.5 rounded-full w-9 h-9 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Cuerpo con elementos */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {carrito.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium">
                  <p className="text-5xl mb-5">🛒</p>
                  <p>Tu carrito está completamente vacío.</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-5 items-center">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} className="w-16 h-16 object-contain border border-gray-100 rounded-2xl p-1 bg-white shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl border border-gray-100"></div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.nombre}</h4>
                      <p className="text-blue-600 font-extrabold text-sm mt-1">S/ {item.precio}</p>

                      {/* Controles de Cantidad Redondeados */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() => cambiarCantidad(item.id, -1)}
                          className="w-8 h-8 bg-gray-100 rounded-full font-bold hover:bg-gray-200 transition text-base flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm w-7 text-center">{item.cantidad}</span>
                        <button
                          onClick={() => cambiarCantidad(item.id, 1)}
                          disabled={item.cantidad >= item.stock}
                          className={`w-8 h-8 rounded-full font-bold text-base transition flex items-center justify-center ${item.cantidad >= item.stock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                          +
                        </button>
                        {item.cantidad >= item.stock && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-1">Límite</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="text-gray-300 hover:text-red-500 font-bold p-2 transition rounded-full hover:bg-red-50"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Pie del Carrito (Súper Redondeado abajo) */}
            {carrito.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[30px] mt-auto">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-semibold">Total estimado:</span>
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    S/ {precioTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={procesarPedido}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-full shadow-lg transition text-center uppercase tracking-widest text-sm transform hover:scale-[1.02]"
                >
                  Procesar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}