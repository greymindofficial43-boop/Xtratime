import sharp from 'sharp';

async function testSvg() {
  const svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="780" height="580" fill="none" stroke="red" stroke-width="10"/>
  </svg>`;
  
  try {
    const base = sharp({
      create: { width: 800, height: 600, channels: 4, background: '#000000' }
    });
    
    // Some versions of sharp need explicit telling that it's SVG, though usually it sniffs it.
    const result = await base.composite([
      { input: Buffer.from(svg) }
    ]).png().toBuffer();
    
    console.log('SVG composite SUCCESS!', result.length, 'bytes');
  } catch (err) {
    console.error('SVG composite FAILED:', err);
  }
}

testSvg();
