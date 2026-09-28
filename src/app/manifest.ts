import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI ასისტენტი',
    short_name: 'AIChat',
    description: 'ინტელექტუალური AI ჩატ-ასისტენტი',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0c14',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}