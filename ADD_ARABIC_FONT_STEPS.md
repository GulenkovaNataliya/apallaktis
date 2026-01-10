# Шаги по добавлению Noto Sans Arabic шрифта

**Цель**: Добавить профессиональный арабский шрифт с поддержкой лигатур для идеального отображения PDF.

**Время**: 10-15 минут

---

## Шаг 1: Скачать Noto Sans Arabic

### Вариант А: Google Fonts (Рекомендуется)

1. Открой: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic
2. Нажми кнопку **"Download family"** (справа вверху)
3. Распакуй ZIP файл
4. Найди файл: `NotoSansArabic-Regular.ttf` (в папке `static/`)

### Вариант Б: GitHub

1. Открой: https://github.com/notofonts/arabic/tree/main/fonts/ttf
2. Скачай файл: `NotoSansArabic-Regular.ttf`
3. Клик правой кнопкой → "Save link as..."

### Вариант В: Прямая ссылка

```bash
# Скачать через curl (если установлен)
curl -L "https://github.com/notofonts/arabic/raw/main/fonts/ttf/NotoSansArabic-Regular.ttf" -o NotoSansArabic-Regular.ttf
```

---

## Шаг 2: Положить файл в проект

Скопируй файл `NotoSansArabic-Regular.ttf` в:
```
frontend/lib/fonts/NotoSansArabic-Regular.ttf
```

Или положи временно в корень проекта.

---

## Шаг 3: Конвертировать в base64

### Запустить скрипт конвертации:

```bash
cd frontend

# Если шрифт в frontend/lib/fonts/
node scripts/convert-font-to-base64.js lib/fonts/NotoSansArabic-Regular.ttf

# Если шрифт в корне проекта
node scripts/convert-font-to-base64.js ../NotoSansArabic-Regular.ttf

# Если шрифт в Downloads
node scripts/convert-font-to-base64.js "C:\Users\Natalia\Downloads\NotoSansArabic-Regular.ttf"
```

**Результат**: Будет создан файл `frontend/lib/fonts/NotoSansArabic-Regular.ts`

---

## Шаг 4: Обновить generatePDFArabic.ts

Файл будет автоматически обновлен после конвертации.

Если нужно сделать вручную:

```typescript
// В начале файла
import { NotoSansArabicRegularBase64 } from '@/lib/fonts/NotoSansArabic-Regular';

// После импортов, перед использованием pdfMake
pdfMake.fonts = {
  Roboto: {
    normal: pdfFonts.pdfMake.vfs['Roboto-Regular.ttf'],
    bold: pdfFonts.pdfMake.vfs['Roboto-Medium.ttf'],
  },
  NotoSansArabic: {
    normal: NotoSansArabicRegularBase64,
    bold: NotoSansArabicRegularBase64, // Используем Regular для Bold тоже
  },
};

// В defaultStyle изменить:
defaultStyle: {
  font: 'NotoSansArabic', // ← Вместо 'Roboto'
  fontSize: 10,
  alignment: 'right',
}
```

---

## Шаг 5: Протестировать

```bash
npm run dev
```

1. Открой браузер: http://localhost:3000/ar
2. Создай тестовый объект с арабским названием: "مشروع تجريبي"
3. Добавь расход с описанием: "اختبار الخط العربي"
4. Перейди в экспорт: `/ar/dashboard/export`
5. Экспортируй PDF
6. Открой PDF и проверь:
   - ✅ Буквы соединяются правильно (лигатуры)
   - ✅ Текст красиво выглядит
   - ✅ Профессиональная каллиграфия

---

## Автоматическое решение (если скрипт не работает)

### Online конвертация:

1. Зайди на: https://www.giftofspeed.com/base64-encoder/
2. Загрузи `NotoSansArabic-Regular.ttf`
3. Скачай результат (будет текстовый файл)
4. Скопируй содержимое
5. Создай файл вручную:

```typescript
// frontend/lib/fonts/NotoSansArabic-Regular.ts
export const NotoSansArabicRegularBase64 = `
[ВСТАВИТЬ СЮДА BASE64 СТРОКУ]
`;
```

---

## Проверка результата

### ДО (без шрифта):
```
ا ل خ ط    ا ل ع ر ب ي
(буквы отдельно)
```

### ПОСЛЕ (с Noto Sans Arabic):
```
الخط العربي
(буквы соединены, красивая каллиграфия)
```

---

## Размер файла

**Ожидаемый размер**: ~150-200 KB
- Не влияет на основное приложение (lazy loading)
- Загружается только при экспорте арабского PDF
- Code splitting работает автоматически

---

## Альтернативные шрифты (если Noto Sans не нравится)

### 1. Cairo (самый легкий)
- Размер: ~80 KB
- Стиль: Современный, rounded
- Скачать: https://fonts.google.com/specimen/Cairo

### 2. Amiri (классический)
- Размер: ~200 KB
- Стиль: Традиционный, serif
- Скачать: https://fonts.google.com/specimen/Amiri

### 3. Tajawal (простой)
- Размер: ~100 KB
- Стиль: Clean, sans-serif
- Скачать: https://fonts.google.com/specimen/Tajawal

**Рекомендация**: Noto Sans Arabic - лучший баланс качества и размера

---

## Troubleshooting

### Ошибка: "Cannot find module"
```bash
# Убедись что скрипт исполняемый
chmod +x frontend/scripts/convert-font-to-base64.js

# Запусти через node явно
node frontend/scripts/convert-font-to-base64.js path/to/font.ttf
```

### Ошибка: "File not found"
```bash
# Проверь путь к шрифту
ls -la lib/fonts/NotoSansArabic-Regular.ttf

# Используй абсолютный путь
node scripts/convert-font-to-base64.js "$(pwd)/lib/fonts/NotoSansArabic-Regular.ttf"
```

### PDF не генерируется
```bash
# Проверь импорт в generatePDFArabic.ts
# Проверь регистрацию шрифта
# Проверь что defaultStyle использует 'NotoSansArabic'
```

---

## Финальная проверка

После всех шагов:

```bash
# 1. Проверь что файл создан
ls -la frontend/lib/fonts/NotoSansArabic-Regular.ts

# 2. Проверь размер (должен быть ~150-200 KB)
du -h frontend/lib/fonts/NotoSansArabic-Regular.ts

# 3. Запусти dev сервер
npm run dev

# 4. Тестируй экспорт на арабском
```

---

**Готово! Теперь арабский PDF будет выглядеть идеально! ✨**

**Время выполнения**: 10-15 минут
**Сложность**: Легко
**Результат**: Профессиональная каллиграфия
