import sharp from 'sharp';
import { promises as fs } from 'fs';

function generateCyberpunkSVG(w: number, h: number): string {
  const S = Math.max(w, 1280) / 1920;
  const b = 24 * S; 
  const pad = 12 * S + b / 2; 
  const L = pad;
  const R = w - pad;
  const T = pad;
  const B = h - pad;
  const cs = 80 * S; 

  const bottomBar = `
    <defs>
      <linearGradient id="bottomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#69D23F" />
        <stop offset="100%" stop-color="#F12B2B" />
      </linearGradient>
    </defs>
    <path d="M ${L + cs * 2} ${B} L ${R - cs * 2.5} ${B}" fill="none" stroke="url(#bottomGrad)" stroke-width="${b * 0.4}" />
  `;

  const createStripes = (x: number, y: number, color: string, dx: number, dy: number, count: number = 3) => {
    let stripes = '';
    const gap = 14 * S;
    const thick = 6 * S;
    for (let i = 0; i < count; i++) {
      const sx = x + i * gap;
      stripes += `<path d="M ${sx} ${y} L ${sx + dx} ${y + dy}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round" />`;
    }
    return stripes;
  };

  return `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${L+cs} ${T} L ${R-cs} ${T} L ${R} ${T+cs} L ${R} ${B-cs} L ${R-cs} ${B} L ${L+cs} ${B} L ${L} ${B-cs} L ${L} ${T+cs} Z" fill="#000000" fill-rule="evenodd" />
      ${bottomBar}
      <path d="M ${L} ${T + cs * 1.7} L ${L} ${B - cs * 1.7}" stroke="rgba(255,255,255,0.3)" stroke-width="${b * 0.15}" />
      <path d="M ${R} ${T + cs * 1.7} L ${R} ${B - cs * 2.2}" stroke="rgba(255,255,255,0.3)" stroke-width="${b * 0.15}" />
      <path d="M ${L + cs * 1.7} ${T} L ${w / 2} ${T}" stroke="#69D23F" stroke-width="${b * 0.4}" />
      <path d="M ${w / 2} ${T} L ${R - cs * 1.7} ${T}" stroke="#F12B2B" stroke-width="${b * 0.4}" />
      <path d="M ${L + cs * 1.5} ${T} L ${L + cs} ${T} L ${L} ${T + cs} L ${L} ${T + cs * 1.5}" fill="none" stroke="#69D23F" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${R - cs * 1.5} ${T} L ${R - cs} ${T} L ${R} ${T + cs} L ${R} ${T + cs * 1.5}" fill="none" stroke="#F12B2B" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${L} ${B - cs * 1.5} L ${L} ${B - cs} L ${L + cs} ${B} L ${L + cs * 1.5} ${B}" fill="none" stroke="#69D23F" stroke-width="${b}" stroke-linecap="square" stroke-linejoin="miter" />
      <path d="M ${R} ${B - cs * 2} L ${R} ${B - cs} L ${R - cs} ${B} L ${R - cs * 2} ${B}" fill="none" stroke="#F12B2B" stroke-width="${b * 1.3}" stroke-linecap="square" stroke-linejoin="miter" />
      ${createStripes(L + cs * 1.8, T + 20 * S, '#69D23F', 15 * S, -30 * S)}
      ${createStripes(L + cs * 1.8, B - 10 * S, '#69D23F', 15 * S, -30 * S)}
      ${createStripes(R - cs * 3.5, B - 10 * S, '#F12B2B', 15 * S, -30 * S)}
    </svg>
  `;
}

async function testAspectRatios() {
  const sizes = [
    { w: 1920, h: 1080, name: 'landscape' },
    { w: 1080, h: 1920, name: 'portrait' },
    { w: 1080, h: 1080, name: 'square' },
    { w: 2000, h: 500, name: 'wide' }
  ];

  for (const size of sizes) {
    const svgStr = generateCyberpunkSVG(size.w, size.h);
    const base = sharp({
      create: { width: size.w, height: size.h, channels: 4, background: '#888888' }
    });
    const result = await base.composite([
      { input: Buffer.from(svgStr), top: 0, left: 0 }
    ]).webp().toBuffer();
    
    await fs.writeFile(`test-${size.name}.webp`, result);
    console.log(`Generated test-${size.name}.webp`);
  }
}

testAspectRatios();
