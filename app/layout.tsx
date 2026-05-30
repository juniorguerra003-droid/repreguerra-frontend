import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Repreguerra',
    default: 'Repreguerra – Tienda Oficial',
  },
  description: "Encuentra los mejores equipos y tecnología en la tienda oficial de Repreguerra. Garantía real y envíos a todo el Perú.",
  openGraph: {
    title: 'Repreguerra – Tienda Oficial',
    description: 'Equipos y tecnología con garantía real y envío a todo el Perú.',
    url: 'https://repreguerra.pe', // Replace with real domain when deployed
    siteName: 'Repreguerra',
    images: [
      {
        url: '/og-image.jpg', // Should be added to public/ later
        width: 1200,
        height: 630,
        alt: 'Repreguerra – Tienda Oficial',
      },
    ],
    locale: 'es_PE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
         * AuthProvider > CartProvider > Navbar + children.
         * Navbar se auto-oculta en rutas /admin vía usePathname().
         */}
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
