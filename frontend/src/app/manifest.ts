import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WorkCycle',
    short_name: 'WorkCycle',
    description: 'Planejamento diario, carteira de projetos e leitura semanal em um workspace unico.',
    start_url: '/hoje',
    display: 'standalone',
    background_color: '#08111f',
    theme_color: '#08111f',
    lang: 'pt-BR',
    orientation: 'portrait',
    icons: [
      {
        src: '/pwa/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/pwa/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/pwa/icon-maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/pwa/screenshot-shell.svg',
        sizes: '1280x720',
        type: 'image/svg+xml',
      },
    ],
  };
}