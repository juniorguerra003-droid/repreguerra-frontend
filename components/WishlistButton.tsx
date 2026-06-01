'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only check if logged in
    if (!token) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            const favorites = json.data;
            const found = favorites.some((item: any) => item.productId === productId);
            setIsFavorite(found);
          }
        }
      } catch (e) {
        console.error("Error fetching wishlist", e);
      }
    };
    checkFavorite();
  }, [productId, token]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
        if (res.ok) {
          setIsFavorite(true);
        }
      }
    } catch (e) {
      console.error("Error toggling favorite", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110 active:scale-95"
    >
      <Heart
        size={18}
        className={`transition-colors ${
          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
        } ${isLoading ? 'animate-pulse' : ''} ${isFavorite && !isLoading ? 'animate-[pulse_1s_ease-in-out]' : ''}`}
      />
    </button>
  );
}
