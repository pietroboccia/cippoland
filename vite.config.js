import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/cippoland/', // Replace 'cippoland' with your repository name
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});