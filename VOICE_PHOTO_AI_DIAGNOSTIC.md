# AI Auto-fill Diagnostic (Voice + Photo)

---

# ЧАСТЬ 1: VOICE (Голосовой ввод)

## 1.1 ПРОМПТ ДЛЯ LLM (Voice)

**Файл:** `frontend/app/api/analyze-voice/route.ts`

```
You are analyzing a voice input about an expense. The user spoke in ${language}. Extract expense information and return ONLY a valid JSON object (no markdown, no explanation).

IMPORTANT: Keep the "name" and "description" fields in the SAME LANGUAGE as the user's input (${language}). Do NOT translate to English.

Expected JSON format:
{
  "name": "Store name or what was purchased (in user's language)",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "description": "Brief description (in user's language)",
  "confidence": "high/medium/low",
  "suggestedCategory": "groceries/transport/utilities/entertainment/healthcare/education/other",
  "paymentMethod": "cash/card/bank/null"
}

Rules:
1. Today is ${todayStr}
2. Date words: "today/сегодня/σήμερα/bugün" = ${todayStr}, "yesterday/вчера/χθες" = ${yesterdayStr}
3. Convert relative dates to YYYY-MM-DD
4. Extract numbers for amount (евро/euro/ευρώ/€ = EUR currency)
5. Categories:
   - Supermarkets, food, Лидл, Σκλαβενίτης, магазин → "groceries"
   - Gas, бензин, parking, taxi, bus, метро → "transport"
   - Electric, вода, телефон, интернет, ДЕΗ → "utilities"
   - Restaurant, кафе, cinema, кино → "entertainment"
   - Pharmacy, аптека, doctor, врач → "healthcare"
   - School, курсы, books, книги → "education"
   - Everything else → "other"
6. If date not mentioned, use: ${todayStr}
7. If amount unclear, use: null
8. "name" should be the store/place name if mentioned, otherwise what was purchased
9. ALWAYS try to extract amount - look for numbers followed by currency words
10. Payment method:
    - "наличные/cash/μετρητά/кэш" → "cash"
    - "карта/картой/card/κάρτα/credit/debit" → "card"
    - "перевод/bank/transfer/τράπεζα" → "bank"
    - If not mentioned → null

Example input: "вчера в Лидле потратил 45 евро картой на продукты"
Example output: {"name":"Лидл","amount":45,"date":"${yesterdayStr}","description":"продукты","confidence":"high","suggestedCategory":"groceries","paymentMethod":"card"}

Voice input to analyze: "${text}"
```

## 1.2 ПРИМЕР ОТВЕТА ОТ LLM (Voice)

```json
{
  "success": true,
  "data": {
    "name": "Лидл",
    "amount": 45,
    "date": "2026-01-17",
    "description": "продукты",
    "confidence": "high",
    "suggestedCategory": "groceries",
    "paymentMethod": "card"
  }
}
```

**Допустимые значения:**
- `suggestedCategory`: `"groceries"` | `"transport"` | `"utilities"` | `"entertainment"` | `"healthcare"` | `"education"` | `"other"`
- `paymentMethod`: `"cash"` | `"card"` | `"bank"` | `null`

## 1.3 КОД ПРИМЕНЕНИЯ К ФОРМЕ (Voice)

**Файл:** `frontend/app/[locale]/global-expenses/page.tsx`, строки 625-718

```typescript
// Автозаполнение формы - используем данные если они есть
setFormData(prev => ({
  ...prev,
  name: data.name && data.name !== 'null' ? data.name.slice(0, 10) : prev.name,
  amount: data.amount !== null && data.amount !== undefined ? data.amount : prev.amount,
  description: data.description || transcript,
  date: data.date || prev.date,
}));

// Выбор категории
if (categories.length > 0) {
  const categoryMap: Record<string, string[]> = {
    groceries: ['продукт', 'grocery', 'τρόφιμ', 'food', 'supermarket', 'супермаркет', 'магазин', 'лидл', 'lidl', 'aldi', 'σκλαβενίτ', 'еда', 'покупк'],
    transport: ['транспорт', 'transport', 'μεταφορ', 'fuel', 'бензин', 'benzin', 'βενζίν', 'parking', 'парковк', 'такси', 'taxi', 'автобус', 'metro', 'метро', 'горюч'],
    utilities: ['коммунал', 'utilit', 'κοινωφελ', 'electric', 'свет', 'электрич', 'вода', 'water', 'νερό', 'ρεύμα', 'телефон', 'phone', 'internet', 'интернет', 'δεη', 'счет', 'счёт'],
    entertainment: ['развлеч', 'entertain', 'ψυχαγωγ', 'restaurant', 'рестор', 'кафе', 'cafe', 'cinema', 'кино', 'σινεμά', 'εστιατόρ', 'отдых'],
    healthcare: ['здоров', 'health', 'υγεί', 'pharmacy', 'аптек', 'φαρμακ', 'doctor', 'врач', 'γιατρ', 'больниц', 'hospital', 'νοσοκομ', 'лекарств', 'medicine', 'медиц'],
    education: ['образован', 'educat', 'εκπαίδευ', 'school', 'школ', 'σχολ', 'курс', 'course', 'book', 'книг', 'βιβλί', 'универ', 'учеб'],
  };

  let matchedCategory: ExpenseCategory | undefined;

  // Сначала ищем по suggestedCategory от AI
  if (data.suggestedCategory) {
    const keywords = categoryMap[data.suggestedCategory] || [];
    matchedCategory = categories.find(cat =>
      keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
    );
  }

  // Если не нашли, ищем по имени из data.name
  if (!matchedCategory && data.name) {
    matchedCategory = categories.find(cat =>
      cat.name.toLowerCase().includes(data.name.toLowerCase()) ||
      data.name.toLowerCase().includes(cat.name.toLowerCase())
    );
  }

  // Если всё ещё не нашли, берем первую категорию
  if (!matchedCategory) {
    matchedCategory = categories[0];
  }

  if (matchedCategory) {
    setFormData(prev => ({ ...prev, categoryId: matchedCategory!.id }));
  }
}

// Выбор способа оплаты
if (paymentMethods.length > 0) {
  let matchedPayment: PaymentMethod | undefined;

  if (data.paymentMethod) {
    // Ищем по типу
    if (data.paymentMethod === 'card') {
      matchedPayment = paymentMethods.find(pm =>
        pm.type === 'credit_card' || pm.type === 'debit_card'
      );
    } else if (data.paymentMethod === 'cash') {
      matchedPayment = paymentMethods.find(pm => pm.type === 'cash');
    } else if (data.paymentMethod === 'bank') {
      matchedPayment = paymentMethods.find(pm => pm.type === 'bank_account');
    }

    // Если не нашли по типу, ищем по имени
    if (!matchedPayment) {
      const paymentKeywords: Record<string, string[]> = {
        cash: ['наличн', 'cash', 'μετρητ', 'кэш'],
        card: ['карт', 'card', 'κάρτ', 'credit', 'debit', 'visa', 'master'],
        bank: ['банк', 'bank', 'τράπεζ', 'перевод', 'transfer', 'iban', 'счет', 'счёт'],
      };
      const keywords = paymentKeywords[data.paymentMethod] || [];
      matchedPayment = paymentMethods.find(pm =>
        keywords.some(kw => pm.name.toLowerCase().includes(kw.toLowerCase()))
      );
    }
  }

  // Если AI не предложил или не нашли, берем первый способ оплаты
  if (!matchedPayment) {
    matchedPayment = paymentMethods[0];
  }

  if (matchedPayment) {
    setFormData(prev => ({ ...prev, paymentMethodId: matchedPayment!.id }));
  }
}
```

---

# ЧАСТЬ 2: PHOTO (Фото чека)

## 2.1 ПРОМПТ ДЛЯ LLM (Photo)

**Файл:** `frontend/app/api/analyze-receipt/route.ts`

```
You are analyzing a receipt/invoice image. Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):

{
  "name": "Store/business name or description of purchase",
  "amount": 0.00,
  "date": "YYYY-MM-DD",
  "description": "Brief description of items purchased",
  "confidence": "high/medium/low",
  "suggestedCategory": "groceries/transport/utilities/entertainment/healthcare/education/other"
}

Important rules:
1. The receipt is likely in ${language}, but may be in other languages
2. For "amount": extract the TOTAL amount (look for "ΣΥΝΟΛΟ", "TOTAL", "ИТОГО", "Σύνολο", etc.)
3. For "date": convert to YYYY-MM-DD format. If no date visible, use null
4. For "name": use the store name or merchant name
5. For "description": briefly list main items if visible
6. For "suggestedCategory": suggest based on the type of store/items:
   - Supermarkets, food stores → "groceries"
   - Gas stations, parking, taxis → "transport"
   - Electric, water, phone bills → "utilities"
   - Restaurants, cinemas, entertainment → "entertainment"
   - Pharmacies, doctors → "healthcare"
   - Schools, courses, books → "education"
   - Everything else → "other"
7. If you cannot read something clearly, use null for that field
8. Return ONLY the JSON object, nothing else

Analyze this receipt image now:
```

**ВАЖНО:** Фото промпт НЕ включает `paymentMethod` — только voice включает.

## 2.2 ПРИМЕР ОТВЕТА ОТ LLM (Photo)

```json
{
  "success": true,
  "data": {
    "name": "ΣΚΛΑΒΕΝΙΤΗΣ",
    "amount": 23.45,
    "date": "2026-01-18",
    "description": "γάλα, ψωμί, τυρί",
    "confidence": "high",
    "suggestedCategory": "groceries"
  }
}
```

**Допустимые значения:**
- `suggestedCategory`: `"groceries"` | `"transport"` | `"utilities"` | `"entertainment"` | `"healthcare"` | `"education"` | `"other"`
- `paymentMethod`: **НЕТ** (не возвращается для фото)

## 2.3 КОД ПРИМЕНЕНИЯ К ФОРМЕ (Photo)

**Файл:** `frontend/app/[locale]/global-expenses/page.tsx`, строки 527-555

```typescript
// Автозаполнение формы
setFormData(prev => ({
  ...prev,
  name: data.name ? data.name.slice(0, 10) : prev.name,
  amount: data.amount || prev.amount,
  description: data.description || prev.description,
  date: data.date || prev.date,
}));

// Попытка найти подходящую категорию
if (data.suggestedCategory && categories.length > 0) {
  const categoryMap: Record<string, string[]> = {
    groceries: ['продукты', 'groceries', 'τρόφιμα', 'food', 'supermarket', 'супермаркет'],
    transport: ['транспорт', 'transport', 'μεταφορά', 'fuel', 'бензин', 'parking'],
    utilities: ['коммунальные', 'utilities', 'κοινωφελείς', 'electric', 'water', 'phone'],
    entertainment: ['развлечения', 'entertainment', 'ψυχαγωγία', 'restaurant', 'cinema'],
    healthcare: ['здоровье', 'healthcare', 'υγεία', 'pharmacy', 'аптека', 'doctor'],
    education: ['образование', 'education', 'εκπαίδευση', 'school', 'books', 'курсы'],
  };

  const keywords = categoryMap[data.suggestedCategory] || [];
  const matchedCategory = categories.find(cat =>
    keywords.some(kw => cat.name.toLowerCase().includes(kw.toLowerCase()))
  );

  if (matchedCategory) {
    setFormData(prev => ({ ...prev, categoryId: matchedCategory.id }));
  }
}

setInputMethod('photo');
```

**ВАЖНО:** Для фото НЕТ выбора способа оплаты и НЕТ fallback на первую категорию!

---

# ЧАСТЬ 3: ОБЩИЕ ТИПЫ

## 3.1 ExpenseCategory

```typescript
interface ExpenseCategory {
  id: string;           // UUID
  userId: string;
  name: string;         // Произвольное имя, заданное пользователем
  createdAt: Date;
  updatedAt: Date;
}
```

## 3.2 PaymentMethod

```typescript
type PaymentMethodType = 'cash' | 'credit_card' | 'debit_card' | 'bank_account';

interface PaymentMethod {
  id: string;           // UUID
  userId: string;
  type: PaymentMethodType;  // ← ВАЖНО: тип метода
  name: string;             // Произвольное имя
  lastFourDigits?: string;
  iban?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 3.3 formData

```typescript
const [formData, setFormData] = useState({
  categoryId: expense?.categoryId || (categories[0]?.id || ''),
  paymentMethodId: expense?.paymentMethodId || (paymentMethods[0]?.id || ''),
  name: expense?.name || '',
  amount: expense?.amount || 0,
  description: expense?.description || '',
  date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
});
```

---

# ЧАСТЬ 4: UI КОМПОНЕНТЫ

## 4.1 Category Select

```jsx
<select
  value={formData.categoryId}
  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
>
  {categories.map(cat => (
    <option key={cat.id} value={cat.id}>{cat.name}</option>
  ))}
</select>
```

## 4.2 Payment Method Select

```jsx
<select
  value={formData.paymentMethodId}
  onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
>
  {paymentMethods.map((method) => (
    <option key={method.id} value={method.id}>{method.name}</option>
  ))}
</select>
```

---

# ЧАСТЬ 5: РАЗЛИЧИЯ МЕЖДУ VOICE И PHOTO

| Параметр | Voice | Photo |
|----------|-------|-------|
| API endpoint | `/api/analyze-voice` | `/api/analyze-receipt` |
| Возвращает paymentMethod | ✅ Да | ❌ Нет |
| Fallback на первую категорию | ✅ Да | ❌ Нет |
| Fallback на первый способ оплаты | ✅ Да | ❌ Нет |
| Ключевые слова для категорий | Расширенный список | Базовый список |

---

# ЧАСТЬ 6: ФАЙЛЫ

- `frontend/app/api/analyze-voice/route.ts` — API для голоса
- `frontend/app/api/analyze-receipt/route.ts` — API для фото
- `frontend/app/[locale]/global-expenses/page.tsx` — страница с формой
- `frontend/types/globalExpense.ts` — типы категорий и расходов
- `frontend/types/paymentMethod.ts` — типы способов оплаты
- `frontend/lib/messages.ts` — переводы на 8 языков

---

# ЧАСТЬ 7: УВЕДОМЛЕНИЕ "УДАЛИТЕ ФОТО"

## 7.1 Описание

Когда пользователь загружает фото чека, под фотографией отображается предупреждение:
**"Удалите фото, чтобы сохранить"**

Это связано с тем, что фото не хранится в базе данных — только анализируется для автозаполнения.

## 7.2 Стиль

```css
color: var(--orange)
fontSize: 18px
fontWeight: 600
marginTop: 12px
textAlign: center
```

## 7.3 Переводы (deletePhotoToSave)

| Язык | Перевод |
|------|---------|
| el | Διαγράψτε τη φωτογραφία για να αποθηκεύσετε |
| ru | Удалите фото, чтобы сохранить |
| uk | Видаліть фото, щоб зберегти |
| sq | Fshi foton për të ruajtur |
| bg | Изтрийте снимката, за да запазите |
| ro | Ștergeți fotografia pentru a salva |
| en | Delete photo to save |
| ar | احذف الصورة للحفظ |

## 7.4 Код уведомления

**Файл:** `frontend/app/[locale]/global-expenses/page.tsx`

Уведомление отображается внизу фотографии с полупрозрачным тёмным фоном:

```tsx
{!isAnalyzing && (
  <p className="absolute bottom-0 left-0 right-0 text-center py-2 rounded-b-2xl"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--orange)', fontSize: '18px', fontWeight: 600 }}>
    {t.deletePhotoToSave}
  </p>
)}
```
