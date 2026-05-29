/**
 * Tipos compartidos del Front-Office de Repreguerra.
 * Derivados directamente del schema.prisma del backend.
 */

export interface Categoria {
  id: string;
  nombre: string;
}

/**
 * Forma exacta del objeto producto que devuelve GET /api/products.
 * Nota: Prisma serializa el campo Decimal como string en JSON.
 */
export interface Producto {
  id: string;
  nombre: string;
  sku: string;
  descripcion: string | null;
  /** Prisma Decimal → llega como string, parsear con parseFloat() */
  precio: string;
  stock: number;
  imagen_url: string | null;
  estado: boolean;
  categoryId: string;
  category: Categoria;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
