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

---

## 12. ДИЗАЙН СТРАНИЦ

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
| paddingLeft | `40px` |
| paddingRight | `40px` |
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
        paddingLeft: '40px',
        paddingRight: '40px'
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
