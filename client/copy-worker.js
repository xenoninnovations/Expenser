const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs');
const destPath = path.join(__dirname, 'public', 'pdf.worker.min.js');

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

// Copy the file
try {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Successfully copied PDF.js worker to public directory');
} catch (error) {
    console.error('Error copying PDF.js worker:', error);
    process.exit(1);
} 