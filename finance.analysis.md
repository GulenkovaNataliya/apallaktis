# Финансовый Анализ — Эталонная Документация

**Файл:** `frontend/app/[locale]/finance-analysis/page.tsx`

---

## 1. СТРУКТУРА СТРАНИЦЫ

### Порядок блоков (сверху вниз):

| # | Блок | Описание |
|---|------|----------|
| 1 | ← Назад | Ссылка для возврата на dashboard |
| 2 | Заголовок | "Финансовый Анализ" |
| 3 | Период | Выбор даты начала и конца периода |
| 4 | Общая Сводка по Всем Объектам | Раскрывающийся блок со списком объектов |
| 5 | Общая Сумма Договорных Цен | Сумма contract_price всех объектов |
| 6 | Общая Сумма Дополнительных Работ | Сумма всех дополнительных работ |
| 7 | Общая Сумма Фактических Цен | Договорная + Доп. работы |
| 8 | Общий Баланс | Остаток к получению |
| 9 | Общие Расходы | Раскрывающийся блок по категориям глобальных расходов |
| 10 | Расходы по Объектам | Раскрывающийся блок по категориям расходов объектов |
| 11 | Общая Прибыль | Фактическая цена - Все расходы (зелёный = прибыль, оранжевый = убыток) |

---

## 2. ДИЗАЙН

### Цвета фона блоков:

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
| Общие Расходы (контейнер) | `var(--polar)` |
| Общие Расходы (категории) | `var(--zanah)` |
| Расходы по Объектам (контейнер) | `var(--polar)` |
| Расходы по Объектам (категории) | `var(--zanah)` |
| Общая Прибыль (прибыль) | `#25D366` (green) |
| Общая Прибыль (убыток) | `#ff6a1a` (orange) |

### Цвета текста:

| Элемент | Цвет |
|---------|------|
| ← Назад | `var(--polar)` |
| Заголовок страницы | `var(--polar)` |
| Заголовки блоков | `var(--deep-teal)` |
| Суммы (большие) | `var(--orange)` |
| Текст в Балансе (долг/закрыт) | `white` |
| Текст в Балансе (переплата) | `var(--deep-teal)` |
| Период (метки) | `var(--deep-teal)` |
| Период (даты) | `var(--orange)` |
| Номер объекта | `var(--deep-teal)` |
| Название объекта | `var(--orange)` |
| Статус объекта (открыт) | `var(--orange)` |
| Статус объекта (закрыт) | `#25D366` |
| Баланс/Прибыль в объекте | `var(--deep-teal)` |
| Счётчики объектов | `var(--deep-teal)` |

### Шрифты:

| Элемент | Размер | Вес |
|---------|--------|-----|
| Заголовок страницы | `text-2xl` | `font-bold` |
| Заголовки блоков | `text-lg` | `font-semibold` |
| Суммы (большие) | `text-2xl` | `font-bold` |
| Сумма баланса | `text-3xl` | `font-bold` |
| Статус баланса | `text-2xl` | `font-bold` |
| Период (даты) | `text-lg` | `font-bold` |
| Название объекта | `text-base` | `font-bold` |
| Статус объекта | `text-sm` | `font-semibold` |
| Счётчики | `text-sm` | normal + `opacity-70` |

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
| Период | `p-4` (16px) |
| Общая Сводка | `padding: '16px 20px'` |
| Элементы объектов | `padding: '16px 20px'` |
| Блоки сумм | `p-4` (16px) |
| Баланс | `p-4` (16px) |

### Gap между элементами:

| Контекст | Gap |
|----------|-----|
| Между блоками на странице | `gap-12` (48px) |
| Между элементами в списке объектов | `gap-4` (16px) |
| Внутри раскрывающихся блоков | `space-y-3` (12px) |

### Border:

```css
border-t (разделитель "Итого"): borderColor: 'var(--deep-teal)'
border-l-2 (раскрытые списки): borderColor: 'rgba(1, 49, 45, 0.2)'
```

---

## 4. ЭЛЕМЕНТЫ

### "← Назад":

```jsx
<p
  onClick={() => router.push(`/${locale}/dashboard`)}
  className="text-button cursor-pointer"
  style={{ color: 'var(--polar)' }}
>
  {t.backToDashboard}
</p>
```

### Заголовок:

```jsx
<h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
  {t.financeAnalysisTitle}
</h1>
```

### Блок "Период":

```jsx
<div className="btn-universal w-full flex items-center justify-center gap-4"
     style={{ minHeight: '52px', backgroundColor: 'var(--zanah)' }}>
  <span style={{ fontSize: '20px' }}>📅</span>
  <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>{t.period}:</span>
  <button
    onClick={() => openDatePicker('start')}
    className="px-3 py-1 rounded-xl"
    style={{ backgroundColor: 'var(--polar)', color: 'var(--orange)', fontWeight: 700 }}
  >
    {formatDate(startDate)}
  </button>
  <span style={{ color: 'var(--deep-teal)' }}>—</span>
  <button
    onClick={() => openDatePicker('end')}
    className="px-3 py-1 rounded-xl"
    style={{ backgroundColor: 'var(--polar)', color: 'var(--orange)', fontWeight: 700 }}
  >
    {formatDate(endDate)}
  </button>
</div>
```

### Блок "Общая Сводка по Всем Объектам":

```jsx
<div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
  {/* Заголовок с эмодзи */}
  <button
    onClick={() => setExpandedSummary(!expandedSummary)}
    className="w-full flex flex-col items-center gap-2"
  >
    <div className="flex items-center gap-2">
      <span style={{ fontSize: '20px' }}>📊</span>
      <span className="font-bold" style={{ color: 'var(--deep-teal)', fontSize: '16px' }}>
        {t.objectsSummary}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
        {t.totalObjects}: {objects.length}
      </span>
      <span style={{ color: 'var(--deep-teal)', fontSize: '18px' }}>
        {expandedSummary ? '▲' : '▼'}
      </span>
    </div>
  </button>

  {/* Счётчики */}
  <div className="flex justify-center gap-6 mt-4">
    <span className="text-sm" style={{ color: 'var(--deep-teal)' }}>
      {t.openObjects}: <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{openCount}</span>
    </span>
    <span className="text-sm" style={{ color: 'var(--deep-teal)' }}>
      {t.closedObjects}: <span style={{ color: '#25D366', fontWeight: 700 }}>{closedCount}</span>
    </span>
  </div>

  {/* Раскрывающийся список объектов */}
  {expandedSummary && (
    <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: 'var(--deep-teal)' }}>
      {objects.map((obj, index) => (
        <div
          key={obj.id}
          className="rounded-2xl"
          style={{ backgroundColor: 'var(--zanah)', padding: '16px 20px' }}
        >
          {/* Первая строка: №, Название, Статус */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
                №{index + 1}
              </span>
              <span style={{ color: 'var(--orange)', fontWeight: 700 }}>
                {obj.name}
              </span>
            </div>
            <span
              className="text-sm font-semibold px-2 py-1 rounded-lg"
              style={{
                backgroundColor: obj.status === 'closed' ? '#25D366' : 'var(--orange)',
                color: 'white'
              }}
            >
              {obj.status === 'closed' ? t.statusClosed : t.statusOpen}
            </span>
          </div>
          {/* Вторая строка: Баланс, Прибыль */}
          <div className="flex justify-between mt-2">
            <span style={{ color: 'var(--deep-teal)' }}>
              {t.balance}: <span style={{ fontWeight: 700 }}>{formatEuro(obj.balance)}</span>
            </span>
            <span style={{ color: 'var(--deep-teal)' }}>
              {t.profit}: <span style={{ fontWeight: 700 }}>{formatEuro(obj.profit)}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

### Блок "Сумма" (Договорная/Доп.работы/Фактическая):

```jsx
<div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
  <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
    {t.totalContractPrices}
  </h2>
  <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
    {formatEuro(totalContractPrices)}
  </p>
</div>
```

### Блок "Общий Баланс":

```jsx
<div className="rounded-2xl p-4 text-center" style={{
  backgroundColor: balanceStatus === 'debt' ? '#ff6a1a' :
                   balanceStatus === 'closed' ? '#25D366' : 'var(--zanah)'
}}>
  <h2 className="text-lg font-semibold" style={{
    color: balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white'
  }}>
    {t.totalBalance}
  </h2>
  <p className="text-3xl font-bold" style={{
    color: balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white'
  }}>
    {formatEuro(totalBalance)}
  </p>
  <p className="text-2xl font-bold mt-2" style={{
    color: balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white'
  }}>
    {balanceStatus === 'debt' ? t.totalDebt :
     balanceStatus === 'closed' ? t.allPaid : t.totalOverpaid}
  </p>
</div>
```

---

## 5. JSX СТРУКТУРА

```jsx
<BackgroundPage specialPage="objekt">
  <div className="min-h-screen flex flex-col gap-12"
       style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '180px', paddingBottom: '120px' }}>

    {/* 1. Назад */}
    <p onClick={...} className="text-button cursor-pointer" style={{ color: 'var(--polar)' }}>
      {t.backToDashboard}
    </p>

    {/* 2. Заголовок */}
    <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
      {t.financeAnalysisTitle}
    </h1>

    {/* 3. Период */}
    <div className="btn-universal w-full flex items-center justify-center gap-4"
         style={{ minHeight: '52px', backgroundColor: 'var(--zanah)' }}>
      <span style={{ fontSize: '20px' }}>📅</span>
      <span style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>{t.period}:</span>
      <button ...>{formatDate(startDate)}</button>
      <span>—</span>
      <button ...>{formatDate(endDate)}</button>
    </div>

    {/* 4. Общая Сводка по Всем Объектам */}
    <div className="rounded-2xl" style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}>
      {/* Раскрывающийся блок с объектами */}
    </div>

    {/* 5. Общая Сумма Договорных Цен */}
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
        {t.totalContractPrices}
      </h2>
      <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
        {formatEuro(totalContractPrices)}
      </p>
    </div>

    {/* 6. Общая Сумма Дополнительных Работ */}
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
        {t.totalAdditionalWorks}
      </h2>
      <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
        {formatEuro(totalExtras)}
      </p>
    </div>

    {/* 7. Общая Сумма Фактических Цен */}
    <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--polar)' }}>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--deep-teal)' }}>
        {t.totalActualPrices}
      </h2>
      <p className="text-2xl font-bold" style={{ color: 'var(--orange)' }}>
        {formatEuro(totalContractPrices + totalExtras)}
      </p>
    </div>

    {/* 8. Общий Баланс */}
    <div className="rounded-2xl p-4 text-center" style={{
      backgroundColor: balanceStatus === 'debt' ? '#ff6a1a' :
                       balanceStatus === 'closed' ? '#25D366' : 'var(--zanah)'
    }}>
      <h2 style={{ color: balanceStatus === 'overpaid' ? 'var(--deep-teal)' : 'white' }}>
        {t.totalBalance}
      </h2>
      <p className="text-3xl font-bold" style={{ color: ... }}>
        {formatEuro(totalBalance)}
      </p>
      <p className="text-2xl font-bold mt-2">
        {t.totalDebt / t.allPaid / t.totalOverpaid}
      </p>
    </div>

  </div>
</BackgroundPage>
```

---

## 6. ДАННЫЕ

### Таблицы Supabase:

| Таблица | Данные |
|---------|--------|
| `objects` | Все объекты пользователя (name, contract_price, status, created_at) |
| `object_extras` | Дополнительные работы всех объектов |
| `object_payments` | Платежи всех объектов |
| `object_expenses` | Расходы всех объектов |

### Расчёт сумм:

```javascript
// Общая сумма договорных цен
totalContractPrices = objects.reduce((sum, obj) => sum + obj.contract_price, 0)

// Общая сумма дополнительных работ
totalExtras = allExtras.reduce((sum, ext) => sum + ext.amount, 0)

// Общая фактическая цена
totalActualPrices = totalContractPrices + totalExtras

// Общие платежи
totalPayments = allPayments.reduce((sum, pay) => sum + pay.amount, 0)

// Общий баланс (остаток к получению)
totalBalance = totalActualPrices - totalPayments

// Статус баланса
if (totalBalance > 0.01) balanceStatus = 'debt'      // Долг
else if (totalBalance < -0.01) balanceStatus = 'overpaid' // Переплата
else balanceStatus = 'closed'                         // Всё оплачено

// Прибыль по объекту
objectProfit = (obj.contract_price + objExtras) - objExpenses

// Баланс по объекту
objectBalance = (obj.contract_price + objExtras) - objPayments
```

### Фильтрация по периоду:

```javascript
// Фильтруем объекты по дате создания
const filteredObjects = objects.filter(obj => {
  const createdAt = new Date(obj.created_at);
  return createdAt >= startDate && createdAt <= endDate;
});

// Или фильтруем по дате платежей/расходов
const filteredPayments = payments.filter(pay => {
  const date = new Date(pay.date);
  return date >= startDate && date <= endDate;
});
```

---

## 7. ПЕРЕВОДЫ (messages.ts)

Ключи в `financeAnalysis`:
- `financeAnalysisTitle` — "Финансовый Анализ"
- `backToDashboard` — "← Назад"
- `period` — "Период"
- `objectsSummary` — "Общая Сводка по Всем Объектам"
- `totalObjects` — "Всего Объектов"
- `openObjects` — "Открытых"
- `closedObjects` — "Закрытых"
- `statusOpen` — "Открыт"
- `statusClosed` — "Закрыт"
- `balance` — "Баланс"
- `profit` — "Прибыль"
- `totalContractPrices` — "Общая Сумма Договорных Цен"
- `totalAdditionalWorks` — "Общая Сумма Дополнительных Работ"
- `totalActualPrices` — "Общая Сумма Фактических Цен"
- `totalBalance` — "Общий Баланс"
- `totalDebt` — "Долг"
- `allPaid` — "Всё оплачено"
- `totalOverpaid` — "Переплата"

---

## 8. КЛЮЧЕВЫЕ ПРАВИЛА

1. **Gap между блоками:** всегда `gap-12` (48px)
2. **Padding внутри блоков:** `padding: '16px 20px'` или `p-4`
3. **Высота кнопок:** `minHeight: '52px'`
4. **Border-radius:** `rounded-2xl` (16px)
5. **Цвет заголовков:** `var(--deep-teal)`
6. **Цвет сумм:** `var(--orange)` для основных
7. **Раскрывающиеся блоки:** 2 строки по центру (`flex flex-col items-center`)
8. **Баланс:** оранжевый (долг), зелёный (оплачено), zanah (переплата)
