# Финансы Объекта — Эталонная Документация

**Файл:** `frontend/app/[locale]/objects/[id]/finance/page.tsx`

---

## 1. СТРУКТУРА СТРАНИЦЫ

### Порядок блоков (сверху вниз):

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

---

## 2. ДИЗАЙН

### Цвета фона блоков:

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

### Цвета текста:

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

### Шрифты:

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

---

## 3. ОТСТУПЫ И РАССТОЯНИЯ

### Контейнер страницы:

```css
paddingTop: '180px'
paddingBottom: '120px'
paddingLeft: '40px'
paddingRight: '40px'
gap: 'gap-12' (48px между блоками)
```

### Внутри блоков:

| Блок | Padding |
|------|---------|
| Договорная/Фактическая Цена | `p-4` (16px) |
| Дополнительные Работы | `padding: '16px 20px'` |
| Оплата | `padding: '16px 20px'` |
| Баланс | `p-4` (16px) |
| Категории расходов | `padding: '16px 20px'` |
| Элементы внутри блоков | `padding: '16px 20px'` |
| Итого Расходов | `px-4` (16px horizontal) |

### Gap между элементами:

| Контекст | Gap |
|----------|-----|
| Между блоками на странице | `gap-12` (48px) |
| Между элементами в списке | `gap-4` (16px) |
| Между категориями расходов | `gap-12` (48px) |
| Внутри раскрывающихся блоков | `space-y-3` (12px) |

### Border:

```css
border-t (разделитель "Итого"): borderColor: 'var(--deep-teal)'
border-l-2 (раскрытые списки): borderColor: 'rgba(1, 49, 45, 0.2)'
```

---

## 4. КНОПКИ

### Размеры:

| Кнопка | Height | Width |
|--------|--------|-------|
| "+ Добавить" | `minHeight: '52px'` | `w-full` |
| "Расчёт Прибыли" | `minHeight: '52px'` | `w-full` |
| "Удалить" | `minHeight: '52px'` | auto (`px-4 py-2`) |
| Название объекта | `minHeight: '52px'` | `w-full` |

### Стили кнопок:

```jsx
// Кнопка "+ Добавить"
className="btn-universal w-full text-button"
style={{
  minHeight: '52px',
  backgroundColor: 'var(--zanah)',
  color: 'var(--deep-teal)'
}}

// Кнопка "Расчёт Прибыли"
className="btn-universal w-full text-lg font-semibold"
style={{
  minHeight: '52px',
  backgroundColor: '#ff6a1a',
  color: 'white'
}}

// Кнопка "Удалить"
className="text-button px-4 py-2 rounded-2xl font-semibold"
style={{
  backgroundColor: '#ff6a1a',
  color: 'white',
  minHeight: '52px'
}}
```

### Border-radius:

- Все блоки: `rounded-2xl` (16px)
- Кнопки: `btn-universal` или `rounded-2xl`

---

## 5. ЭЛЕМЕНТЫ

### "← Назад":

```jsx
<p
  onClick={() => router.push(`/${locale}/objects`)}
  className="text-button cursor-pointer"
  style={{ color: 'var(--polar)' }}
>
  {t.backToObject}
</p>
```
- Это `<p>`, не `<button>`
- Кликабельный (`cursor-pointer`)
- Без marginBottom (gap-12 от контейнера)

### Заголовки блоков:

```jsx
// С эмодзи (раскрывающиеся блоки)
<span style={{ fontSize: '20px' }}>💰</span>
<span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
  {t.paymentReceived}
</span>

// Без эмодзи (обычные блоки)
<h2 className="text-lg font-semibold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>
  {t.payment}
</h2>
```

### Раскрывающиеся блоки (Поступившие Оплаты, Платежи по Расходам):

```jsx
// Всегда 2 строки, по центру
<button className="w-full flex flex-col items-center gap-2">
  <div className="flex items-center gap-2">
    <span style={{ fontSize: '20px' }}>💰</span>
    <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
      {t.paymentReceived}
    </span>
  </div>
  <div className="flex items-center gap-3">
    <span className="text-lg font-bold" style={{ color: 'var(--deep-teal)' }}>
      {formatEuro(finance.totalPayments)}
    </span>
    <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
      {expandedPaymentReceived ? '▲' : '▼'}
    </span>
  </div>
</button>
```

### Пустые состояния:

```jsx
<p className="text-center text-button" style={{ color: 'var(--orange)' }}>
  {t.noAdditionalWorks}
</p>
```

### Иконки метода ввода:

```jsx
{expense.inputMethod === 'voice' ? '🎤' : expense.inputMethod === 'photo' ? '📸' : '⌨️'}
```

---

## 6. ДАННЫЕ

### Таблицы Supabase:

| Таблица | Данные |
|---------|--------|
| `objects` | Информация об объекте (name, contract_price, status) |
| `object_extras` | Дополнительные работы |
| `object_payments` | Платежи от клиента |
| `object_expenses` | Расходы по объекту |
| `expense_categories` | Категории расходов |
| `payment_methods` | Способы оплаты |

### Расчёт сумм:

```javascript
// Баланс
balance = contractPrice + totalAdditionalWorks - totalPayments

// Статус баланса
if (balance > 0.01) balanceStatus = 'debt'      // Долг
else if (balance < -0.01) balanceStatus = 'overpaid' // Переплата
else balanceStatus = 'closed'                    // Закрыт

// Фактическая цена
actualPrice = contractPrice + totalAdditionalWorks

// Прибыль
profit = actualPrice - totalExpenses
```

### Группировка:

```javascript
// По категориям
const groupByCategory = () => {
  const groups: { [key: string]: ObjectExpense[] } = {};
  expenses.forEach(expense => {
    const catId = expense.categoryId || 'unknown';
    if (!groups[catId]) groups[catId] = [];
    groups[catId].push(expense);
  });
  return groups;
};

// По способам оплаты
const groupByPaymentMethod = () => {
  const groups: { [key: string]: ObjectExpense[] } = {};
  expenses.forEach(expense => {
    const pmId = expense.paymentMethodId || 'unknown';
    if (!groups[pmId]) groups[pmId] = [];
    groups[pmId].push(expense);
  });
  return groups;
};
```

---

## 7. JSX СТРУКТУРА (MAIN VIEW)

```jsx
<BackgroundPage specialPage="objekt">
  <div className="min-h-screen flex flex-col gap-12"
       style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>

    {/* 1. Назад */}
    <p onClick={...} className="text-button cursor-pointer" style={{ color: 'var(--polar)' }}>
      {t.backToObject}
    </p>

    {/* 2. Заголовок */}
    <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
      {t.objectFinanceTitle}
    </h1>

    {/* 3. Название объекта */}
    <div className="btn-universal w-full text-2xl font-bold flex items-center justify-center gap-2"
         style={{ minHeight: '52px', backgroundColor: 'var(--zanah)' }}>
      <span style={{ color: 'var(--deep-teal)' }}>{t.objectLabel}</span>
      <span style={{ color: 'var(--orange)' }}>{object?.name}</span>
    </div>

    {/* 4. Договорная Цена */}
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>{t.contractPrice}</h2>
      <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>{formatEuro(...)}</p>
    </div>

    {/* 5. Дополнительные Работы */}
    <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
      <h2 className="text-lg font-semibold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>...</h2>
      {/* Список или пустое состояние */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--deep-teal)' }}>
        {/* Итого */}
      </div>
    </div>

    {/* 6. Кнопка + Добавить (доп. работу) */}
    <button className="btn-universal w-full text-button"
            style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}>
      + {t.addButton}
    </button>

    {/* 7. Фактическая Цена */}
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>{t.actualPrice}</h2>
      <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>{formatEuro(...)}</p>
    </div>

    {/* 8. Оплата */}
    <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
      {/* Аналогично Дополнительным Работам */}
    </div>

    {/* 9. Кнопка + Добавить (платёж) */}
    <button>...</button>

    {/* 10. Баланс */}
    <div className="rounded-2xl p-4 text-center" style={{
      backgroundColor: balanceStatus === 'debt' ? '#ff6a1a' :
                       balanceStatus === 'closed' ? '#25D366' : 'var(--zanah)'
    }}>
      <h2 style={{ color: balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white' }}>{t.balance}</h2>
      <p className="text-3xl font-bold" style={{ color: ... }}>{formatEuro(balance)}</p>
      <p className="text-2xl font-bold mt-2">{t.debt / t.closed / t.overpaid}</p>
    </div>

    {/* 11-19. Секция Расходов */}
    <div className="flex flex-col gap-12">
      <h2 className="text-xl font-bold text-center" style={{ color: 'var(--polar)' }}>{t.expenses}</h2>

      {/* Кнопка + Добавить расход */}
      <button>...</button>

      {/* Анализ по категориям */}
      <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--polar)' }}>...</h3>
      <div className="flex flex-col gap-12">
        {/* Категории */}
      </div>

      {/* Итого Расходов */}
      <div className="btn-universal w-full text-lg flex justify-between items-center px-4"
           style={{ minHeight: '52px', backgroundColor: 'var(--zanah)', color: 'var(--deep-teal)' }}>
        <span className="font-semibold">{t.totalExpensesTitle}</span>
        <span className="font-bold" style={{ color: 'var(--orange)' }}>{formatEuro(...)}</span>
      </div>

      {/* Платёжный Анализ */}
      <div className="flex flex-col gap-12">
        <h3>...</h3>
        {/* Оплата Получена */}
        {/* Расходы Оплачены */}
      </div>

      {/* Расчёт Прибыли */}
      <button className="btn-universal w-full text-lg font-semibold"
              style={{ minHeight: '52px', backgroundColor: '#ff6a1a', color: 'white' }}>
        {t.calculateProfit}
      </button>
    </div>

  </div>
</BackgroundPage>
```

---

## 8. VIEWS (РЕЖИМЫ СТРАНИЦЫ)

| View | Описание |
|------|----------|
| `main` | Основной вид с финансами |
| `add-work` | Форма добавления доп. работы |
| `add-payment` | Форма добавления платежа |
| `add-expense` | Форма добавления расхода |

---

## 9. ПЕРЕВОДЫ (messages.ts)

Ключи в `finance`:
- `objectFinanceTitle`, `objectLabel`
- `contractPrice`, `actualPrice`
- `payment`, `balance`, `expenses`
- `addButton`, `delete`, `total`
- `noAdditionalWorks`, `noPayments`, `noExpenses`
- `debt`, `closed`, `overpaid`
- `totalExpensesTitle`
- `paymentAnalysis`, `expenseAnalysisByCategory`
- `paymentReceived`, `expensesPaid`
- `calculateProfit`, `profitExpenses`, `profitResult`
- `closeProjectQuestion`, `objectClosed`
- `backToObject`
- `confirmDeleteWork`, `confirmDeletePayment`, `confirmDeleteExpense`

---

## 10. КЛЮЧЕВЫЕ ПРАВИЛА

1. **Gap между блоками:** всегда `gap-12` (48px)
2. **Padding внутри блоков:** `padding: '16px 20px'` или `p-4`
3. **Высота кнопок:** `minHeight: '52px'`
4. **Border-radius:** `rounded-2xl` (16px)
5. **Цвет заголовков:** `var(--deep-teal)`
6. **Цвет сумм:** `var(--orange)` для основных, `var(--deep-teal)` для вторичных
7. **Раскрывающиеся блоки:** 2 строки по центру (`flex flex-col items-center`)
8. **Пустые состояния:** оранжевый текст по центру
