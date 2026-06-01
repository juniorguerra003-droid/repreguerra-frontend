import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/constants';

// Configuración de metadatos del ícono
export const size = { width: 256, height: 256 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%', // Aquí ocurre la magia del círculo perfecto
          overflow: 'hidden',
          backgroundColor: 'transparent',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://graph.facebook.com/repreguerra.pe/picture?type=large"
          alt={siteConfig.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
