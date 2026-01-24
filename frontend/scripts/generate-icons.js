const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'logo.png');

async function generateIcons() {
  console.log('Starting icon generation...');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found at:', logoPath);
    process.exit(1);
  }

  // Get logo info
  const metadata = await sharp(logoPath).metadata();
  console.log(`Logo dimensions: ${metadata.width}x${metadata.height}`);

  // 1. Standard icons (192x192 and 512x512)
  console.log('Creating icon-192.png...');
  await sharp(logoPath)
    .resize(192, 192, {
      fit: 'contain',
      background: { r: 1, g: 49, b: 45, alpha: 1 } // #01312d
    })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  console.log('Creating icon-512.png...');
  await sharp(logoPath)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 1, g: 49, b: 45, alpha: 1 } // #01312d
    })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 2. Maskable icons (with padding - content in center 80%)
  // For maskable, we need 10% padding on each side (so content is 80%)
  const padding192 = Math.round(192 * 0.1); // 19px padding
  const innerSize192 = 192 - (padding192 * 2); // 154px content

  console.log('Creating icon-maskable-192.png...');
  const resized192 = await sharp(logoPath)
    .resize(innerSize192, innerSize192, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 1, g: 49, b: 45, alpha: 1 } // #01312d
    }
  })
    .composite([{
      input: resized192,
      top: padding192,
      left: padding192
    }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));

  const padding512 = Math.round(512 * 0.1); // 51px padding
  const innerSize512 = 512 - (padding512 * 2); // 410px content

  console.log('Creating icon-maskable-512.png...');
  const resized512 = await sharp(logoPath)
    .resize(innerSize512, innerSize512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 1, g: 49, b: 45, alpha: 1 } // #01312d
    }
  })
    .composite([{
      input: resized512,
      top: padding512,
      left: padding512
    }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // 3. Favicon (32x32)
  console.log('Creating favicon.ico...');
  await sharp(logoPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 1, g: 49, b: 45, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // For .ico we'll create a PNG and rename (most browsers support PNG favicons)
  // Or create multiple sizes for ICO
  await sharp(logoPath)
    .resize(48, 48, {
      fit: 'contain',
      background: { r: 1, g: 49, b: 45, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // 4. Apple Touch Icon (180x180)
  console.log('Creating apple-touch-icon.png...');
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 1, g: 49, b: 45, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('\n✅ All icons generated successfully!');
  console.log('Files created:');
  console.log('  - icon-192.png');
  console.log('  - icon-512.png');
  console.log('  - icon-maskable-192.png');
  console.log('  - icon-maskable-512.png');
  console.log('  - favicon.ico');
  console.log('  - favicon.png');
  console.log('  - apple-touch-icon.png');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
