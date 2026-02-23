const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, '../public/icons');

// Create a simple icon with text "SL" on green background
async function generateIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#15803d"/>
          <stop offset="100%" style="stop-color:#166534"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGrad)"/>
      <text x="${size/2}" y="${size * 0.55}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">SL</text>
      <text x="${size/2}" y="${size * 0.78}" text-anchor="middle" fill="#FBBF24" font-family="Arial, sans-serif" font-size="${size * 0.14}" font-weight="bold">FOODS</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(iconDir, `icon-${size}.png`));

  console.log(`Generated icon-${size}.png`);
}

async function main() {
  // Ensure icons directory exists
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  for (const size of sizes) {
    await generateIcon(size);
  }

  console.log('All icons generated!');
}

main().catch(console.error);
