import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = 'C:\\Users\\Sumit Verma\\.gemini\\antigravity-ide\\brain\\d918d6f0-235b-4815-9068-47ccd74b9959\\media__1786973200429.png';
const frontendPublic = path.join(__dirname, 'public', 'uploads');
const backendUploads = 'C:\\Users\\Sumit Verma\\Desktop\\PMIS\\PMIS_backend\\uploads';

if (!fs.existsSync(frontendPublic)) {
  fs.mkdirSync(frontendPublic, { recursive: true });
}
if (!fs.existsSync(backendUploads)) {
  fs.mkdirSync(backendUploads, { recursive: true });
}

fs.copyFileSync(src, path.join(frontendPublic, 'metro_bhawan.jpg'));
fs.copyFileSync(src, path.join(frontendPublic, 'metro_bhawan_building.png'));
fs.copyFileSync(src, path.join(backendUploads, 'metro_bhawan.jpg'));
fs.copyFileSync(src, path.join(backendUploads, 'metro_bhawan_building.png'));

console.log('Images copied to public/uploads and backend/uploads successfully!');
