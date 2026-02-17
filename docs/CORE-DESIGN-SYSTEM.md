# CORE DESIGN SYSTEM (Universal Base)

## Статус
Этот файл — единственный источник чистой архитектуры.
Переносим сюда правила по главам после аудита design.md.
Никаких дубликатов. Никаких «как-нибудь».


## 0. Правила работы
- Работаем “один шаг → выполнено → следующий шаг”.
- Фиксируем решения только после визуальной проверки на Vercel.

## 1. Tokens

Tokens — это единственное место, где разрешено менять бренд.

Никакие компоненты не должны содержать жёстко зашитые цвета или размеры.
Всё берётся только из Tokens.

### 1.1 Colors

Каждый проект обязан определить:

- background
- primary
- accent
- surface
- success
- danger
- text-main
- text-inverted

Пример:

background: #033a45
primary: #daf3f6
accent: #ff6a1a
surface: #e2f1dd
success: #25D366
danger: #ff6a1a
text-main: #daf3f6
text-inverted: #01312d

⚠️ Запрещено использовать цвета вне tokens.

### 1.2 Sizes

button-height: 52px
border-radius: 16px
container-padding-x: 40px
container-padding-top: 180px
section-gap: 48px
input-padding: 12px

⚠️ Размеры фиксированы для всей системы.

### 1.3 Typography

font-family: Noto Sans

slogan: 22px / 500
heading: 24px / 700
subheading: 18px / 600
button: 16px / 600
body: 14px / 400
small: 12px / 400

## 2. Layout System

Layout — это неизменяемая часть системы.
Он одинаков для всех проектов.

### 2.1 Container Law

Все страницы (кроме Confirmation Page) обязаны использовать:

padding-top: 180px
padding-bottom: 120px
padding-left/right: 40px

Контент всегда начинается сверху.
Запрещено использовать justify-center на контентных страницах.

### 2.2 Vertical Flow Law

Страница должна:

- Скроллиться
- Иметь естественный поток сверху вниз
- Никогда не быть “зажатой” по высоте

Использовать flex-col.
Не использовать h-screen для контента.

### 2.3 Gap Law

Между основными блоками: 48px  
Внутри блока: 16px  
В раскрывающихся списках: 12px  

Запрещено использовать случайные margin.

## 3. Component Law

Компоненты не зависят от бренда.
Они используют только Tokens.
Запрещено создавать «уникальные версии» кнопок или карточек без системной причины.

### 3.1 Buttons

Базовые правила:

- min-height: 52px
- border-radius: 16px
- font-weight: 600
- padding-x: 16px
- transition обязателен

Типы кнопок:

- primary
- secondary
- surface
- danger

Цвета берутся только из Tokens.

Запрещено:
- менять высоту кнопок
- использовать inline color
- создавать третью визуальную вариацию без фиксации в документе

### 3.2 Back Phrase

Back — это текстовый элемент, не кнопка.

- Используется `<p>`
- font-size: 18px
- cursor: pointer
- не использовать button

Back не должен выглядеть как primary-button.

### 3.3 Cards (List Rows)

Карточки списков имеют фиксированную структуру:

- height: 52px (если это строка списка)
- border-radius: 16px
- padding: 16px
- display: flex
- justify-content: space-between
- align-items: center

Карточки не должны иметь случайную высоту.

### 3.4 Forms

Форма обязана соблюдать:

- label = `<p>`
- input height = 52px
- border = 2px
- padding = 12px
- border-radius = 16px

Никаких input 38px, 44px и т.п.

### 3.5 Financial Blocks

Финансовые блоки имеют строгие правила:
Баланс:

- debt → accent color
- closed → success
- overpaid → surface

Раскрывающийся блок:

- header по центру
- стрелка ▲ ▼
- внутренний gap: 12px
- нельзя использовать случайные margin

## 4. Viewport Architecture

### 4.1 Mobile Preview Wrapper (База)

**Зачем это нужно**

Client UI существует только в mobile-формате.  
На desktop мы не строим отдельную версию — мы показываем ту же mobile-версию в “preview режиме”, чтобы сохранить размеры, поведение и UX.

**Главный закон**

- Прокрутка (scroll) должна быть **только одна** — внутри `.mobile-preview-wrapper`.
- `html/body` не должны иметь собственный scroll для client-части.

**Требования**

- Wrapper ограничивает ширину (как мобильный экран)
- Wrapper управляет вертикальной прокруткой
- Wrapper является “контекстом” для фоновых слоёв (видео/градиенты), чтобы они не обрывались при прокрутке
- Никаких фиксированных высот для контента страницы (контент растёт естественно)

---

#### CSS (канонический)

```css
.mobile-preview-wrapper {
  width: 100%;
  max-width: 500px;

  /* ВАЖНО: wrapper должен быть минимум высоты viewport,
     но контент может быть длиннее. Поэтому min-height, не height. */
  min-height: 100vh;
  min-height: 100dvh;

  margin: 0 auto;
  position: relative;

  /* Фон задаётся здесь (или на внутреннем page container),
     чтобы он принадлежал тому же scroll-контексту */
  background: white;

  /* Единственный scroll-контекст для client UI */
  overflow-y: auto;
  overflow-x: hidden;

  /* Чтобы фоновые слои (video/overlays) не “протекали” наружу */
  isolation: isolate;

  /* Hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile-preview-wrapper::-webkit-scrollbar {
  display: none;
}
Запрещено

Делать scroll на body для client UI

Создавать второй scroll-контейнер внутри страниц (nested scroll)

Использовать height: 100vh/100dvh на wrapper (это обрывает фон/слои на desktop при длинном контенте)

### 4.2 Desktop Frame

@media (min-width: 600px) {
  .mobile-preview-wrapper {
    max-width: 500px;

    /* ВАЖНО: не фиксированная высота */
    min-height: 96vh;

    margin-top: 2vh;

    border-radius: 40px;
    border: 12px solid #1a1a1a;

    box-shadow:
      0 0 0 2px #333,
      0 20px 50px rgba(0, 0, 0, 0.5);

    /* Scroll остаётся только здесь */
    overflow-y: auto;
    overflow-x: hidden;
  }
}
### 4.3 Mobile Devices

@media (max-width: 599px) {
  .mobile-preview-wrapper {
    max-width: 100%;

    /* Не фиксируем высоту */
    min-height: 100vh;
    min-height: 100dvh;

    border-radius: 0;
    border: none;
    box-shadow: none;

    overflow-y: auto;
    overflow-x: hidden;
  }

  body {
    background-color: white;
  }
}

### 4.4 Правила, которые запрещено нарушать

Нельзя добавлять overflow-hidden на страницы с длинным контентом (Help, Analysis и т.д.).
Нельзя ставить фиксированную высоту (height: 90vh, height: 100vh) на внутренние страницы.
Скролл всегда должен быть в .mobile-preview-wrapper.
Help-страница обязана скроллиться полностью до самого низа.
---

## 5. Layout Architecture Rules

### 5.1 Три типа страниц

A) Короткие (без длинного скролла)  
Пример: login, register, thank-you  
Допускается центрирование.  
Допускается `overflow-hidden` на корневом контейнере страницы (не на body).

B) Длинные (обязательный скролл)  
Пример: help, pricing, analysis, objects/[id]/finance  
Запрещено:
- `overflow-hidden`
- `min-h-screen` + `justify-center`

Требование:
- Контент привязан к верху через paddingTop.

C) Sticky-background (длинные + видео)  
Пример: help/pricing с видео  
Фон может быть sticky.  
Контент всегда скроллится внутри `.mobile-preview-wrapper`.

### 5.2 Базовый контейнер для всех страниц (эталон)

<div
  style={{
    paddingTop: "180px",
    paddingBottom: "120px",
    paddingLeft: "40px",
    paddingRight: "40px",
  }}
>
  <div className="w-full flex flex-col gap-12">
    {/* content */}
  </div>
</div>

Правила:
paddingTop = 180px (контент “под логотипом”)
gap-12 = 48px между блоками
paddingBottom = 120px, чтобы низ всегда был виден и не “обрезался”

### 5.3 Страницы с видео/фоном и длинным контентом (sticky pattern)

<div className="relative">
  <div className="sticky top-0 h-screen w-full z-0">
    <video
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      poster="/pages/page-01.webp"
    >
      <source src="/video/video1.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/20" />
  </div>

  <div className="relative z-10" style={{ marginTop: "-100vh" }}>
    <div
      style={{
        paddingTop: "180px",
        paddingBottom: "120px",
        paddingLeft: "40px",
        paddingRight: "40px",
      }}
    >
      <div className="w-full flex flex-col gap-12">{/* content */}</div>
    </div>
  </div>
</div>


Запрещено:
делать фон absolute на всю страницу для длинных страниц (он не покроет контент корректно)

### 5.4 Список запретов (must-not)

Нельзя применять justify-center на страницах B и C
Нельзя делать min-h-screen как основу длинных страниц
Нельзя зажимать страницу в фиксированную высоту внутри контента
Нельзя менять значения paddingTop/paddingBottom “по вкусу” — они часть системы

## 8. RTL ПОДДЕРЖКА (AR) — ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА

### 8.1 Цель
Арабский (`ar`) работает в режиме RTL:
- направление текста справа налево
- выравнивание текста вправо
- при этом сетка выбора языка и порядок языков НЕ ломаются

### 8.2 Базовые правила RTL

1) RTL включается только для `ar`.  
2) Для RTL:
- `direction: rtl`
- `text-align: right`
3) Компоненты на flex-row — разворачиваем `row-reverse` ТОЛЬКО там, где это нужно.
4) Иконки/стрелки “назад/вперёд” — зеркалим по X, но НЕ зеркалим весь UI.

### 8.3 Эталонный CSS

```css
/* RTL base */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Reverse row only when a row is semantically “left-to-right” */
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

/* Flip arrows/icons (only icons), not entire layout */
[dir="rtl"] .icon-arrow,
[dir="rtl"] .arrow-left,
[dir="rtl"] .arrow-right,
[dir="rtl"] [class*="arrow"] {
  transform: scaleX(-1);
}

/* Language selector grid must remain LTR so the order is stable */
[dir="rtl"] .language-grid {
  direction: ltr;
}

### 8.4 Что НЕ трогаем (критично)
Порядок языков фиксированный: el, ru, uk, sq, bg, ro, en, ar

На странице выбора языка сетка должна оставаться LTR (иначе путается порядок)
Кнопки (btn-*) должны оставаться с центрированным текстом:
в RTL не делаем text-align:right на самих кнопках, только на текстовых блоках контента


## 9. ТИПОГРАФИКА — ЕДИНЫЕ КЛАССЫ И ПРАВИЛА

### 9.1 Принцип
- Весь текст в приложении должен использовать ТОЛЬКО эти классы.
- Не задаём размеры шрифтов inline-стилями, кроме редких спец-случаев (описаны ниже).
- Заголовки/подсказки/кнопки должны выглядеть одинаково на всех страницах.

### 9.2 CSS классы (эталон)

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

### 9.3 Где какой класс использовать (обязательная матрица)

Контекст	Класс	Примечание
Слоган на лендинге/thank-you	text-slogan	Цвет обычно --slogan-color или --polar
Текст на кнопках	text-button	Всегда 16px / 600
Основной текст/описания	text-body	Длинные абзацы, инструкции, пояснения
Ссылки (terms/privacy/подсказки-ссылки)	text-link	Меньше и легче, чем body
Главные заголовки страниц	text-heading	Если нужен “главный” акцент
Подзаголовки секций	text-subheading	Разделы внутри страницы
Мелкие подписи, роли, даты	text-small	Вторичная информация

### 9.4 Заголовки страниц: правило выбора

Если страница “ключевая” (Dashboard/Subscription/Objects/Analysis) — допускается text-2xl font-bold (tailwind) ИЛИ text-heading.

Если страница простая (форма добавления, подтверждения) — лучше text-heading + центрирование.

Главное правило: в рамках одного типа страниц — один и тот же стиль.

### 9.5 Кнопки и текст: что запрещено

Запрещено:

font-style: italic
text-transform: uppercase (кроме отдельно оговорённых мест)
inline font-size / font-weight без причины

Разрешено (редко):

цифры сумм в финансовых блоках (крупнее) — это часть дизайна финансовых страниц, описано в главах Finance/Analysis.

### 9.6 RTL и шрифты

Для body[dir="rtl"] используется Noto Sans Arabic.
Сами классы text-* не меняются — меняется только семейство шрифта через body[dir="rtl"].

### 9.7 “Капитализация” текста на кнопках

Заголовки кнопок: “Каждое Слово С Заглавной”.
Не делаем автоматическую капитализацию через CSS без необходимости.
В переводах (messages.ts) тексты кнопок должны приходить уже в правильном регистре.

## 10. СИСТЕМА ТЕНЕЙ И ПРАВИЛО КНОПОК

### 10.1 Главный принцип

Во всём приложении действует правило:

> Цвет тени = цвет текста кнопки.

Это создаёт единый визуальный стиль и ощущение “глубины” без хаоса.

### 10.2 Shadow System (эталон)

Тени не должны зависеть от конкретного бренд-цвета.

Они должны быть нейтральными или привязанными к универсальным токенам.

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.18);
--shadow-pressed: 0 2px 4px rgba(0, 0, 0, 0.15);
Правило:

Тени не используют конкретные бренд-переменные.

Цвет тени не равен цвету текста.

Shadow System является универсальным и переносимым между проектами.

---

Это убирает зависимость от Apallaktis-цветов  
и делает систему масштабируемой.

### 10.3 Обязательные состояния кнопки
Каждая кнопка должна иметь:

Нормальное состояние

Active (нажатие) — с уменьшенной тенью

Лёгкий scale-эффект

Пример:

.btn-base {
  border-radius: 1rem;
  min-height: 52px;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-base:active {
  transform: scale(0.95);
}

### 10.4 Примеры кнопок (цвет + тень = текст)

Language button
.btn-language {
  background-color: var(--polar);
  color: var(--deep-teal);
  box-shadow: 0 4px 8px var(--deep-teal);
}
Object button
.btn-object {
  color: var(--blue-whale);
  box-shadow: 0 4px 8px var(--blue-whale);
}
### 10.5 Запрещено

Чёрная тень при светлом тексте
Разные цвета тени и текста
Слишком жёсткие drop-shadow эффекты
box-shadow без перехода при :active

### 10.6 Высота кнопки

Стандартная высота:

min-height: 52px

Меньше — нельзя (UX на мобильном ломается).
Больше — только если это специальная CTA-кнопка.

### 10.7 Центрирование одиночной кнопки

Для одиночной кнопки:

.btn-single-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-single {
  width: 70%;
}

### 10.8 В будущих проектах 

Разрешается менять:

Цвета палитры
Цвет фона
Цвет CTA

Запрещается менять:
Поведение кнопки
Логику теней
Высоту
Скругление
Active-эффект

## 11. СТРУКТУРА СТРАНИЦ (LAYOUT PATTERN)

### 11.1 Главный принцип

Каждая страница внутри приложения должна иметь предсказуемую структуру:

Header  
Content  
Bottom safe space  

Никаких “хаотичных” отступов или случайных контейнеров.

### 11.2 Базовый Layout-шаблон страницы

Страница всегда находится внутри `.mobile-preview-wrapper`.

Layout не должен ограничивать естественную высоту контента.

```tsx
<div className="flex flex-col">

  {/* HEADER */}
  <div className="safe-area-top">
    ...
  </div>

  {/* CONTENT */}
  <div className="flex-1 container">
    ...
  </div>

  {/* BOTTOM SAFE SPACE */}
  <div className="safe-area-bottom" />

</div>
Обновлённые правила

min-h-screen НЕ является обязательным.

Высота страницы определяется контентом.

Scroll управляется .mobile-preview-wrapper, а не страницей.

Никаких фиксированных height для страниц с длинным контентом.

Не использовать overflow-hidden на корневом div страницы.

Safe-area классы использовать:

.safe-area-top

.safe-area-bottom

---

Почему:

`min-h-screen` создавал вторую логику высоты,  
что может конфликтовать с видео и длинными страницами.

Теперь:
- wrapper отвечает за scroll
- страница отвечает только за структуру


### 11.3 Правила

- `min-h-screen` не является обязательным.
- Контент всегда размещается внутри `.container`.
- Высота страницы определяется контентом.
- Никаких фиксированных height для страниц с длинным контентом.
- Не использовать `overflow-hidden` на корневом div страницы.
- Scroll управляется `.mobile-preview-wrapper`.
- Safe-area классы использовать:
  - `.safe-area-top`
  - `.safe-area-bottom`


### 11.4 Help / Pricing / Long Pages

Для длинных страниц:

Никакого фиксированного height.
Не использовать flex-центрирование всей страницы.
Контент должен естественно скроллиться.

### 11.5 Формы (Login / Register / Reset)

Формы могут использовать центрирование:
<div className="min-h-screen flex items-center justify-center">
НО только если:
Контента мало
Нет длинного текста
Нет длинного markdown

### 11.6 Sticky элементы

Если используется sticky header:
Он должен быть внутри .mobile-preview-wrapper
Не должен ломать скролл
Не использовать position: fixed на уровне body

### 11.7 Что запрещено

- `height: 100vh` внутри вложенных div без необходимости
- `overflow-hidden` без причины
- `margin-bottom` “на глаз”
- `padding-bottom` вместо `.safe-area-bottom`


## 12. ACCORDION SYSTEM (РАСКРЫВАЮЩИЕСЯ БЛОКИ)

Цель: один стандарт поведения и стилей для всех раскрывающихся блоков во всём продукте
(analysis, finance, global-expenses, будущие страницы).

### 12.1 Два типа accordion

### TYPE A — Single (boolean)
Один блок: открыт/закрыт.

Используется когда:
- раскрывается одна секция (например TotalBalance)
- “Поступившие оплаты” / “Платежи по расходам” (boolean)

State:
- `const [expandedX, setExpandedX] = useState(false)`

### TYPE B — Multi (Set-based)

Список секций, каждая раскрывается отдельно (категории, методы оплаты).

Используется когда:
- много категорий (расходы по категориям)
- много payment methods

State:
- `const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())`

Toggle:
- если id есть → удалить
- если id нет → добавить


##№ 12.2 Общий визуальный стандарт (для обоих типов)

### Контейнер accordion
- `borderRadius: rounded-2xl`
- фон: `var(--polar)`
- padding: `16px 20px`

### Header (кликабельный)
- элемент: `<button>`
- ширина: `w-full`
- layout: `flex flex-col items-center gap-2`
- стрелка: только символы `▲ / ▼`
- стрелка всегда справа от суммы или на второй строке рядом (как в analysis)

### Expanded list items
- фон: `var(--zanah)`
- `rounded-2xl`
- padding: `12px 16px`
- left: название, right: сумма
- название: `var(--deep-teal)`, `fontWeight: 600`
- сумма: `var(--orange)`, `fontWeight: 700`

### Разделительная линия при раскрытии
- `mt-4 pt-4 border-t`
- цвет линии:
  - для светлого блока: `var(--deep-teal)`
  - если блок на оранжевом фоне (debt): `rgba(255,255,255,0.3)`


### 12.3 Сценарии “нет данных”

Если раскрыли и данных нет:

- показываем текст по центру
- цвет: `var(--orange)`
- это `<p>`, не кнопка
- с разделительной линией как у списка

```jsx
{expanded && items.length === 0 && (
  <p className="text-center mt-4 pt-4 border-t" style={{ color: 'var(--orange)' }}>
    {t.noData}
  </p>
)}

### 12.4 Особый случай: TotalBalance (debt/closed/overpaid)

Этот блок меняет фон контейнера по статусу:

debt: #ff6a1a
closed: #25D366
overpaid: var(--zanah)
Текст внутри:
debt/closed: white
overpaid: var(--deep-teal)
Expanded items (должники) при debt/closed:
фон: rgba(255,255,255,0.2)
текст и сумма: white

### 12.5 Что запрещено

<div onClick> вместо <button>
кастомные стрелки/иконки вместо ▲/▼
разные padding у разных accordion без причины
смешивание цветов вне палитры
случайные margin вместо стандарта mt-4 pt-4

### 12.6 Проверка поведения

Accordion обязан:

открываться кликом по header
закрываться повторным кликом
не “прыгать” по высоте из-за неправильных контейнеров
не ломать scroll внутри .mobile-preview-wrapper

## 13. VIDEO BACKGROUND SYSTEM (СТАБИЛЬНАЯ АРХИТЕКТУРА)

### 13.1 Главный принцип

Фоновое видео — это только визуальный слой.

Оно не должно:

- ломать scroll
- создавать второй scroll-контекст
- влиять на высоту страницы
- быть привязано к body/html
- перекрывать контент

Видео всегда должно находиться в том же scroll-контексте,
что и контент страницы.

В Client UI scroll-контекст — это `.mobile-preview-wrapper`.

---

### 13.2 Базовая архитектура (короткие страницы)

Если страница по высоте примерно равна одному экрану,
используется absolute-паттерн.

```tsx
<div className="relative">
  
  {/* Видео-фон */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover -z-10"
  />

  {/* Контент */}
  <div className="relative z-10">
    ...
  </div>

</div>
Правила:

Видео всегда position: absolute

Видео всегда -z-10

Контент всегда relative z-10

Родительский контейнер всегда relative

13.3 Длинные страницы (Help, Pricing и др.)
Если страница длинная и скроллится,
видео должно корректно покрывать всю зону scroll.

Допустимы два паттерна:

Вариант A (предпочтительный)
Видео находится внутри контейнера,
который растёт вместе с контентом.

<div className="relative">

  <div className="absolute inset-0 -z-10">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  </div>

  <div className="relative z-10">
    ...длинный контент...
  </div>

</div>
Вариант B (если нужен эффект “приклеенного” видео)
Используется sticky-паттерн.

<div className="relative">

  <div className="sticky top-0 h-screen -z-10">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  </div>

  <div className="relative z-10">
    ...длинный контент...
  </div>

</div>

### 13.4 Строго запрещено

- `position: fixed` для видео в Client UI
- Размещать видео на уровне `body` или `html`
- Создавать двойной scroll (и в wrapper, и в странице)
- Использовать `height: 100vh`, если это обрезает длинный контент
- Делать видео частью flex-контейнера, который центрирует всю страницу


### 13.5 Что можно менять в будущих проектах
Разрешено:

менять само видео

добавлять overlay-слой

менять прозрачность

менять цветовую подложку

Запрещено:

менять scroll-архитектуру

менять z-index логику

выносить видео за пределы scroll-контекста

## 14. HELP PAGE ARCHITECTURE

### 14.1 Главный принцип

Help — это:
- Markdown как источник контента
- React-компонент как источник структуры
- Accordion — часть UI, не часть Markdown

Markdown НЕ управляет логикой раскрытия.

---

### 14.2 Структура Help

Help должен:

1) Загружать markdown файл
2) Разбивать его по `##` (главы)
3) Каждую главу превращать в accordion-секцию
4) Использовать стандарт из раздела 12 (Accordion System)

---

### 14.3 Что запрещено

- Inline styles внутри markdown (в идеале — убрать постепенно)
- HTML `<p style=...>` внутри markdown
- Управлять цветами через markdown

Цвета и стили — только через ReactMarkdown components.

---

### 14.4 Как правильно разбивать markdown

Алгоритм:

1) Разделяем markdown по `## `
2) Первый блок до первого `##` — это intro
3) Каждый `##` — отдельная accordion-секция
4) Внутри секции сохраняются:
   - `###`
   - списки
   - таблицы
   - изображения

---

### 14.5 Поведение Help

- Все секции закрыты по умолчанию
- Открывается одна — остальные не обязаны закрываться (multi-type)
- Стрелка `▲/▼`
- Стиль — из раздела 12

---

### 14.6 Будущие проекты

Help должен быть:

- Независим от палитры
- Использовать CSS variables
- Работать одинаково в любом проекте 

## 15. ADMIN PANEL DESIGN SYSTEM

### 15.1 Принцип изоляции

Admin Panel — это отдельная визуальная зона.

Она:

- не использует mobile-preview-wrapper
- не имеет "телефонной рамки"
- не использует мобильную центровку
- работает как полноценный desktop-интерфейс

Admin ≠ Client UI

---

### 15.2 Layout Admin

Admin layout:

- Full width
- Без ограничений 500px
- Без border-radius 40px
- Без phone frame
- Scroll стандартный (body scroll)

---

### 15.3 Цветовая система Admin

Admin не использует фон видео.

Admin фон:
- светлый
- чистый
- без декоративных элементов

Допустимо:
- светло-серый фон
- белые карточки
- мягкие тени

Недопустимо:
- градиенты
- фоновые видео
- overlay

---

### 15.4 Структура Admin

Admin всегда имеет:

1. Верхнюю панель (Header)
2. Основной контейнер
3. Карточки (Cards)
4. Таблицы
5. Модальные окна

---

### 15.5 Компоненты Admin

- Таблицы с сортировкой
- Статусы (active / expired / vip)
- Цветовые индикаторы
- Фильтры
- Экспорт
- Модалки подтверждения

---

### 15.6 Поведение

Admin должен быть:

- предсказуемым
- строгим
- без анимационных эффектов
- без мобильных кнопок
- без CTA-стиля клиентского интерфейса

---

### 15.7 Главное правило

Admin всегда остаётся стабильным инструментом управления.

Никаких экспериментов с визуалом.
Никаких "красивостей".
Только функциональность.

## 16. ADMIN COLOR SYSTEM (РЕАЛЬНАЯ РЕАЛИЗАЦИЯ)

### 16.1 Принцип

Admin использует фиксированную тёмную desktop-палитру.

Это не зависит от клиентских токенов.
Это отдельная визуальная зона.

Цель:
- контраст
- читаемость
- инструментальный стиль
- отсутствие декоративности

---

### 16.2 Базовые цвета (эталон текущей админки)

Фон страницы:
#1a1a2e

Вторичный фон / блоки:
#16213e

Карточки / секции:
#f8f9fa

Внутренние разделители:
#e9ecef

Текст:
#ffffff (на тёмном фоне)
#1f2937 (на светлых карточках)

---

### 16.3 Стиль блоков

Секции:

- border: 2px solid
- без сложных теней
- строгие прямоугольные формы
- минимальные визуальные эффекты

Admin не использует:
- градиенты
- фоновые видео
- декоративные overlay
- мобильные тени

---

### 16.4 Status цвета

Допустимые цвета статусов:

- Active / Paid → зелёный
- Expired / Failed → красный
- Pending → жёлтый / оранжевый
- VIP → синий / акцентный

Цвета статусов используются только внутри таблиц и бейджей.

---

### 16.5 Что запрещено

- Использовать mobile-палитру (polar, zanah и т.п.)
- Использовать скругление 40px
- Использовать mobile-buttons (52px)
- Использовать мягкие карточки с тенями как в клиентской части

Admin всегда строгий и функциональный.


## 17. ADMIN LAYOUT ARCHITECTURE

### 17.1 Принцип

Admin — desktop-first.

Это не mobile-preview.
Это не телефон в рамке.
Это полноценный вертикальный dashboard.

Админка — инструмент управления.
Простота и предсказуемость важнее визуальных эффектов.

---

### 17.2 Общая структура (каноническая)

Структура всегда одинаковая:

1. Header (верхняя панель)
2. Statistics Grid (карточки метрик)
3. Вертикальные секции (Users, Payments, Referrals, VIP, Coupons и т.д.)
4. Модальные окна (если используются)

Секции идут строго друг за другом.
Без sidebar.
Без сложной layout-сетки.

---

### 17.3 Header

Header:

- находится сверху
- занимает всю ширину
- может быть sticky (по желанию)
- содержит:
  - название админки
  - основные действия (logout, refresh и т.д.)

Scroll — стандартный (body scroll).

---

### 17.4 Statistics Grid

Блок метрик:

- grid layout
- карточки одинакового типа
- краткие числовые показатели
- без сложных интерактивных элементов

Grid адаптивный, но всегда desktop-first.

---

### 17.5 Вертикальные секции

Каждый раздел (Users, Payments, Referrals, VIP, Coupons и т.д.):

- отдельный визуальный блок
- имеет заголовок
- содержит таблицу или карточки
- отделяется от предыдущего секцией/отступом

Секции не скрываются через layout.
Навигация осуществляется прокруткой страницы.

---

### 17.6 Скролл

Scroll осуществляется по body.

Не используется:
- внутренний main-scroll
- двойной scroll
- фиксированная sidebar-логика

Header может быть sticky,
но страница остаётся одной вертикальной областью.

---

### 17.7 Масштабирование

Если добавляются новые разделы:

- они добавляются как новые вертикальные секции
- layout не меняется
- структура остаётся линейной

Если в будущем потребуется sidebar,
это будет отдельное архитектурное решение,
а не постепенная модификация текущей модели.

---

### 17.8 Что фиксировано

- Нет mobile-preview-wrapper
- Нет phone frame
- Нет sidebar
- Scroll по body
- Вертикальная структура
- Предсказуемый порядок блоков
