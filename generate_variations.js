const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './resurse/imagini/produse';
const outputDir = './resurse/imagini/produse/variatii';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const variations = [
    { suffix: '1', transform: (s) => s.greyscale() },
    { suffix: '2', transform: (s) => s.tint({ r: 255, g: 0, b: 0 }) },
    { suffix: '3', transform: (s) => s.tint({ r: 0, g: 0, b: 255 }) },
    { suffix: '4', transform: (s) => s.tint({ r: 255, g: 255, b: 0 }) }
];

async function processImages() {
    const files = fs.readdirSync(inputDir);
    
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        if (fs.lstatSync(inputPath).isDirectory()) continue;
        
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
        
        const baseName = path.parse(file).name;
        
        for (const variant of variations) {
            const outputPath = path.join(outputDir, `${baseName}_${variant.suffix}.webp`);
            
            try {
                await variant.transform(sharp(inputPath))
                    .webp()
                    .toFile(outputPath);
                console.log(`Generated: ${outputPath}`);
            } catch (err) {
                console.error(`Error processing ${file} (${variant.suffix}):`, err.message);
            }
        }
    }
}

processImages().then(() => console.log('All variations generated with numeric suffixes!'));
