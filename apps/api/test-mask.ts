import sharp from 'sharp';

async function testSvg() {
  const w = 800;
  const h = 600;
  const S = Math.max(w, 1280) / 1920;
  const b = 24 * S; 
  const pad = 12 * S + b / 2; 
  const L = pad;
  const R = w - pad;
  const T = pad;
  const B = h - pad;
  const cs = 80 * S; 

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z M ${L+cs} ${T} L ${R-cs} ${T} L ${R} ${T+cs} L ${R} ${B-cs} L ${R-cs} ${B} L ${L+cs} ${B} L ${L} ${B-cs} L ${L} ${T+cs} Z" fill="#000000" fill-rule="evenodd" />
    <path d="M ${L+cs} ${T} L ${R-cs} ${T} L ${R} ${T+cs} L ${R} ${B-cs} L ${R-cs} ${B} L ${L+cs} ${B} L ${L} ${B-cs} L ${L} ${T+cs} Z" fill="none" stroke="red" stroke-width="${b}" />
  </svg>`;
  
  try {
    const base = sharp({
      create: { width: w, height: h, channels: 4, background: '#ffffff' }
    });
    
    const result = await base.composite([
      { input: Buffer.from(svg) }
    ]).png().toBuffer();
    
    require('fs').writeFileSync('test-mask.png', result);
    console.log('SVG composite SUCCESS! Check test-mask.png');
  } catch (err) {
    console.error('SVG composite FAILED:', err);
  }
}

testSvg();
