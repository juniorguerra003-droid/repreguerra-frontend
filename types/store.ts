/**
 * Tipos compartidos del Front-Office de Repreguerra.
 * Derivados directamente del schema.prisma del backend.
 */

export interface Categoria {
  id: string;
  nombre: string;
  estado?: boolean;
}

/**
 * Forma exacta del objeto producto que devuelve GET /api/products.
 * Nota: Prisma serializa el campo Decimal como string en JSON.
 */
export interface Producto {
  id: string;
  categoryId: string;
  brandId?: string;
  nombre: string;
  sku: string;
  descripcion: string | null;
  precio: string;
  enOferta: boolean;
  precioOferta?: string | null;
  mostrarPrecio: boolean;
  stock: number;
  imagen_url: string | null;
  estado: boolean;
  category: {
    id: string;
    nombre: string;
  };
  brand?: {
    id: string;
    nombre: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
