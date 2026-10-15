import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `title={\`\${doc.originalName || ''}\${doc.fileSize ? \` (\${(doc.fileSize / 1024).toFixed(1)} KB)\` : ''}\`}>{doc.originalName}{doc.fileSize ? \` • \${(doc.fileSize / 1024).toFixed(1)} KB\` : ''}</span>`;

const replacementStr = targetStr + `\n                                           {[\'RFI\', \'RFI Register\'].includes(activeSection) && (\n                                             <div className="mt-1">\n                                               {getStructureBadge(doc.category)}\n                                             </div>\n                                           )}`;

if (content.includes('getStructureBadge(doc.category)')) {
  console.log('Already added structure badge!');
} else {
  const index = content.indexOf('title={`${doc.originalName');
  if (index !== -1) {
    const endLineIndex = content.indexOf('</span>', index);
    if (endLineIndex !== -1) {
      const insertPos = endLineIndex + '</span>'.length;
      content = content.slice(0, insertPos) + '\n                                           {[\'RFI\', \'RFI Register\'].includes(activeSection) && (\n                                             <div className="mt-1">\n                                               {getStructureBadge(doc.category)}\n                                             </div>\n                                           )}' + content.slice(insertPos);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully added structure badge to App.jsx!');
    } else {
      console.error('Could not find </span>');
    }
  } else {
    console.error('Could not find title={doc.originalName');
  }
}
