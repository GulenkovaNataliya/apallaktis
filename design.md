# ДИЗАЙН-СИСТЕМА ΑΠΑΛΛΑΚΤΗΣ

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
| `/[locale]/pricing` | video1.mp4 |
| `/[locale]/help` | video1.mp4 |

### Видео на скроллируемых страницах

Для страниц с длинным контентом (pricing, help) используется **sticky видео**:

```jsx
<div className="relative">
  {/* Sticky video - stays in place while scrolling */}
  <div className="sticky top-0 h-screen w-full z-0">
    <video
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay loop muted playsInline
      poster="/pages/page-01.webp"
    >
      <source src="/video/video1.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/20" />
  </div>

  {/* Content overlays the video */}
  <div className="relative z-10" style={{ marginTop: '-100vh' }}>
    {/* ... контент ... */}
  </div>
</div>
```

**ВАЖНО:**
- `sticky top-0 h-screen` — видео занимает экран и "прилипает" при скролле
- `marginTop: '-100vh'` — контент накладывается поверх видео
- НЕ использовать `absolute inset-0` для скроллируемых страниц — видео не покроет весь контент

---

## 2. ПРАВИЛА ПО ФОТО (ФОНОВЫЕ ИЗОБРАЖЕНИЯ)

### Файлы фонов
```
/public/pages/
├── page-01.webp ... page-08.webp  (циклические фоны)
├── page-pay.webp                   (страница page-pay)
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

### Специальные фоны (specialPage)
| Страница | Фон |
|----------|-----|
| `/[locale]/page-pay` | `specialPage="pay"` → page-pay.webp |
| `/[locale]/objects` | `specialPage="objekt"` → page-objekt.webp |
| `/[locale]/objects/[id]/finance` | `specialPage="objekt"` → page-objekt.webp |
| `/[locale]/analysis` (с объектом) | `specialPage="objekt"` → page-objekt.webp |

### Циклические фоны (pageIndex)

**Авторизация:**
| # | Страница | pageIndex |
|---|----------|-----------|
| 1 | `/[locale]/login` | 1 (inline style) |
| 2 | `/[locale]/register` | 2 |
| 3 | `/[locale]/reset-password` | 3 (inline style) |
| 4 | `/[locale]/update-password` | 4 (inline style) |
| 5 | `/[locale]/email-confirmed` | 5 |
| 6 | `/[locale]/email-not-confirmed` | 6 |

**Покупка/Подписка:**
| # | Страница | pageIndex |
|---|----------|-----------|
| 7 | `/[locale]/purchase-account` | 7 |
| 8 | `/[locale]/subscription` | 8 |
| 1 | `/[locale]/subscription/success` | 1 |

**Основные разделы:**
| # | Страница | pageIndex |
|---|----------|-----------|
| 2 | `/[locale]/payment-methods` | 2 |
| 3 | `/[locale]/global-expenses` | 3 |

**Личный кабинет:**
| # | Страница | pageIndex |
|---|----------|-----------|
| 4 | `/[locale]/dashboard` | 4 |
| 5 | `/[locale]/dashboard/profile` | 5 |
| 6 | `/[locale]/dashboard/settings` | 6 |
| 7 | `/[locale]/dashboard/subscription` | 7 |
| 8 | `/[locale]/dashboard/team` | 8 |
| 1 | `/[locale]/dashboard/referral` | 1 |

**Прочие:**
| # | Страница | pageIndex |
|---|----------|-----------|
| 2 | `/[locale]/payment-success` | 2 |
| 3 | `/[locale]/demo-expired` | 3 |
| 4 | `/[locale]/team-invite` | 4 |
| 5 | `/[locale]/analysis` (без объекта) | 5 |

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
padding: '12px';
```

### Gap между элементами
| Элемент | Gap |
|---------|-----|
| Кнопки-заголовки | `48px` (gap-12) |
| Кнопки языков | `12px` (gap-3) |
| Стандартные элементы | `8px`, `12px`, `16px`, `24px` |

### ⚖️ ЗАКОН КНОПОК (эталон: page-pay)

Стандартный layout для страниц с кнопками-меню:

```jsx
<div style={{
  paddingTop: '180px',
  paddingBottom: '120px',
  paddingLeft: '40px',
  paddingRight: '40px'
}}>
  <div className="w-full flex flex-col gap-12">
    {/* кнопки */}
  </div>
</div>
```

**Layout:**

| Параметр | Значение |
|----------|----------|
| paddingTop | `180px` |
| paddingLeft/Right | `40px` |
| paddingBottom | `120px` |
| gap между кнопками | `48px` (gap-12) |
| minHeight кнопок | `52px` |
| ширина кнопок | `w-full` (100%) |

**Шрифт кнопок:**

| Параметр | Значение |
|----------|----------|
| класс | `text-button` |
| размер | `16px` |
| вес | `600` (font-weight) |
| регистр | Каждое Слово С Заглавной (textTransform: capitalize) |
| выравнивание | по центру (text-center, justify-center) |

**Применяется на:** page-pay, global-expenses, payment-methods, и других страницах с меню кнопок.

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

### Скрытие scrollbar

На всех клиентских страницах scrollbar скрыт, но прокрутка работает.

```css
/* Hide scrollbar but keep scroll functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}

/* Применено к mobile-preview-wrapper */
.mobile-preview-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.mobile-preview-wrapper::-webkit-scrollbar {
  display: none;
}
```

**ВАЖНО:** Scrollbar скрыт глобально в `globals.css` для всех браузеров.

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
Следующие термины **ВСЕГДА на греческом БОЛЬШИМИ БУКВАМИ**, не переводятся:
- ΑΦΜ (налоговый номер)
- ΔΟΥ (налоговая инспекция)
- ΑΠΟΔΕΙΞΗ / ΤΙΜΟΛΟΓΙΟ (тип регистрации — без "ΜΕ")

### Интернационализация
**НЕ переводятся:**
- email
- VIP
- Voice
- WhatsApp
- Viber
- Referral Program
- Copy (кнопка копирования)
- Unlimited (для тарифа Premium)

### Заголовки кнопок
- Первая буква заглавная, остальные строчные

### Юридические кнопки
- Только на странице **регистрации** (не на входе)
- Вместе с чекбоксом согласия
- Высота 52px, цвета как у кнопок языков

### Элемент "Назад"
- **Элемент**: `<p>`, НЕ `<button>`
- **НЕ использовать** `btn-universal` для "Назад"
- **Код**:
```jsx
<p onClick={...} className="text-button cursor-pointer" style={{ color: 'var(--polar)' }}>
  ← Назад
</p>
```

### Вертикальное позиционирование
- **НЕ использовать** `justify-center` + `min-h-screen` для страниц с контентом
- **ИСПОЛЬЗОВАТЬ** `paddingTop: 180px` — контент привязан к верху под логотипом
- Это позволяет странице скроллиться при необходимости

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

---

## 12. ДИЗАЙН СТРАНИЦ

### /[locale] — Главная страница (Landing)

**Layout:**
- `paddingTop: 180px`
- `paddingLeft: 40px`, `paddingRight: 40px`
- `gap: 48px` (gap-12)

**Элементы:**

| Элемент | Стиль | Цвет |
|---------|-------|------|
| "← Выбор языка" | `<p>` text-button cursor-pointer | `var(--polar)` |
| Слоган | text-slogan, width: 75%, **margin: 0 auto** (центрирован) | `#ff8f0a` |
| Кнопка "Вход" | btn-primary, 52px | bg: #e7f4f1, text: #033a45 |
| Кнопка "Создать аккаунт" | btn-primary, 52px | bg: #dbeee8, text: #033a45 |
| Кнопка "Прайс-лист" | btn-primary, 52px | bg: #cfe8e3, text: #033a45 |
| Кнопка "Инструкция" | btn-primary, 52px | bg: #c3e2dc, text: #033a45 |

**Переводы кнопок (8 языков):**

| Ключ | el | ru | uk | sq | bg | ro | en | ar |
|------|----|----|----|----|----|----|----|----|
| backToLanguageSelection | ← Επιλογή γλώσσας | ← Выбор языка | ← Вибір мови | ← Zgjedhja e gjuhës | ← Избор на език | ← Alegerea limbii | ← Language selection | ← اختيار اللغة |
| viewPricing | Τιμοκατάλογος | Прайс-лист | Прайс-лист | Lista e çmimeve | Ценоразпис | Lista de prețuri | Price list | قائمة الأسعار |
| howToUse | Οδηγίες | Инструкция | Інструкція | Udhëzime | Инструкция | Instrucțiuni | Instructions | تعليمات |

**Слоган центрирован:**
```jsx
<h1
  className="text-center text-slogan font-semibold"
  style={{ color: "#ff8f0a", width: "75%", margin: "0 auto" }}
>
  {t.slogan}
</h1>
```

**Файл:** `frontend/app/[locale]/page.tsx`

---

### /[locale]/email-not-confirmed — Email не подтверждён

**Layout:**
- `paddingTop: 160px` (контент поднят вверх)
- `justify-center` убран, контент привязан к верху

**Элементы:**

| Элемент | Фон | Цвет текста | Размер |
|---------|-----|-------------|--------|
| Иконка email (круг) | `var(--orange)` | white | h-24 w-24 |
| Заголовок "Подтвердите Email" | — | `var(--orange)` | text-slogan |
| Подзаголовок "Ваш email ещё не подтверждён" | — | `var(--zanah)` | text-heading, marginTop: 40px |
| Сообщение "Проверьте входящие..." | — | `var(--zanah)` | text-body |
| Блок "Проверьте спам" | `var(--orange)` | `var(--deep-teal)` | text-body |
| Кнопка "Отправить повторно" | `var(--zanah)` | `var(--deep-teal)` | 52px, marginTop: 40px |
| Кнопка "Выйти" | rgba(1,49,45,0.1) | `var(--zanah)` | 52px |

**Файл:** `frontend/app/[locale]/email-not-confirmed/page.tsx`

**Применено на всех 8 языках:** el, ru, uk, sq, bg, ro, en, ar (RTL)

---

### /[locale]/email-confirmed — Email подтверждён

**Layout:**
- `paddingTop: 160px` (контент поднят вверх)
- `justify-center` убран, контент привязан к верху

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Отступ |
|---------|-----|-------------|---------------|
| Иконка галочка (круг) | `#25D366` (зелёный) | white | h-24 w-24 |
| Заголовок "Email Подтверждён!" | — | `var(--orange)` | text-slogan |
| Сообщение "Теперь вы можете войти..." | — | `var(--zanah)` | text-body, marginTop: 40px |
| Кнопка "Войти" | `var(--zanah)` | `var(--deep-teal)` | 52px, marginTop: 40px |

**Навигация:**
- После подтверждения email → redirect на эту страницу
- Кнопка "Войти" → `/[locale]/login`

**Файл:** `frontend/app/[locale]/email-confirmed/page.tsx`

**Применено на всех 8 языках:** el, ru, uk, sq, bg, ro, en, ar (RTL)

---

### /[locale]/purchase-account — Покупка аккаунта

**Layout:**
- `paddingTop: 180px` (НЕ justify-center!)
- `paddingLeft: 40px`, `paddingRight: 40px`
- `gap: 48px` (gap-12) между основными блоками
- Страница должна скроллиться (НЕ min-h-screen с justify-center)

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| Фраза "Назад" | — | `var(--polar)` | text-button, `<p>` элемент |
| Заголовок "Покупка аккаунта" | — | `var(--polar)` | text-3xl font-bold |
| "Специальная цена!" | — | `var(--orange)` | text-lg, fontWeight: 600 |
| "62€ με ΦΠΑ" | — | `var(--orange)` | text-3xl font-bold |
| "BONUS" | — | `var(--zanah)` | text-lg font-bold |
| "30 дней бесплатно" | — | `var(--orange)` | 18px, fontWeight: 600 |
| Кнопки оплаты | object gradient | `var(--deep-teal)` | 52px / 100px для банковских |

**Группировка:**
- Заголовок + блок цены объединены в один div с `gap-2` (8px)
- Расстояние от "Покупка аккаунта" до "Специальная цена" = расстояние от "Специальная цена" до "62€"

**Файл:** `frontend/app/[locale]/purchase-account/page.tsx`

---

### /[locale]/page-pay — Главное меню

**Layout:**
- `paddingTop: 180px`
- `paddingLeft: 40px`, `paddingRight: 40px`
- `gap: 48px` (gap-12)

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| Кнопка "Способы оплаты" | `btn-payment` | `var(--deep-teal)` | 52px, text-button |
| Кнопка "Общие расходы" | `btn-expenses` | `var(--deep-teal)` | 52px, text-button |
| Кнопка "Объекты" | `var(--zanah)` | `var(--deep-teal)` | 52px, text-button, uppercase |
| Кнопка "Личный кабинет" | `#01312d` | `var(--orange)` | 52px, text-button, SVG иконка (currentColor) |

**Файл:** `frontend/app/[locale]/page-pay/page.tsx`

**Применено на всех 8 языках:** el, ru, uk, sq, bg, ro, en, ar (RTL)

---

### /[locale]/payment-methods — Способы оплаты

**Layout (список):**
- `paddingTop: 40px`, `paddingBottom: 120px`
- `paddingLeft: 40px`, `paddingRight: 40px`

**Элементы (список):**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| Кнопка "Добавить..." | `btn-universal` | `var(--deep-teal)` | 52px, marginTop: 40px, marginBottom: 40px |
| Текст "Вы ещё не добавили..." | — | `var(--orange)` | text-body |

**Layout (форма добавления):**
- `paddingLeft: 40px`, `paddingRight: 40px`
- Заголовок "Добавить способ оплаты" — по центру
- 40px между заголовком и первым полем "Тип"

**Элементы (форма):**

| Элемент | Фон | Цвет текста/рамки | Размер/Стиль |
|---------|-----|-------------------|--------------|
| Labels (Тип, Название, и т.д.) | — | `var(--polar)` | text-button, marginBottom: 20px |
| Поля ввода | transparent | `var(--polar)`, border: 2px | minHeight: 52px |
| Название | — | — | maxLength: 8 символов |
| Кнопка "Отмена" | `var(--polar)` | `var(--deep-teal)` | 52px |
| Кнопка "Сохранить" | `var(--zanah)` | `var(--deep-teal)` | 52px |

**Файл:** `frontend/app/[locale]/payment-methods/page.tsx`

**Применено на всех 8 языках:** el, ru, uk, sq, bg, ro, en, ar (RTL)

---

## 13. ЗАПОЛНЕННЫЕ КАРТОЧКИ (СПИСКИ)

### Закон карточек для списков

Карточки с названиями (категории, способы оплаты и т.д.):

```jsx
<div
  className="px-4 rounded-2xl flex items-center justify-between"
  style={{ backgroundColor: 'var(--polar)', height: '52px' }}
>
  <p style={{
    color: 'var(--deep-teal)',
    fontSize: '18px',
    fontWeight: 600,
    paddingLeft: '5px'
  }}>
    {name}
  </p>
  <div className="flex gap-2">
    {/* Edit/Delete buttons */}
  </div>
</div>
```

### Параметры карточки

| Параметр | Значение |
|----------|----------|
| height | `52px` (фиксированная) |
| backgroundColor | `var(--polar)` |
| borderRadius | `rounded-2xl` (1rem) |
| paddingLeft/Right | `px-4` (16px) |
| paddingLeft текста | `5px` |

### Текст названия

| Параметр | Значение |
|----------|----------|
| color | `var(--deep-teal)` |
| fontSize | `18px` |
| fontWeight | `600` |
| paddingLeft | `5px` |

### Кнопки Edit/Delete внутри карточки

| Параметр | Значение |
|----------|----------|
| height | `40px` |
| borderRadius | `rounded-2xl` |
| paddingLeft/Right | `px-3` (12px) |
| fontSize | `16px` |
| fontWeight | `600` |

**Edit кнопка:**
- backgroundColor: `var(--zanah)`
- color: `var(--deep-teal)`

**Delete кнопка:**
- backgroundColor: `var(--orange)`
- color: `white`

### Применяется на:
- `/[locale]/global-expenses` — список категорий
- `/[locale]/payment-methods` — список способов оплаты

---

## 14. ФОРМЫ ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ

### Название категории

| Параметр | Значение |
|----------|----------|
| maxLength | `10` символов |

### Название способа оплаты

| Параметр | Значение |
|----------|----------|
| maxLength | `8` символов |

---

## 15. ПУСТЫЕ СОСТОЯНИЯ (Empty States)

### Закон пустых состояний

Сообщения типа "Вы ещё не добавили..." отображаются когда список пустой.

**Правила:**

1. **Цвет текста**: `var(--orange)` (#ff6a1a)
2. **НЕ кнопка** — просто текст (`<p>`, не `<button>`)
3. **Расположение**: под соответствующей кнопкой добавления
4. **Исчезает**: когда появляется хотя бы один элемент
5. **Отступ**: по закону кнопок (gap-12 = 48px от кнопки)
6. **Шрифт**: по закону кнопок (text-button: 16px, font-weight: 600)
7. **Выравнивание**: по центру (text-center)

### Код

```jsx
{items.length === 0 && (
  <p className="text-center text-button" style={{ color: 'var(--orange)' }}>
    {t.noItems}
  </p>
)}
```

### Параметры

| Параметр | Значение |
|----------|----------|
| color | `var(--orange)` |
| className | `text-center text-button` |
| fontSize | `16px` (наследуется от text-button) |
| fontWeight | `600` (наследуется от text-button) |
| отступ от кнопки | `48px` (gap-12) |

### Применяется на:

- `/[locale]/global-expenses` — "Вы ещё не добавили категорию/расход"
- `/[locale]/payment-methods` — "Вы ещё не добавили способ оплаты"
- `/[locale]/objects` — "Вы ещё не добавили объект"

### Переводы (8 языков)

Тексты пустых состояний определены в `messages.ts`:
- `noCategories`, `noExpenses`, `noMethods`, `noObjects`, `noPayments`

---

## 16. ССЫЛКА "НАЗАД" (Back Link)

### Закон ссылки "Назад"

Элемент "Назад" (← Назад, ← Back, ← Πίσω и т.д.) — это **текст**, НЕ кнопка.

**Правила:**

1. **Элемент**: `<p>` с `onClick`, НЕ `<button>`
2. **Цвет текста**: `var(--polar)`
3. **Шрифт**: `text-button` (16px, font-weight: 600)
4. **Курсор**: `cursor-pointer`
5. **Отступ снизу**: `48px` (marginBottom) — по закону кнопок
6. **Расположение**: в начале страницы, перед заголовком/кнопкой-заголовком

### Код

```jsx
{/* Back - text, not a button */}
<p
  onClick={() => router.push(`/${locale}/previous-page`)}
  className="text-button cursor-pointer"
  style={{ color: 'var(--polar)', marginBottom: '48px' }}
>
  {t.backToDashboard}
</p>
```

### Параметры

| Параметр | Значение |
|----------|----------|
| элемент | `<p>` (НЕ `<button>`) |
| color | `var(--polar)` |
| className | `text-button cursor-pointer` |
| fontSize | `16px` (наследуется от text-button) |
| fontWeight | `600` (наследуется от text-button) |
| marginBottom | `48px` |
| cursor | `pointer` |

### ВАЖНО

- **НЕ использовать** `<button>` для "Назад"
- **НЕ использовать** `btn-universal` класс
- **НЕ добавлять** background или border
- Это просто кликабельный текст

### Применяется на:

- `/[locale]/objects` — список объектов
- `/[locale]/objects` — форма добавления/редактирования объекта
- `/[locale]/objects/[id]/finance` — добавление оплаты, расхода, доп. работы
- `/[locale]/global-expenses` — все view
- Все страницы с формами добавления/редактирования

---

## 17. ФОРМА ОБЪЕКТА (Object Form)

### Структура формы

Форма добавления/редактирования объекта следует закону кнопок.

**Структура каждого поля:**
```
[Кнопка-заголовок (label)]
[Поле ввода (input)]
```

### Кнопки-заголовки (Labels)

| Параметр | Значение |
|----------|----------|
| элемент | `<button type="button">` |
| className | `btn-universal w-full text-button` |
| backgroundColor | `var(--polar)` |
| color | `var(--deep-teal)` |
| minHeight | `52px` |

### Поля ввода (Inputs)

| Параметр | Значение |
|----------|----------|
| className | `w-full rounded-2xl text-button` |
| border | `2px solid var(--polar)` |
| color | `var(--polar)` |
| backgroundColor | `transparent` |
| minHeight | `52px` |
| padding | `12px` |
| marginTop | `12px` (от кнопки-заголовка) |

### Gap между полями

| Параметр | Значение |
|----------|----------|
| gap между группами полей | `48px` (gap-12) |
| marginTop input от label | `12px` |

### Код

```jsx
<form className="w-full flex flex-col gap-12" style={{ marginTop: '48px' }}>
  {/* Каждое поле */}
  <div>
    <button
      type="button"
      className="btn-universal w-full text-button"
      style={{
        minHeight: '52px',
        backgroundColor: 'var(--polar)',
        color: 'var(--deep-teal)',
      }}
    >
      {t.fieldLabel}
    </button>
    <input
      className="w-full rounded-2xl text-button"
      style={{
        border: '2px solid var(--polar)',
        color: 'var(--polar)',
        backgroundColor: 'transparent',
        minHeight: '52px',
        marginTop: '12px',
        padding: '12px'
      }}
    />
  </div>
</form>
```

### Кнопки действий (Отмена/Сохранить)

| Кнопка | Фон | Цвет текста |
|--------|-----|-------------|
| Отмена | `var(--polar)` | `var(--deep-teal)` |
| Сохранить | `var(--zanah)` | `var(--deep-teal)` |

Располагаются в ряд с `gap-4` между ними.

### Применяется на:

- `/[locale]/objects` — форма добавления/редактирования объекта
- `/[locale]/objects/[id]/finance` — формы добавления оплаты, расхода, доп. работы

---

## 18. ФРАЗА-ПОДСКАЗКА (Hint Phrase)

### Закон фразы-подсказки

Подсказка пользователю о действии. Постоянно видима (не исчезает).

**Правила:**

1. **Элемент**: `<p>`, НЕ `<button>`
2. **Цвет текста**: `var(--zanah)`
3. **Шрифт**: `text-button` (16px, font-weight: 600)
4. **Не исчезает**: всегда видна независимо от количества элементов
5. **Отступ**: по закону кнопок (gap-12 = 48px)

### Код

```jsx
{/* Hint phrase - always visible */}
<p className="text-button" style={{ color: 'var(--zanah)' }}>
  {t.clickToAnalyze}
</p>
```

### Параметры

| Параметр | Значение |
|----------|----------|
| элемент | `<p>` |
| color | `var(--zanah)` |
| className | `text-button` |
| fontSize | `16px` (наследуется от text-button) |
| fontWeight | `600` (наследуется от text-button) |

### Применяется на:

- `/[locale]/objects` — "Нажмите на объект для финансового анализа"

### Переводы (8 языков)

| Язык | Текст |
|------|-------|
| el | Πατήστε στο έργο για οικονομική ανάλυση |
| ru | Нажмите на объект для финансового анализа |
| uk | Натисніть на об'єкт для фінансового аналізу |
| sq | Klikoni në projekt për analizë financiare |
| bg | Кликнете върху обект за финансов анализ |
| ro | Apăsați pe proiect pentru analiză financiară |
| en | Click on project for financial analysis |
| ar | انقر على المشروع للتحليل المالي |

---

## 19. ДВЕ КНОПКИ В РЯД (Two Buttons in Row)

### Закон двух кнопок в ряд

Когда две кнопки-фильтра располагаются горизонтально на одной строке.

**Правила:**

1. **Container**: `<div className="flex gap-4">`
2. **Кнопки**: `flex-1` (равная ширина)
3. **Gap между кнопками**: `gap-4` (16px)
4. **Высота**: `minHeight: 52px`

### Код

```jsx
<div className="flex gap-4">
  <button
    className="btn-universal flex-1 text-button"
    style={{
      minHeight: '52px',
      backgroundColor: isActive ? 'var(--polar)' : 'transparent',
      border: isActive ? 'none' : '2px solid var(--polar)',
      color: isActive ? 'var(--deep-teal)' : 'var(--polar)',
    }}
  >
    {t.filterOpen}
  </button>

  <button
    className="btn-universal flex-1 text-button"
    style={{
      minHeight: '52px',
      backgroundColor: isActive ? 'var(--zanah)' : 'transparent',
      border: isActive ? 'none' : '2px solid var(--polar)',
      color: isActive ? 'var(--deep-teal)' : 'var(--polar)',
    }}
  >
    {t.filterClosed}
  </button>
</div>
```

### Параметры

| Параметр | Значение |
|----------|----------|
| container | `flex gap-4` |
| кнопки | `flex-1` (равная ширина) |
| gap | `16px` (gap-4) |
| minHeight | `52px` |

### Состояния кнопки

| Состояние | Фон | Рамка | Цвет текста |
|-----------|-----|-------|-------------|
| Активная (Open) | `var(--polar)` | нет | `var(--deep-teal)` |
| Активная (Closed) | `var(--zanah)` | нет | `var(--deep-teal)` |
| Неактивная | `transparent` | `2px solid var(--polar)` | `var(--polar)` |

### Применяется на:

- `/[locale]/objects` — фильтры "Открытые" / "Закрытые"
- Любая страница с двумя фильтрами в ряд

---

## 20. ЗАКОН ЛЕВОГО ОТСТУПА (Input Padding)

### Закон левого отступа для полей ввода

Все поля ввода (input, select, textarea) должны иметь одинаковый внутренний отступ.

**Правила:**

1. **Padding**: `12px` со всех сторон
2. **НЕ** `paddingLeft: 40px` — это неправильно!
3. Эталонная страница: `/[locale]/payment-methods`

### Код

```jsx
<input
  className="w-full rounded-2xl text-button"
  style={{
    border: '2px solid var(--polar)',
    color: 'var(--polar)',
    backgroundColor: 'transparent',
    minHeight: '52px',
    padding: '12px'
  }}
/>

<select
  className="w-full rounded-2xl"
  style={{
    border: '2px solid var(--polar)',
    color: 'var(--polar)',
    backgroundColor: 'transparent',
    minHeight: '52px',
    padding: '12px',
    fontSize: '18px'
  }}
>
```

### Параметры

| Параметр | Значение |
|----------|----------|
| padding | `12px` |
| minHeight | `52px` |
| border | `2px solid var(--polar)` |
| borderRadius | `rounded-2xl` (1rem) |
| backgroundColor | `transparent` |
| color | `var(--polar)` |

### Исключение: Карточки с 3 частями

Для карточек с 3 частями (описание + редактировать + удалить) используется меньший отступ:

```jsx
<div className="flex-1" style={{ paddingLeft: '6px' }}>
  {/* Описание */}
</div>
<div className="flex gap-2">
  <button>{t.edit}</button>
  <button>{t.delete}</button>
</div>
```

| Параметр | Значение |
|----------|----------|
| paddingLeft | `6px` (вместо 12px) |

### Применяется на:

- `/[locale]/login` — поля email, password
- `/[locale]/register` — поля email, password
- `/[locale]/reset-password` — поле email
- `/[locale]/update-password` — поля password
- `/[locale]/payment-methods` — форма добавления (эталон)
- `/[locale]/global-expenses` — все формы
- `/[locale]/objects` — форма добавления/редактирования объекта
- `/[locale]/objects/[id]/finance` — формы оплаты, расхода, доп. работы

---

## 21. ЗАКОН ФРАЗЫ НАЗАД (Back Phrase)

### Закон фразы "Назад"

Ссылка "Назад" на формах — это **фраза**, а не кнопка.

**Правила:**

1. **Элемент**: `<p>`, не `<button>`
2. **className**: `text-button cursor-pointer`
3. **Цвет**: `var(--polar)`
4. **marginBottom**: `48px` (перед следующим элементом)
5. НЕ использовать `btn-universal`

### Код

```jsx
{/* Back - phrase, not a button */}
<p
  onClick={() => setView('list')}
  className="text-button cursor-pointer"
  style={{ color: 'var(--polar)', marginBottom: '48px' }}
>
  {t.back}
</p>
```

### Параметры

| Параметр | Значение |
|----------|----------|
| элемент | `<p>` |
| className | `text-button cursor-pointer` |
| color | `var(--polar)` |
| marginBottom | `48px` если контейнер БЕЗ gap-12, иначе НЕ нужен |

**ВАЖНО:** Если контейнер имеет `gap-12`, НЕ добавляйте `marginBottom` — это создаст двойной отступ (96px).

### Применяется на:

- `/[locale]/objects` — "Назад" на форме объекта
- `/[locale]/global-expenses` — "Назад к расходам" на формах
- `/[locale]/objects/[id]/finance` — "Назад к объекту"
- Все формы с навигацией "назад"

---

## 22. РАЗВЁРТЫВАНИЕ (Deployment)

### Закон развёртывания

**Проект работает ТОЛЬКО на Vercel.**

- ❌ НЕ запускать `npm run dev` локально
- ❌ НЕ использовать localhost
- ✅ Все изменения проверять на Vercel после push

### Рабочий процесс

1. Внести изменения в код
2. `git add . && git commit -m "описание" && git push`
3. Vercel автоматически развернёт изменения
4. Проверить на production URL

---

## 23. ДИЗАЙН ФИНАНСОВЫХ СТРАНИЦ

### 23.1 ФИНАНСЫ ОБЪЕКТА

**Файл:** `frontend/app/[locale]/objects/[id]/finance/page.tsx`

#### Структура страницы (сверху вниз):

| # | Блок | Описание |
|---|------|----------|
| 1 | ← Назад | Ссылка для возврата к списку объектов |
| 2 | Заголовок | "Финансы Объекта" |
| 3 | Название объекта | "Объект: [название]" |
| 4 | Договорная Цена | Сумма контракта |
| 5 | Дополнительные Работы | Список доп. работ с итогом |
| 6 | Кнопка "+ Добавить" | Добавить доп. работу |
| 7 | Фактическая Цена | Договорная + Доп. работы |
| 8 | Оплата | Список платежей с итогом |
| 9 | Кнопка "+ Добавить" | Добавить платёж |
| 10 | Баланс | Сколько осталось заплатить |
| 11 | Расходы Объекта | Заголовок секции |
| 12 | Кнопка "+ Добавить" | Добавить расход |
| 13 | Анализ Расходов по Категориям | Заголовок |
| 14 | Категории расходов | Раскрывающиеся блоки по категориям |
| 15 | Итого Расходов | Общая сумма расходов |
| 16 | Платёжный Анализ | Заголовок |
| 17 | Поступившие Оплаты | Раскрывающийся блок |
| 18 | Платежи по Расходам | Раскрывающийся блок |
| 19 | Расчёт Прибыли | Кнопка закрытия объекта |

#### Цвета фона блоков:

| Блок | Фон |
|------|-----|
| Страница | `specialPage="objekt"` (BackgroundPage) |
| Название объекта | `var(--zanah)` |
| Договорная Цена | `var(--polar)` |
| Фактическая Цена | `var(--polar)` |
| Дополнительные Работы (контейнер) | `var(--polar)` |
| Дополнительные Работы (элементы) | `var(--zanah)` |
| Оплата (контейнер) | `var(--polar)` |
| Оплата (элементы) | `var(--zanah)` |
| Баланс (долг) | `#ff6a1a` (orange) |
| Баланс (закрыт) | `#25D366` (green) |
| Баланс (переплата) | `var(--zanah)` |
| Категории расходов | `var(--polar)` |
| Поступившие Оплаты | `var(--polar)` |
| Платежи по Расходам | `var(--polar)` |
| Итого Расходов | `var(--zanah)` |
| Кнопки "+ Добавить" | `var(--zanah)` |
| Кнопка "Расчёт Прибыли" | `#ff6a1a` |
| Кнопка "Удалить" | `#ff6a1a` |

#### Цвета текста:

| Элемент | Цвет |
|---------|------|
| ← Назад | `var(--polar)` |
| Заголовок страницы | `var(--polar)` |
| "Объект:" (метка) | `var(--deep-teal)` |
| Название объекта | `var(--orange)` |
| Заголовки блоков | `var(--deep-teal)` |
| Суммы (Договорная, Фактическая) | `var(--orange)` |
| Суммы доп. работ | `var(--deep-teal)` с "+" |
| Суммы платежей | `var(--deep-teal)` с "-" |
| Текст в Балансе (долг/закрыт) | `white` |
| Текст в Балансе (переплата) | `var(--deep-teal)` |
| Пустые состояния | `var(--orange)` |
| Секционные заголовки | `var(--polar)` |
| Кнопки "+ Добавить" | `var(--deep-teal)` |
| Кнопка "Расчёт Прибыли" | `white` |
| Итого Расходов (метка) | `var(--deep-teal)` |
| Итого Расходов (сумма) | `var(--orange)` |

#### Шрифты:

| Элемент | Размер | Вес |
|---------|--------|-----|
| Заголовок страницы | `text-2xl` | `font-bold` |
| Название объекта | `text-2xl` | `font-bold` |
| Заголовки блоков | `text-lg` | `font-semibold` |
| Суммы (большие) | `text-2xl` | `font-bold` |
| Сумма баланса | `text-3xl` | `font-bold` |
| Статус баланса | `text-2xl` | `font-bold` |
| Итого в блоках | `text-xl` | `font-bold` |
| Названия категорий | `16px` | `font-bold` |
| Даты | `text-sm` | normal + `opacity-70` |
| Счётчики (3x) | `text-sm` | normal + `opacity-70` |
| Кнопки | `text-button` | `font-semibold` |

#### Views (режимы страницы):

| View | Описание |
|------|----------|
| `main` | Основной вид с финансами |
| `add-work` | Форма добавления доп. работы |
| `add-payment` | Форма добавления платежа |
| `add-expense` | Форма добавления расхода |

---

### 23.2 ФИНАНСОВЫЙ АНАЛИЗ

**Файл:** `frontend/app/[locale]/analysis/page.tsx`

#### Структура страницы (сверху вниз):

| # | Блок | Описание |
|---|------|----------|
| 1 | ← Назад | Ссылка для возврата на dashboard |
| 2 | Заголовок | "Финансовый Анализ" |
| 3 | Период | Выбор даты начала и конца периода |
| 4 | Общая Сводка по Всем Объектам | Раскрывающийся блок со списком объектов |
| 5 | Общая Сумма Договорных Цен | Сумма contract_price всех объектов |
| 6 | Общая Сумма Дополнительных Работ | Сумма всех дополнительных работ |
| 7 | Общая Сумма Фактических Цен | Договорная + Доп. работы |
| 8 | Общий Баланс | **Раскрывающийся блок** с фильтром должников |
| 9 | Общие Расходы | Раскрывающийся блок по категориям глобальных расходов |
| 10 | Расходы по Объектам | Раскрывающийся блок по категориям расходов объектов |
| 11 | Общая Прибыль | Фактическая цена - Все расходы |
| 12 | Суммарный Платежный Анализ | Заголовок секции |
| 13 | Общая Сумма Поступивших Оплат | Раскрывающийся блок по способам оплаты |
| 14 | Общая Сумма Платежей по Расходам | Раскрывающийся блок по способам оплаты |
| 15 | Кнопка "Отправить отчёт" | Email отправка отчёта |

#### Цвета фона блоков:

| Блок | Фон |
|------|-----|
| Страница | `specialPage="objekt"` (BackgroundPage) |
| Период | `var(--zanah)` |
| Общая Сводка (контейнер) | `var(--polar)` |
| Общая Сводка (элементы объектов) | `var(--zanah)` |
| Общая Сумма Договорных Цен | `var(--polar)` |
| Общая Сумма Дополнительных Работ | `var(--polar)` |
| Общая Сумма Фактических Цен | `var(--polar)` |
| Общий Баланс (долг) | `#ff6a1a` (orange) |
| Общий Баланс (закрыт) | `#25D366` (green) |
| Общий Баланс (переплата) | `var(--zanah)` |
| Общий Баланс (должники внутри) | `rgba(255,255,255,0.2)` |
| Общие Расходы (контейнер) | `var(--polar)` |
| Общие Расходы (категории) | `var(--zanah)` |
| Расходы по Объектам (контейнер) | `var(--polar)` |
| Расходы по Объектам (категории) | `var(--zanah)` |
| Общая Прибыль (прибыль) | `#25D366` (green) |
| Общая Прибыль (убыток) | `#ff6a1a` (orange) |
| Поступившие Оплаты (контейнер) | `var(--polar)` |
| Платежи по Расходам (контейнер) | `var(--polar)` |

#### Цвета текста:

| Элемент | Цвет |
|---------|------|
| ← Назад | `var(--polar)` |
| Заголовок страницы | `var(--polar)` |
| Заголовки блоков | `var(--deep-teal)` |
| Суммы (большие) | `var(--orange)` |
| Текст в Балансе (долг/закрыт) | `white` |
| Текст в Балансе (переплата) | `var(--deep-teal)` |
| Должники (названия) | `white` |
| Должники (суммы) | `white` |
| Период (метки) | `var(--deep-teal)` |
| Период (даты) | `var(--orange)` |
| Номер объекта | `var(--deep-teal)` |
| Название объекта | `var(--orange)` |
| Статус объекта (открыт) | `var(--orange)` |
| Статус объекта (закрыт) | `#25D366` |

---

### 23.3 БЛОК "ОБЩИЙ БАЛАНС" — РАСКРЫВАЮЩИЙСЯ

```jsx
<div
  className="rounded-2xl"
  style={{
    backgroundColor: balanceStatus === 'debt' ? '#ff6a1a' :
                     balanceStatus === 'closed' ? '#25D366' : 'var(--zanah)',
    padding: '16px 20px'
  }}
>
  {/* Header - кликабельный */}
  <button
    onClick={() => setExpandedTotalBalance(!expandedTotalBalance)}
    className="w-full flex flex-col items-center gap-2"
  >
    <div className="flex items-center gap-2">
      <span style={{ fontSize: '20px' }}>💰</span>
      <span className="font-bold" style={{ color: 'white', fontSize: '16px' }}>
        {t.totalBalance}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold" style={{ color: 'white' }}>
        {formatEuro(totalBalance)}
      </span>
      <span style={{ color: 'white', fontSize: '18px' }}>
        {expandedTotalBalance ? '▲' : '▼'}
      </span>
    </div>
    <span className="text-lg font-bold" style={{ color: 'white' }}>
      {t.totalDebt / t.allPaid / t.totalOverpaid}
    </span>
  </button>

  {/* Раскрывающийся список должников */}
  {expandedTotalBalance && debtsByObject.length > 0 && (
    <div className="mt-4 pt-4 border-t space-y-3"
         style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
      {debtsByObject.map((debtor, index) => (
        <div
          key={index}
          className="rounded-2xl flex justify-between items-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px 16px' }}
        >
          <span style={{ color: 'white', fontWeight: 600 }}>
            {debtor.objectName}
          </span>
          <span style={{ color: 'white', fontWeight: 700 }}>
            {formatEuro(debtor.debt)}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
```

**Фильтр — только должники:**
- Показываются только объекты с `balance > 0.01`
- Формат: **Название объекта — Сумма долга**

---

### 23.4 ОТСТУПЫ И РАССТОЯНИЯ

#### Контейнер страницы:

```css
paddingTop: '180px'
paddingBottom: '120px'
paddingLeft: '40px'
paddingRight: '40px'
gap: 'gap-12' (48px между блоками)
```

#### Внутри блоков:

| Блок | Padding |
|------|---------|
| Договорная/Фактическая Цена | `p-4` (16px) |
| Дополнительные Работы | `padding: '16px 20px'` |
| Оплата | `padding: '16px 20px'` |
| Баланс | `padding: '16px 20px'` |
| Категории расходов | `padding: '16px 20px'` |
| Элементы внутри блоков | `padding: '12px 16px'` |

#### Gap между элементами:

| Контекст | Gap |
|----------|-----|
| Между блоками на странице | `gap-12` (48px) |
| Между элементами в списке | `gap-4` (16px) |
| Внутри раскрывающихся блоков | `space-y-3` (12px) |

---

### 23.5 КНОПКИ ФИНАНСОВЫХ СТРАНИЦ

#### Размеры:

| Кнопка | Height | Width |
|--------|--------|-------|
| "+ Добавить" | `minHeight: '52px'` | `w-full` |
| "Расчёт Прибыли" | `minHeight: '52px'` | `w-full` |
| "Отправить отчёт" | `minHeight: '52px'` | `w-full` |
| "Удалить" | `minHeight: '52px'` | auto |

#### Стили:

```jsx
// Кнопка "+ Добавить"
className="btn-universal w-full text-button"
style={{
  minHeight: '52px',
  backgroundColor: 'var(--zanah)',
  color: 'var(--deep-teal)'
}}

// Кнопка "Расчёт Прибыли" / "Отправить отчёт"
className="btn-universal w-full text-lg font-semibold"
style={{
  minHeight: '52px',
  backgroundColor: '#ff6a1a',  // или var(--zanah) для отчёта
  color: 'white'               // или var(--deep-teal)
}}
```

---

### 23.6 РАСКРЫВАЮЩИЕСЯ БЛОКИ

```jsx
<div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
  {/* Header */}
  <button
    onClick={() => setExpanded(!expanded)}
    className="w-full flex flex-col items-center gap-2"
  >
    <div className="flex items-center gap-2">
      <span style={{ fontSize: '20px' }}>💰</span>
      <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
        {title}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold" style={{ color: 'var(--deep-teal)' }}>
        {formatEuro(amount)}
      </span>
      <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
        {expanded ? '▲' : '▼'}
      </span>
    </div>
  </button>

  {/* Expanded List */}
  {expanded && items.length > 0 && (
    <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl flex justify-between items-center"
          style={{ backgroundColor: 'var(--zanah)', padding: '12px 16px' }}
        >
          <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
            {item.name}
          </span>
          <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
            {formatEuro(item.amount)}
          </span>
        </div>
      ))}
    </div>
  )}

  {expanded && items.length === 0 && (
    <p className="text-center mt-4 pt-4 border-t" style={{ color: 'var(--orange)' }}>
      {t.noData}
    </p>
  )}
</div>
```

---

### 23.7 ДАННЫЕ И РАСЧЁТЫ

#### Таблицы Supabase:

| Таблица | Данные |
|---------|--------|
| `objects` | Информация об объекте (name, contract_price, status) |
| `object_extras` | Дополнительные работы |
| `object_payments` | Платежи от клиента |
| `object_expenses` | Расходы по объекту |
| `global_expenses` | Глобальные расходы |
| `expense_categories` | Категории расходов |
| `payment_methods` | Способы оплаты |

#### Расчёт сумм:

```javascript
// Баланс объекта
balance = contractPrice + totalAdditionalWorks - totalPayments

// Статус баланса
if (balance > 0.01) balanceStatus = 'debt'      // Долг
else if (balance < -0.01) balanceStatus = 'overpaid' // Переплата
else balanceStatus = 'closed'                    // Закрыт

// Фактическая цена
actualPrice = contractPrice + totalAdditionalWorks

// Прибыль
profit = actualPrice - totalExpenses

// Должники (для Analysis)
debtsByObject = objects.filter(obj => obj.balance > 0.01)
                       .map(obj => ({ objectName: obj.name, debt: obj.balance }))
```

---

### 23.8 КЛЮЧЕВЫЕ ПРАВИЛА ФИНАНСОВЫХ СТРАНИЦ

1. **Gap между блоками:** всегда `gap-12` (48px)
2. **Padding внутри блоков:** `padding: '16px 20px'` или `p-4`
3. **Высота кнопок:** `minHeight: '52px'`
4. **Border-radius:** `rounded-2xl` (16px)
5. **Цвет заголовков:** `var(--deep-teal)`
6. **Цвет сумм:** `var(--orange)` для основных, `var(--deep-teal)` для вторичных
7. **Раскрывающиеся блоки:** 2 строки по центру (`flex flex-col items-center`)
8. **Пустые состояния:** оранжевый текст по центру
9. **Баланс:** оранжевый (долг), зелёный (оплачено), zanah (переплата)
10. **"← Назад":** это `<p>`, не `<button>`, цвет `var(--polar)`

---

## 24. ДИЗАЙН СТРАНИЦ КОМАНДЫ

### 24.1 `/[locale]/dashboard/team` — Управление командой

**Layout:**
- `paddingTop: 180px`
- `paddingLeft: 40px`, `paddingRight: 40px`
- `paddingBottom: 120px`
- `gap: 48px` (gap-12)

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| ← Назад | — | `var(--polar)` | `<p>` text-button cursor-pointer |
| Заголовок | — | `#ff8f0a` | text-slogan font-bold |
| Лимит участников | `var(--zanah)` | `var(--deep-teal)` | rounded-2xl p-4 |
| Карточка участника | `var(--zanah)` | `var(--deep-teal)` | rounded-2xl p-4 |
| Роль "Владелец" | — | `var(--orange)` | text-small |
| Роль "Участник" | — | `var(--deep-teal)` | text-small |
| Кнопка "Удалить" | `#ef4444` | white | px-3 py-1 rounded-lg |
| Кнопка "Покинуть" | transparent | `#ef4444` | 52px, border: 2px solid #ef4444 |
| Кнопка "Пригласить" | `var(--orange)` | `var(--deep-teal)` | 52px |
| Кнопка "Обновить" | `var(--orange)` | `var(--deep-teal)` | 52px |

**Модальное окно приглашения:**

| Элемент | Фон | Цвет | Размер |
|---------|-----|------|--------|
| Контейнер | `var(--zanah)` | — | rounded-2xl p-6 |
| Заголовок | — | `var(--deep-teal)` | text-heading font-semibold |
| Input email | white | `var(--deep-teal)` | 52px, rounded-2xl, padding: 12px |
| Кнопка "Отмена" | transparent | `var(--deep-teal)` | 52px, border: 2px solid |
| Кнопка "Отправить" | `var(--orange)` | `var(--deep-teal)` | 52px |

**Файл:** `frontend/app/[locale]/dashboard/team/page.tsx`

---

### 24.2 `/[locale]/team-invite` — Принятие приглашения

**Layout:**
- Центрирование по вертикали (justify-center) — исключение для этой страницы
- `paddingLeft: 40px`, `paddingRight: 40px`

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| Заголовок | — | `#ff8f0a` | text-slogan font-bold |
| Карточка приглашения | `var(--zanah)` | `var(--deep-teal)` | rounded-2xl p-6 |
| Имя приглашающего | — | `var(--orange)` | text-heading font-semibold |
| Название команды | — | `var(--orange)` | text-heading font-semibold |
| Кнопка "Принять" | `var(--orange)` | `var(--deep-teal)` | 52px |
| Кнопка "Отклонить" | transparent | `var(--polar)` | 52px, border: 2px solid var(--polar) |
| Кнопка "Войти" | `var(--orange)` | `var(--deep-teal)` | 52px |
| Кнопка "Регистрация" | transparent | `var(--polar)` | 52px, border: 2px solid var(--polar) |

**Состояния:**

| Состояние | Иконка | Цвет заголовка |
|-----------|--------|----------------|
| Успех | ✅ (text-6xl) | `#10b981` (green) |
| Ошибка | ❌ (text-6xl) | `#ef4444` (red) |

**Файл:** `frontend/app/[locale]/team-invite/page.tsx`

---

### 24.3 КЛЮЧЕВЫЕ ПРАВИЛА СТРАНИЦ КОМАНДЫ

1. **Gap между блоками:** `gap-12` (48px)
2. **Высота кнопок:** `minHeight: '52px'`
3. **Border-radius:** `rounded-2xl` (16px)
4. **Карточки участников:** фон `var(--zanah)`, текст `var(--deep-teal)`
5. **Роль Owner:** цвет `var(--orange)`
6. **Деструктивные кнопки:** красный `#ef4444`
7. **"← Назад":** это `<p>`, не `<button>`, цвет `var(--polar)`
8. **Модальные окна:** фон `var(--zanah)`, кнопки 52px

---

## 25. ДИЗАЙН СТРАНИЦЫ ПОДПИСКИ

### 25.1 `/[locale]/dashboard/subscription` — Моя Подписка

**Layout:**
- `paddingTop: 180px`
- `paddingLeft: 40px`, `paddingRight: 40px`
- `paddingBottom: 120px`
- `gap: 48px` (gap-12)

**Структура страницы (сверху вниз):**

| # | Блок | Условие |
|---|------|---------|
| 1 | ← Назад | всегда |
| 2 | Заголовок "Η Συνδρομή μου" | всегда |
| 3 | 💳 Αγορά Λογαριασμού | всегда |
| 4 | Κατάσταση: Πληρώθηκε / Δεν έχει πληρωθεί | всегда |
| 5 | Кнопка "Αγορά Λογαριασμού" | только если НЕ оплачено |
| 6 | 📋 Τρέχον Πρόγραμμα | всегда |
| 7 | Πλάνο: Basic/Standard/Premium/VIP/DEMO | если есть план |
| 8 | Κατάσταση: Ενεργή/DEMO/Έληξε | всегда |
| 9 | VIP срок или время до истечения | зависит от статуса |
| 10 | 🎁 Bonus Μήνες | если > 0 |
| 11 | Кнопка "Αλλαγή Πακέτου" | только для active Basic/Standard/Premium |
| 12 | 📜 Ιστορικό Πληρωμών | всегда |
| 13 | Δεν υπάρχουν πληρωμές | если нет платежей |

**VIP отображение:**
- Если `vip_expires_at` > 50 лет от сегодня → показать "Απεριόριστο" (зелёным #25D366)
- Если `vip_expires_at` < 50 лет → показать "Έως DD.MM.YYYY" (оранжевым)
- НЕ показывать "X ημέρες απομένουν" для VIP

**Элементы:**

| Элемент | Фон | Цвет текста | Размер/Стиль |
|---------|-----|-------------|--------------|
| ← Назад | — | `var(--polar)` | `<p>` text-button cursor-pointer |
| Заголовок | — | `#ff8f0a` | text-slogan font-bold |
| Секции (💳, 📋, 📜) | — | `var(--zanah)` | text-heading font-semibold |
| Статусы (текст) | — | `var(--zanah)` | text-body |
| Статус: Πληρώθηκε | — | `#25D366` | font-bold |
| Статус: Δεν έχει πληρωθεί | — | `var(--orange)` | font-bold |
| Статус: Ενεργή | — | `#25D366` | font-bold |
| Статус: DEMO | — | `#3b82f6` | font-bold |
| Статус: Έληξε | — | `var(--orange)` | font-bold |
| План (Basic/VIP/etc) | — | `var(--orange)` | font-bold |
| Απεριόριστο (VIP unlimited) | — | `#25D366` | font-bold |
| Кнопка "Αγορά Λογαριασμού" | `var(--orange)` | white | 52px, text-slogan font-bold |
| Кнопка "Αλλαγή Πακέτου" | `var(--zanah)` | `var(--deep-teal)` | 52px, text-button font-semibold |

**Кнопка "Αλλαγή Πακέτου":**
- Показывается ТОЛЬКО для `subscription_status === 'active'` с планом Basic/Standard/Premium
- НЕ показывается для VIP и demo
- Открывает Stripe Customer Portal (`/api/stripe/customer-portal`)

**Файл:** `frontend/app/[locale]/dashboard/subscription/page.tsx`

**API:** `frontend/app/api/stripe/customer-portal/route.ts`

---

## CHANGELOG (28.01.2026)

### 1. /[locale]/email-not-confirmed — Проверьте спам

**Было:** Оранжевый блок с текстом `var(--deep-teal)`
**Стало:** Простой текст цвета `var(--orange)` без фона

```jsx
// Было
<div style={{ backgroundColor: "var(--orange)" }}>
  <p style={{ color: "var(--deep-teal)" }}>{t.checkSpam}</p>
</div>

// Стало
<p style={{ color: "var(--orange)" }}>{t.checkSpam}</p>
```

### 2. /[locale]/dashboard/subscription — Увеличен текст Plan/Status/Expires

**Было:** `text-body` для строк План, Статус, Срок
**Стало:** `text-heading` (как заголовок "Текущий План")

Также добавлена подпись для VIP unlimited:
- **Было:** просто "Безлимит"
- **Стало:** "До: Безлимит"

### 3. /[locale]/thank-you — Слоган белым текстом

**Было:** `color: "#ff8f0a"` (оранжевый)
**Стало:** `color: "var(--polar)"` (белый)

| Элемент | Цвет |
|---------|------|
| "Спасибо за регистрацию!" | `#ff8f0a` (оранжевый) |
| "Возьми контроль в свои руки!" | `var(--polar)` (белый) |
| Таймер редиректа | `#ff8f0a` (оранжевый) |

### 4. /[locale]/global-expenses — Форма добавления расхода (ExpenseForm)

**Исправлено:** Сообщение `noCategories` когда нет категорий

**Было:**
- `color: 'var(--polar)'` (неправильно)
- `marginTop: '96px'`
- Была кнопка "← Назад к Расходам" внизу

**Стало:**
- `color: 'var(--orange)'` (согласно закону пустых состояний)
- `marginTop: '40px'`
- Кнопка "← Назад к Расходам" удалена (есть верхняя фраза "← Назад к Расходам")

### 5. /[locale]/email-not-confirmed — Сообщение "Проверьте входящие"

**Было:**
- `t.message` ("Проверьте входящие...") — `var(--polar)` (белый)
- `t.checkSpam` ("Также проверьте спам...") — `var(--orange)` (повтор)

**Стало:**
- `t.message` — `var(--orange)` (оранжевый)
- `t.checkSpam` — удалён (дублирует информацию из `t.message`)

---
