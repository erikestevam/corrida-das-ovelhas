import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'O Bom Pastor: Corrida das Ovelhinhas',
        short_name: 'Bom Pastor',
        description: 'Jogo educativo cristão de corrida e contagem de ovelhas para crianças',
        theme_color: '#4ade80',
        background_color: '#87ceeb',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
});
