import sharp from 'sharp';
import fs from 'fs';

async function test() {
  const w = 800;
  const h = 600;
  
  const pad = 20;
  const W = w + pad * 2;
  const H = h + pad * 2;

  // Create a dummy image
  let img = sharp({
    create: { width: w, height: h, channels: 4, background: '#333333' }
  });

  // 1. Extend with dark base
  let bordered = await img.extend({
    top: pad, bottom: pad, left: pad, right: pad,
    background: '#0a0a0a'
  }).toBuffer();

  // 2. Create SVG overlay
  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff4d00;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ffb700;stop-opacity:1" />
      </linearGradient>
    </defs>
    <!-- Outer gradient border -->
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" fill="none" stroke="url(#grad)" stroke-width="4" />
    
    <!-- Inner white stroke bordering the actual image -->
    <rect x="${pad}" y="${pad}" width="${w}" height="${h}" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.5" />
    
    <!-- Viewfinder / Tech corners -->
    <path d="M 0 40 L 0 0 L 40 0" fill="none" stroke="#ffffff" stroke-width="6" />
    <path d="M ${W - 40} 0 L ${W} 0 L ${W} 40" fill="none" stroke="#ffffff" stroke-width="6" />
    <path d="M 0 ${H - 40} L 0 ${H} L 40 ${H}" fill="none" stroke="#ffffff" stroke-width="6" />
    <path d="M ${W - 40} ${H} L ${W} ${H} L ${W} ${H - 40}" fill="none" stroke="#ffffff" stroke-width="6" />
  </svg>
  `;

  bordered = await sharp(bordered)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();

  fs.writeFileSync('test-output.png', bordered);
  console.log('Done!');
}

test().catch(console.error);
