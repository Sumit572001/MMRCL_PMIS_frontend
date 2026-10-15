import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Auto sync uploaded gallery images
try {
  const userHome = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Sumit Verma';
  const currentConvDir = path.join(userHome, '.gemini', 'antigravity-ide', 'brain', '1c005512-a00f-4375-bb4e-cf0dc814f56b');
  const galleryFiles = [
    { src: 'media__1791525481656.jpg', dest: 'project_img_1.jpg' },
    { src: 'media__1791525481713.jpg', dest: 'project_img_2.jpg' },
    { src: 'media__1791525481740.jpg', dest: 'project_img_3.jpg' },
    { src: 'media__1791525481762.jpg', dest: 'project_img_4.jpg' },
    { src: 'media__1791525481910.png', dest: 'project_img_5.png' },
    { src: 'media__1791530240435.jpg', dest: 'nyati_logo.png' }
  ];

  const destFrontend = path.resolve(__dirname, 'public', 'uploads');
  const destBackend = path.resolve(__dirname, '..', 'PMIS_backend', 'uploads');
  if (!fs.existsSync(destFrontend)) fs.mkdirSync(destFrontend, { recursive: true });
  if (!fs.existsSync(destBackend)) fs.mkdirSync(destBackend, { recursive: true });

  galleryFiles.forEach(item => {
    const srcPath = path.join(currentConvDir, item.src);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(destFrontend, item.dest));
      fs.copyFileSync(srcPath, path.join(destBackend, item.dest));
      console.log('[ViteSync] Synced image:', item.dest);
    }
  });
} catch (e) {
  console.log('[ViteSync] Notice:', e.message);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      }
    }
  }
})
