const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Sumit Verma\\.gemini\\antigravity-ide\\brain\\1c005512-a00f-4375-bb4e-cf0dc814f56b';
const destFrontend = 'C:\\Users\\Sumit Verma\\Desktop\\PMIS\\PMIS_frontend\\public\\uploads';
const destBackend = 'C:\\Users\\Sumit Verma\\Desktop\\PMIS\\PMIS_backend\\uploads';

const files = [
  { src: 'media__1791525481656.jpg', destName: 'project_img_1.jpg' },
  { src: 'media__1791525481713.jpg', destName: 'project_img_2.jpg' },
  { src: 'media__1791525481740.jpg', destName: 'project_img_3.jpg' }
];

files.forEach(item => {
  const srcPath = path.join(srcDir, item.src);
  const fPath = path.join(destFrontend, item.destName);
  const bPath = path.join(destBackend, item.destName);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, fPath);
    console.log('Copied to frontend:', fPath);
    fs.copyFileSync(srcPath, bPath);
    console.log('Copied to backend:', bPath);
  } else {
    console.error('Source file does not exist:', srcPath);
  }
});
