# AI Auto-fill Diagnostic (Voice + Photo)////

**Последнее обновление:** 2026-01-18

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
  "suggestedCategory": "materials/tools/work/groceries/transport/utilities/entertainment/healthcare/education/other",
  "paymentMethod": "cash/card/bank/null"
}

Rules:
1. Today is ${todayStr}
2. Date words: "today/сегодня/σήμερα/bugün" = ${todayStr}, "yesterday/вчера/χθες" = ${yesterdayStr}
3. Convert relative dates to YYYY-MM-DD
4. Extract numbers for amount (евро/euro/ευρώ/€ = EUR currency)
5. Categories:
   - Materials, supplies, paint, cement, wood, tiles, pipes, cables, υλικά, материалы → "materials"
   - Tools, equipment, drill, hammer, machines, εργαλεία, инструменты → "tools"
   - Work, services, labor, subcontract, repair, installation, εργασία, работа, услуги → "work"
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
- `suggestedCategory`: `"materials"` | `"tools"` | `"work"` | `"groceries"` | `"transport"` | `"utilities"` | `"entertainment"` | `"healthcare"` | `"education"` | `"other"`
- `paymentMethod`: `"cash"` | `"card"` | `"bank"` | `null`

## 1.3 КОД ПРИМЕНЕНИЯ К ФОРМЕ (Voice)

**Файл:** `frontend/app/[locale]/global-expenses/page.tsx`

### categoryMap (10 категорий, 8 языков)

```typescript
const categoryMap: Record<string, string[]> = {
  // === КАТЕГОРИИ ДЛЯ МАСТЕРОВ ===
  materials: [
    'material', 'supply', 'supplies', 'paint', 'cement', 'wood', 'lumber', 'tile', 'pipe', 'wire', 'cable',
    'υλικ', 'μπογιά', 'χρώμα', 'τσιμέντο', 'ξύλο', 'πλακάκ', 'σωλήν', 'καλώδ', 'προμήθ',
    'материал', 'краск', 'цемент', 'дерев', 'древес', 'плитк', 'труб', 'провод', 'кабел', 'гипс', 'шпакл',
    'матеріал', 'фарб', 'цемент', 'дерев', 'плитк', 'труб', 'провід', 'кабел', 'гіпс', 'шпакл',
    'материал', 'боя', 'цимент', 'дърв', 'плочк', 'тръб', 'кабел', 'гипс',
    'material', 'vopsea', 'ciment', 'lemn', 'țiglă', 'țeavă', 'cablu', 'gips',
    'material', 'bojë', 'çimento', 'dru', 'pllakë', 'tub', 'kabllo', 'gips',
    'مواد', 'طلاء', 'أسمنت', 'خشب', 'بلاط', 'أنبوب', 'كابل', 'جبس'
  ],
  tools: [
    'tool', 'equipment', 'drill', 'hammer', 'saw', 'screwdriver', 'machine',
    'εργαλεί', 'τρυπάνι', 'σφυρί', 'πριόνι', 'κατσαβίδι', 'μηχάνημα',
    'инструмент', 'оборудован', 'дрель', 'молоток', 'пила', 'отвёртк', 'отвертк', 'станок', 'шуруповёрт',
    'інструмент', 'обладнан', 'дриль', 'молоток', 'пилк', 'викрутк', 'станок', 'шуруповерт',
    'инструмент', 'оборудван', 'бормашин', 'чук', 'трион', 'отвертк',
    'unealtă', 'sculă', 'echipament', 'bormaşină', 'ciocan', 'fierăstrău', 'şurubelniţă',
    'vegël', 'pajisje', 'trapan', 'çekiç', 'sharrë', 'kaçavidë',
    'أداة', 'معدات', 'مثقاب', 'مطرقة', 'منشار', 'مفك'
  ],
  work: [
    'work', 'service', 'labor', 'subcontract', 'contractor', 'worker', 'job', 'repair',
    'εργασί', 'υπηρεσί', 'εργάτ', 'υπεργολάβ', 'επισκευ', 'δουλει',
    'работ', 'услуг', 'субподряд', 'подрядчик', 'рабочи', 'ремонт', 'монтаж', 'установк',
    'робот', 'послуг', 'субпідряд', 'підрядник', 'робітник', 'ремонт', 'монтаж', 'встановл',
    'работ', 'услуг', 'подизпълнител', 'работник', 'ремонт', 'монтаж',
    'muncă', 'serviciu', 'subcontract', 'contractor', 'lucrător', 'reparație', 'montaj',
    'punë', 'shërbim', 'nënkontratë', 'kontraktor', 'punëtor', 'riparim', 'montim',
    'عمل', 'خدمة', 'مقاول', 'عامل', 'إصلاح', 'تركيب'
  ],
  // === СТАНДАРТНЫЕ КАТЕГОРИИ ===
  groceries: [
    'grocery', 'food', 'supermarket', 'shop', 'store',
    'τρόφιμ', 'σούπερ', 'μαγαζί', 'σκλαβενίτ', 'λιδλ',
    'продукт', 'еда', 'магазин', 'супермаркет', 'лидл', 'покупк',
    'продукт', 'їжа', 'магазин', 'супермаркет',
    'храна', 'магазин', 'супермаркет', 'продукт',
    'aliment', 'mâncare', 'magazin', 'supermarket',
    'ushqim', 'dyqan', 'supermarket',
    'طعام', 'بقالة', 'سوبرماركت', 'متجر'
  ],
  transport: [
    'transport', 'fuel', 'gas', 'parking', 'taxi', 'bus', 'metro', 'petrol', 'diesel',
    'μεταφορ', 'βενζίν', 'καύσιμ', 'πάρκινγκ', 'ταξί', 'λεωφορ', 'μετρό', 'πετρέλαιο', 'ντίζελ',
    'транспорт', 'бензин', 'топливо', 'парковк', 'такси', 'автобус', 'метро', 'горюч', 'дизель', 'солярк',
    'транспорт', 'бензин', 'паливо', 'парковк', 'таксі', 'автобус', 'метро', 'дизель',
    'транспорт', 'бензин', 'гориво', 'паркинг', 'такси', 'автобус', 'метро', 'дизел',
    'transport', 'benzină', 'combustibil', 'parcare', 'taxi', 'autobuz', 'metrou', 'motorină',
    'transport', 'benzinë', 'karburant', 'parking', 'taksi', 'autobus', 'metro', 'naftë',
    'نقل', 'بنزين', 'وقود', 'موقف', 'تاكسي', 'باص', 'مترو', 'ديزل'
  ],
  utilities: [
    'utilit', 'electric', 'water', 'phone', 'internet', 'bill',
    'κοινωφελ', 'ρεύμα', 'νερό', 'τηλέφωνο', 'ίντερνετ', 'δεη', 'λογαριασμ',
    'коммунал', 'электрич', 'свет', 'вода', 'телефон', 'интернет', 'счет', 'счёт',
    'комунал', 'електрик', 'світло', 'вода', 'телефон', 'інтернет', 'рахунок',
    'комунал', 'електрич', 'ток', 'вода', 'телефон', 'интернет', 'сметка',
    'utilități', 'electric', 'apă', 'telefon', 'internet', 'factură',
    'komunal', 'elektrik', 'ujë', 'telefon', 'internet', 'faturë',
    'مرافق', 'كهرباء', 'ماء', 'هاتف', 'إنترنت', 'فاتورة'
  ],
  entertainment: [
    'entertain', 'restaurant', 'cafe', 'cinema', 'movie', 'leisure',
    'ψυχαγωγ', 'εστιατόρ', 'καφέ', 'σινεμά', 'ταινία',
    'развлеч', 'рестор', 'кафе', 'кино', 'фильм', 'отдых',
    'розваг', 'рестор', 'кафе', 'кіно', 'фільм', 'відпочин',
    'развлеч', 'рестор', 'кафе', 'кино', 'филм', 'отдих',
    'divertisment', 'restaurant', 'cafenea', 'cinema', 'film',
    'argëtim', 'restorant', 'kafe', 'kinema', 'film',
    'ترفيه', 'مطعم', 'مقهى', 'سينما', 'فيلم'
  ],
  healthcare: [
    'health', 'pharmacy', 'doctor', 'hospital', 'medicine', 'medical',
    'υγεί', 'φαρμακ', 'γιατρ', 'νοσοκομ', 'φάρμακο',
    'здоров', 'аптек', 'врач', 'больниц', 'лекарств', 'медиц',
    'здоров', 'аптек', 'лікар', 'лікарн', 'ліки', 'медиц',
    'здрав', 'аптек', 'лекар', 'болниц', 'лекарств', 'медиц',
    'sănătate', 'farmacie', 'doctor', 'spital', 'medicament', 'medical',
    'shëndet', 'farmaci', 'doktor', 'spital', 'ilaç', 'mjekësor',
    'صحة', 'صيدلية', 'طبيب', 'مستشفى', 'دواء', 'طبي'
  ],
  education: [
    'educat', 'school', 'course', 'book', 'university', 'college',
    'εκπαίδευ', 'σχολ', 'μάθημα', 'βιβλί', 'πανεπιστ',
    'образован', 'школ', 'курс', 'книг', 'универ', 'учеб',
    'освіт', 'школ', 'курс', 'книг', 'універ', 'навчан',
    'образован', 'учил', 'курс', 'книг', 'универ', 'обучен',
    'educație', 'școală', 'curs', 'carte', 'universitate',
    'arsim', 'shkollë', 'kurs', 'libër', 'universitet',
    'تعليم', 'مدرسة', 'دورة', 'كتاب', 'جامعة'
  ],
};
```

### paymentKeywords (8 языков)

```typescript
const paymentKeywords: Record<string, string[]> = {
  cash: [
    'cash', 'μετρητ', 'μετρητά', 'наличн', 'наличные', 'кэш', 'нал',
    'готівк', 'готівка', 'кеш', 'брой', 'в брой', 'numerar', 'para', 'نقد', 'كاش'
  ],
  card: [
    'card', 'credit', 'debit', 'visa', 'master', 'mastercard',
    'κάρτ', 'κάρτα', 'πιστωτ', 'χρεωστ',
    'карт', 'карта', 'картой', 'кредит', 'дебет',
    'картк', 'кредит', 'дебет',
    'carte', 'kartë', 'بطاقة', 'كارت', 'ائتمان', 'فيزا', 'ماستر'
  ],
  bank: [
    'bank', 'transfer', 'wire', 'iban',
    'τράπεζ', 'έμβασμα', 'μεταφορ',
    'банк', 'перевод', 'ибан', 'счет', 'счёт',
    'переказ', 'рахунок', 'превод', 'сметка',
    'bancă', 'cont', 'bankë', 'transfertë', 'llogari',
    'بنك', 'تحويل', 'حساب'
  ],
};
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
  "suggestedCategory": "materials/tools/work/groceries/transport/utilities/entertainment/healthcare/education/other"
}

Important rules:
1. The receipt is likely in ${language}, but may be in other languages
2. For "amount": extract the TOTAL amount (look for "ΣΥΝΟΛΟ", "TOTAL", "ИТОГО", "Σύνολο", etc.)
3. For "date": convert to YYYY-MM-DD format. If no date visible, use null
4. For "name": use the store name or merchant name
5. For "description": briefly list main items if visible
6. For "suggestedCategory": suggest based on the type of store/items:
   - Building materials, supplies, paint, cement, wood, tiles, pipes, cables → "materials"
   - Tools, equipment, drills, hammers, machines → "tools"
   - Work, services, labor, subcontract, repair, installation → "work"
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
- `suggestedCategory`: `"materials"` | `"tools"` | `"work"` | `"groceries"` | `"transport"` | `"utilities"` | `"entertainment"` | `"healthcare"` | `"education"` | `"other"`
- `paymentMethod`: **НЕТ** (не возвращается для фото)

## 2.3 КОД ПРИМЕНЕНИЯ К ФОРМЕ (Photo)

**Файл:** `frontend/app/[locale]/global-expenses/page.tsx`

Photo использует тот же `categoryMap` что и Voice (10 категорий, 8 языков).

```typescript
// Автозаполнение формы
setFormData(prev => ({
  ...prev,
  name: data.name ? data.name.slice(0, 10) : prev.name,
  amount: data.amount || prev.amount,
  description: data.description || prev.description,
  date: data.date || prev.date,
}));

// Категория с fallback на первую
if (matchedCategory) {
  setFormData(prev => ({ ...prev, categoryId: matchedCategory.id }));
} else if (categories.length > 0) {
  setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
}

// Способ оплаты (fallback на первый)
if (paymentMethods.length > 0) {
  setFormData(prev => ({ ...prev, paymentMethodId: paymentMethods[0].id }));
}
```

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

# ЧАСТЬ 4: РАЗЛИЧИЯ МЕЖДУ VOICE И PHOTO

| Параметр | Voice | Photo |
|----------|-------|-------|
| API endpoint | `/api/analyze-voice` | `/api/analyze-receipt` |
| Возвращает paymentMethod | ✅ Да | ❌ Нет |
| Fallback на первую категорию | ✅ Да | ✅ Да |
| Fallback на первый способ оплаты | ✅ Да | ✅ Да |
| categoryMap | 10 категорий, 8 языков | 10 категорий, 8 языков |
| paymentKeywords | 8 языков | — |

---

# ЧАСТЬ 5: ПОДДЕРЖИВАЕМЫЕ ЯЗЫКИ

| Код | Язык |
|-----|------|
| en | English |
| el | Ελληνικά (Greek) |
| ru | Русский |
| uk | Українська |
| bg | Български |
| ro | Română |
| sq | Shqip (Albanian) |
| ar | العربية (Arabic) |

---

# ЧАСТЬ 6: КАТЕГОРИИ

| Код | Описание | Примеры |
|-----|----------|---------|
| materials | Строительные материалы | краска, цемент, плитка, трубы, кабели |
| tools | Инструменты | дрель, молоток, станок, шуруповёрт |
| work | Работы/Услуги | ремонт, монтаж, субподряд, установка |
| groceries | Продукты | супермаркет, еда, магазин |
| transport | Транспорт | бензин, такси, парковка, метро |
| utilities | Коммунальные | свет, вода, телефон, интернет |
| entertainment | Развлечения | ресторан, кафе, кино |
| healthcare | Здоровье | аптека, врач, лекарства |
| education | Образование | школа, курсы, книги |
| other | Прочее | всё остальное |

---

# ЧАСТЬ 7: ФАЙЛЫ

- `frontend/app/api/analyze-voice/route.ts` — API для голоса
- `frontend/app/api/analyze-receipt/route.ts` — API для фото
- `frontend/app/[locale]/global-expenses/page.tsx` — страница с формой
- `frontend/types/globalExpense.ts` — типы категорий и расходов
- `frontend/types/paymentMethod.ts` — типы способов оплаты
- `frontend/lib/messages.ts` — переводы на 8 языков

---

# ЧАСТЬ 8: УВЕДОМЛЕНИЕ "УДАЛИТЕ ФОТО"

## 8.1 Описание

Когда пользователь загружает фото чека, под фотографией отображается предупреждение:
**"Удалите фото, чтобы сохранить"**

Это связано с тем, что фото не хранится в базе данных — только анализируется для автозаполнения.

## 8.2 Стиль

```css
color: var(--orange)
fontSize: 18px
fontWeight: 600
backgroundColor: rgba(0,0,0,0.6)
```

## 8.3 Переводы (deletePhotoToSave)

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

## 8.4 Код уведомления

```tsx
{!isAnalyzing && (
  <p className="absolute bottom-0 left-0 right-0 text-center py-2 rounded-b-2xl"
    style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'var(--orange)', fontSize: '18px', fontWeight: 600 }}>
    {t.deletePhotoToSave}
  </p>
)}
```

---

# ЧАСТЬ 9: DEBUG ЛОГИ

## Voice Debug

```typescript
console.log('=== VOICE AUTO-FILL DEBUG ===');
console.log('LLM response data:', JSON.stringify(data, null, 2));
console.log('suggestedCategory:', data.suggestedCategory);
console.log('paymentMethod:', data.paymentMethod);
console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
console.log('Available paymentMethods:', paymentMethods.map(p => ({ id: p.id, name: p.name, type: p.type })));
```

## Photo Debug

```typescript
console.log('=== PHOTO AUTO-FILL DEBUG ===');
console.log('LLM response data:', JSON.stringify(data, null, 2));
console.log('suggestedCategory:', data.suggestedCategory);
console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
console.log('Available paymentMethods:', paymentMethods.map(p => ({ id: p.id, name: p.name, type: p.type })));
```

---

# ЧАСТЬ 10: НАСТРОЙКИ

- **Время записи голоса:** 30 секунд
- **Лимит названия расхода:** 10 символов
- **Модель Claude:** claude-sonnet-4-20250514
