#!/usr/bin/env node
/**
 * Script to convert TTF font to base64 for pdfmake
 * Usage: node scripts/convert-font-to-base64.js path/to/font.ttf
 */

const fs = require('fs');
const path = require('path');

// Get font file path from command line
const fontPath = process.argv[2];

if (!fontPath) {
  console.error('❌ Error: Please provide a font file path');
  console.log('Usage: node scripts/convert-font-to-base64.js path/to/NotoSansArabic-Regular.ttf');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(fontPath)) {
  console.error(`❌ Error: File not found: ${fontPath}`);
  process.exit(1);
}

// Get font name from file
const fontFileName = path.basename(fontPath, '.ttf');

console.log(`📖 Reading font file: ${fontPath}`);

// Read font file
const fontBuffer = fs.readFileSync(fontPath);

// Convert to base64
console.log('🔄 Converting to base64...');
const base64Font = fontBuffer.toString('base64');

// Get file size
const sizeKB = (fontBuffer.length / 1024).toFixed(2);
const base64SizeKB = (base64Font.length / 1024).toFixed(2);

console.log(`📦 Original size: ${sizeKB} KB`);
console.log(`📦 Base64 size: ${base64SizeKB} KB`);

// Create TypeScript file
const tsContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated from: ${fontFileName}.ttf
// Original size: ${sizeKB} KB
// Base64 size: ${base64SizeKB} KB
// Generated at: ${new Date().toISOString()}

export const ${fontFileName.replace(/-/g, '')}Base64 = \`${base64Font}\`;
`;

// Output file path
const outputPath = path.join(__dirname, '../lib/fonts', `${fontFileName}.ts`);

// Write to file
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`✅ Success! Font saved to: ${outputPath}`);
console.log('');
console.log('📝 Next steps:');
console.log('1. Import the font in generatePDFArabic.ts');
console.log(`   import { ${fontFileName.replace(/-/g, '')}Base64 } from '@/lib/fonts/${fontFileName}';`);
console.log('');
console.log('2. Register the font:');
console.log('   pdfMake.fonts = {');
console.log('     NotoSansArabic: {');
console.log(`       normal: ${fontFileName.replace(/-/g, '')}Base64,`);
console.log('     },');
console.log('   };');
console.log('');
console.log('3. Use the font in defaultStyle:');
console.log("   font: 'NotoSansArabic'");
