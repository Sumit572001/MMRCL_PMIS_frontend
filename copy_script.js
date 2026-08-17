const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\Sumit Verma\\.gemini\\antigravity-ide\\brain\\d918d6f0-235b-4815-9068-47ccd74b9959\\media__1786973200429.png';
const backendUploads = 'C:\\Users\\Sumit Verma\\Desktop\\PMIS\\PMIS_backend\\uploads';
const frontendPublic = 'C:\\Users\\Sumit Verma\\Desktop\\PMIS\\PMIS_frontend\\public\\uploads';

if (!fs.existsSync(frontendPublic)) {
  fs.mkdirSync(frontendPublic, { recursive: true });
}

fs.copyFileSync(src, path.join(backendUploads, 'metro_bhawan.jpg'));
fs.copyFileSync(src, path.join(backendUploads, 'metro_bhawan_building.png'));
fs.copyFileSync(src, path.join(frontendPublic, 'metro_bhawan.jpg'));
fs.copyFileSync(src, path.join(frontendPublic, 'metro_bhawan_building.png'));

console.log('Building images updated successfully!');
