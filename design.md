# ДИЗАЙН-СИСТЕМА APALLAKTIS

## 1. ПРАВИЛА ПО ВИДЕО

### Видеофайлы
- `/public/video/video.mp4` — страница выбора языка
- `/public/video/video1.mp4` — страница входа/регистрации, thank-you

### Правила использования
- **Position**: `fixed` (fullscreen фон)
- **Атрибуты**: `loop`, `muted`, `autoplay`, `playsInline`
- **Poster**: обязательно для медленного интернета
- **UI**: рендерится мгновенно, не ждёт загрузки видео
- **Приоритет**: видео грузится async

### Страницы с видео
| Страница | Видео |
|----------|-------|
| `/language-select` | video.mp4 |
| `/[locale]` (главная) | video1.mp4 |
| `/[locale]/thank-you` | video1.mp4 |

---

## 2. ПРАВИЛА ПО ФОТО (ФОНОВЫЕ ИЗОБРАЖЕНИЯ)

### Файлы фонов
```
/public/pages/
├── page-01.webp ... page-08.webp  (циклические фоны)
├── page-pay.webp                   (страница оплат)
└── page-objekt.webp                (страница объектов)
```

### Циклический fallback
```typescript
function getBackgroundPage(index: number): string {
  const pageNum = ((index - 1) % 8) + 1;
  return `/pages/page-${String(pageNum).padStart(2, '0')}.webp`;
}
```
После page-08 начинается с page-01.

### Специальные фоны
| Страница | Фон |
|----------|-----|
| page-pay | page-pay.webp |
| objects | page-objekt.webp |
| Все остальные | page-01...page-08 (цикл) |

### Формат изображений
- **Формат**: WebP (оптимизированный)
- **Использование**: через компонент `BackgroundPage`

---

## 3. ЦВЕТОВАЯ ГАММА

### Основная палитра (10 цветов)
```css
:root {
  --blue-whale: #033a45;      /* Тёмный сине-зелёный */
  --polar: #daf3f6;           /* Светло-голубой */
  --deep-teal: #01312d;       /* Глубокий тёмно-зелёный */
  --zanah: #e2f1dd;           /* Светло-зелёный */
  --tuft-bush: #ffd8c3;       /* Персиковый */
  --serenade: #ffebe1;        /* Светло-персиковый */
  --skeptic: #c3e2dc;         /* Серо-зелёный */
  --aqua-squeeze: #e7f4f1;    /* Очень светлый зелёный */
  --orange: #ff6a1a;          /* Оранжевый (акцент) */
  --slogan-color: #ff8f0a;    /* Оранжевый для слогана */
}
```

### SCSS переменные
```scss
$blue-whale: #033a45;
$polar: #daf3f6;
$deep-teal: #01312d;
$zanah: #e2f1dd;
$tuft-bush: #ffd8c3;
$serenade: #ffebe1;
$skeptic: #c3e2dc;
$aqua-squeeze: #e7f4f1;
$orange: #ff6a1a;
$slogan-color: #ff8f0a;
```

### Применение цветов
| Элемент | Фон | Текст/Тень |
|---------|-----|------------|
| Кнопки языков | `--polar` (#daf3f6) | `--deep-teal` (#01312d) |
| Кнопки входа | `--polar` (#daf3f6) | `--deep-teal` (#01312d) |
| Способы оплаты | `--tuft-bush` (#ffd8c3) | `--deep-teal` (#01312d) |
| Общие расходы | `--serenade` (#ffebe1) | `--deep-teal` (#01312d) |
| Объекты | градиент `--aqua-squeeze` → `--skeptic` | `--blue-whale` (#033a45) |
| Слоган | — | `--slogan-color` (#ff8f0a) |
| Оранжевые акценты | — | `--orange` (#ff6a1a) |

### Градиент объектов
```typescript
function getObjectColor(index: number, total: number): string {
  const start = { r: 231, g: 244, b: 241 }; // #e7f4f1 (aqua-squeeze)
  const end = { r: 195, g: 226, b: 220 };   // #c3e2dc (skeptic)
  const ratio = total > 1 ? index / (total - 1) : 0;
  // Интерполяция между start и end
}
```

### ВАЖНО
- **НЕ добавлять новые цвета** — только из этой палитры
- **Правило теней**: `shadow-color == text-color` всегда

---

## 4. РАЗМЕРЫ И ОТСТУПЫ

### Кнопки

#### Высота кнопок
| Тип | Высота |
|-----|--------|
| Все основные кнопки | `52px` (minHeight) |
| Кнопки языков | `52px` |
| Кнопки входа/регистрации | `52px` |
| Юридические кнопки | `52px` |

#### Ширина кнопок
| Тип | Ширина |
|-----|--------|
| Кнопки-заголовки | `w-full` (100%) |
| Одиночная кнопка | `70%` (центрирована) |
| AFM кнопка | `60%` |

### Border-radius
- **Стандарт**: `1rem` (16px) = Tailwind `rounded-2xl`
- Применяется ко всем кнопкам и инпутам

### Отступы (padding)

#### Контейнеры страниц
```css
paddingLeft: '40px';
paddingRight: '40px';
paddingTop: '180px';  /* Для страниц с кнопками */
```

#### Поля ввода
```css
paddingLeft: '40px';
paddingRight: '40px';
```

### Gap между элементами
| Элемент | Gap |
|---------|-----|
| Кнопки-заголовки | `48px` (gap-12) |
| Кнопки языков | `12px` (gap-3) |
| Стандартные элементы | `8px`, `12px`, `16px`, `24px` |

### Специальные отступы
| Страница | paddingBottom |
|----------|---------------|
| Юридические страницы | `120px` |
| Обычные страницы | `80px` |

---

## 5. ТИПОГРАФИКА

### CSS классы
```css
.text-slogan {
  font-size: 22px;
  font-weight: 500;
  line-height: 1.2;
}

.text-button {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.text-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

.text-link {
  font-size: 13px;
  font-weight: 400;
  line-height: 1.5;
}

.text-heading {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.text-subheading {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.text-small {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}
```

### Шрифты
- **Основной**: Noto Sans
- **Арабский**: Noto Sans Arabic (автоматически для RTL)

---

## 6. СИСТЕМА ТЕНЕЙ

### CSS переменные
```css
:root {
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px var(--deep-teal);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
  --shadow-pressed: 0 2px 4px var(--deep-teal);
}
```

### Правило теней для кнопок
```
shadow-color == text-color
```

**Примеры:**
- Текст `--deep-teal` → Тень `0 4px 8px var(--deep-teal)`
- Текст `--blue-whale` → Тень `0 4px 8px var(--blue-whale)`

### Состояния кнопок
- **Default**: `box-shadow: 0 4px 8px [color]`
- **Active/Pressed**: `box-shadow: 0 2px 4px [color]` + `transform: scale(0.95)`

---

## 7. MOBILE-FIRST ПОДХОД

### Viewport
- **Целевой размер**: 360-414px
- **Max-width на desktop**: 500px (с рамкой телефона)

### Desktop preview
```css
.mobile-preview-wrapper {
  max-width: 500px;
  height: 90vh;
  margin-top: 5vh;
  border-radius: 40px;
  border: 12px solid #1a1a1a;
  box-shadow: 0 0 0 2px #333, 0 20px 50px rgba(0, 0, 0, 0.5);
}
```

### Safe area (iOS)
```css
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}
```

---

## 8. RTL ПОДДЕРЖКА (Арабский)

### Автоматические правила
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

/* Переворот стрелок */
[dir="rtl"] [class*="arrow"] {
  transform: scaleX(-1);
}

/* Сетка языков остаётся LTR */
[dir="rtl"] .language-grid {
  direction: ltr;
}
```

---

## 9. КЛАССЫ КНОПОК

```css
.btn-base        /* Базовый стиль */
.btn-primary     /* Основная CTA */
.btn-language    /* Выбор языка: polar/deep-teal */
.btn-entry       /* Вход: zanah/deep-teal */
.btn-payment     /* Способы оплаты: tuft-bush/deep-teal */
.btn-expenses    /* Расходы: serenade/deep-teal */
.btn-universal   /* Универсальная: polar/deep-teal */
.btn-object      /* Объекты: gradient/blue-whale */
```

---

## 10. ВАЖНЫЕ ПРАВИЛА

### Слоган
- **Текст**: "Τέλος στη ρουτίνα!" (ВСЕГДА с !)
- **Цвет**: `#ff8f0a` (--slogan-color)
- **Ширина**: 75% от ширины экрана

### Языки
- **Порядок фиксирован**: el, ru, uk, sq, bg, ro, en, ar
- **Без флагов** — только native names
- **RTL**: только для арабского (ar)

### Греческие термины
Следующие термины **ВСЕГДА на греческом**, не переводятся:
- ΑΦΜ (налоговый номер)
- ΔΟΥ (налоговая инспекция)
- ΜΕ ΑΠΟΔΕΙΞΗ / ΜΕ ΤΙΜΟΛΟΓΙΟ (тип регистрации)

### Интернационализация
**НЕ переводятся:**
- email
- VIP
- Voice
- WhatsApp
- Viber
- Referral Program

### Заголовки кнопок
- Первая буква заглавная, остальные строчные

### Юридические кнопки
- Только на странице **регистрации** (не на входе)
- Вместе с чекбоксом согласия
- Высота 52px, цвета как у кнопок языков

### Проверка
- **ОБЯЗАТЕЛЬНО на реальном телефоне**
- Desktop проверка — вспомогательная
- Если работает на компьютере, но не на телефоне = НЕ ГОТОВО

---

## 11. БЫСТРАЯ СПРАВКА

### Стандартные значения
| Параметр | Значение |
|----------|----------|
| Высота кнопок | 52px |
| Border-radius | 1rem (16px) |
| Padding контейнера | 40px |
| PaddingTop страниц | 180px |
| Gap кнопок | 48px |
| Gap языков | 12px |

### Цвета по умолчанию
| Элемент | Фон | Текст |
|---------|-----|-------|
| Кнопки | --polar | --deep-teal |
| Слоган | — | --slogan-color |
| Ошибки | — | --orange |
