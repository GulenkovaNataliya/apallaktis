const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Путь к исходному логотипу
const sourceImage = path.join(__dirname, '..', '..', 'Apallaktis.photos', 'A.png');
const publicDir = path.join(__dirname, '..', 'public');

// Проверка что исходный файл существует
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Файл A.png не найден:', sourceImage);
  process.exit(1);
}

console.log('🎨 Генерация PWA иконок...');
console.log('📁 Исходный файл:', sourceImage);

// Размеры для PWA иконок
const sizes = [
  { size: 192, name: 'icon-192.png', type: 'standard' },
  { size: 512, name: 'icon-512.png', type: 'standard' },
  { size: 192, name: 'icon-maskable-192.png', type: 'maskable' },
  { size: 512, name: 'icon-maskable-512.png', type: 'maskable' },
];

// Генерация иконок
async function generateIcons() {
  for (const { size, name, type } of sizes) {
    const outputPath = path.join(publicDir, name);

    try {
      if (type === 'maskable') {
        // Для maskable иконок добавляем padding (безопасная зона)
        // Apple и Android требуют 10-20% padding для maskable иконок
        const padding = Math.floor(size * 0.15); // 15% padding
        const contentSize = size - (padding * 2);

        await sharp(sourceImage)
          .resize(contentSize, contentSize, {
            fit: 'contain',
            background: { r: 255, g: 143, b: 10, alpha: 1 } // #ff8f0a - оранжевый цвет
          })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 255, g: 143, b: 10, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
      } else {
        // Стандартные иконки
        await sharp(sourceImage)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 143, b: 10, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✅ Создан: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Ошибка при создании ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Все иконки созданы!');
  console.log('📁 Иконки сохранены в:', publicDir);
  console.log('\n📋 Следующий шаг: проверить manifest.json');
}

generateIcons().catch(console.error);
