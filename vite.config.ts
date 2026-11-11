import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le préfixe de preview Arena est un hôte dynamique : on autorise tous les hôtes
// et on écoute sur 0.0.0.0 pour que le proxy puisse joindre le serveur.
export default defineConfig({
  // Chemins relatifs : fonctionne à la racine d'un domaine COMME sous /<repo>/
  // (GitHub Pages, sous-dossier, prévisualisation proxifiée).
  base: './',
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          content: ['./src/data/catalog.json', './src/data/quizzes.json', './src/data/cheatsheets.json'],
        },
      },
    },
  },
});
