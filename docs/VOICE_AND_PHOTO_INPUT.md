# Voice Input & Photo Recognition

## Overview

The application supports two smart input methods for expense tracking:
1. **Voice Input** - Speech-to-text with automatic field parsing
2. **Photo Recognition** - Receipt/invoice scanning with AI analysis

---

## 1. Voice Input (Голосовой ввод)

### How It Works

1. User clicks the **Voice** button
2. Browser's Web Speech API starts recording
3. Speech is converted to text in real-time
4. When recording stops, text is parsed by `voiceParser.ts`
5. Extracted data is distributed to form fields automatically

### Files Structure

```
frontend/
├── lib/
│   └── voiceParser.ts          # Smart parser for voice text
├── app/[locale]/
│   ├── global-expenses/
│   │   └── page.tsx            # 1 voice input (Add Expense form)
│   └── objects/[id]/finance/
│       └── page.tsx            # 3 voice inputs:
│                               #   - AddWorkForm
│                               #   - AddPaymentForm
│                               #   - AddExpenseForm
```

### Voice Parser (`lib/voiceParser.ts`)

#### Input
```typescript
parseVoiceInput(
  text: string,           // Raw speech text
  locale: string,         // User's language (el, ru, en, uk, sq, bg, ro, ar)
  categoryNames?: string[] // Optional: user's category names for matching
): ParsedVoiceInput
```

#### Output
```typescript
interface ParsedVoiceInput {
  amount: number | null;      // Extracted amount (e.g., 250)
  date: string | null;        // ISO date (e.g., "2026-01-15")
  category: string | null;    // Matched category name
  description: string;        // Remaining text
}
```

#### Example
```
Input:  "250 евро 15 января за электричество"
Output: {
  amount: 250,
  date: "2026-01-15",
  category: null,
  description: "электричество"
}
```

### Supported Languages

| Language   | Code | Months Example        | Relative Dates          |
|------------|------|-----------------------|-------------------------|
| Greek      | el   | ιανουαρίου, φεβρουαρίου | σήμερα, χθες, προχθές  |
| Russian    | ru   | января, февраля       | сегодня, вчера, позавчера |
| English    | en   | january, february     | today, yesterday        |
| Ukrainian  | uk   | січня, лютого         | сьогодні, вчора        |
| Albanian   | sq   | janar, shkurt         | sot, dje, pardje       |
| Bulgarian  | bg   | януари, февруари      | днес, вчера, завчера   |
| Romanian   | ro   | ianuarie, februarie   | azi, ieri, alaltăieri  |
| Arabic     | ar   | يناير, فبراير          | اليوم, أمس              |

### Currency Words (Removed from Description)
- евро, euro, euros, ευρώ
- долларов, доллар, dollars, dollar, δολάρια
- лева, лев, лей, леи
- €, $, ₴, ₽

### Web Speech API Configuration

```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Language mapping (BCP 47 format)
const langMap: Record<string, string> = {
  'el': 'el-GR',
  'ru': 'ru-RU',
  'uk': 'uk-UA',
  'sq': 'sq-AL',
  'bg': 'bg-BG',
  'ro': 'ro-RO',
  'ar': 'ar-SA',
  'en': 'en-US'
};

recognition.lang = langMap[locale] || 'el-GR';
recognition.continuous = false;     // Single result, no duplication
recognition.interimResults = true;  // Show text while speaking
recognition.maxAlternatives = 1;
```

### Adding Voice Input to New Form

```typescript
import { parseVoiceInput } from '@/lib/voiceParser';

// 1. Add refs
const recognitionRef = useRef<any>(null);
const transcriptRef = useRef<string>('');
const analyzedRef = useRef(false);  // Prevent double analysis

// 2. Add state
const [isRecording, setIsRecording] = useState(false);

// 3. Create handler
const handleVoiceInput = () => {
  if (isRecording && recognitionRef.current) {
    recognitionRef.current.stop();
    return;
  }

  const SpeechRecognition = (window as any).SpeechRecognition ||
                            (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = langMap[locale] || 'el-GR';
  recognition.continuous = false;  // IMPORTANT: prevents duplication
  recognition.interimResults = true;

  // Reset refs before starting
  recognitionRef.current = recognition;
  transcriptRef.current = '';
  analyzedRef.current = false;

  recognition.onresult = (event: any) => {
    // 1) Collect all final results from scratch (no +=)
    const finals: string[] = [];
    for (let i = 0; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) finals.push(r[0].transcript);
    }
    const finalText = finals.join(" ").replace(/\s+/g, " ").trim();

    // 2) Interim — for live preview only
    const last = event.results[event.results.length - 1];
    const interimText = last && !last.isFinal ? String(last[0].transcript || "").trim() : "";

    // 3) Live preview
    setFormData(prev => ({
      ...prev,
      description: (finalText + (interimText ? " " + interimText : "")).trim() || prev.description
    }));

    // 4) Store final text for onend
    transcriptRef.current = finalText;
  };

  recognition.onend = () => {
    setIsRecording(false);
    recognitionRef.current = null;

    // Guard: prevent double analysis
    if (analyzedRef.current) return;
    analyzedRef.current = true;

    // Parse and distribute to fields
    const finalText = transcriptRef.current?.trim();
    if (finalText) {
      const parsed = parseVoiceInput(finalText, locale);
      setFormData(prev => ({
        ...prev,
        amount: parsed.amount ?? prev.amount,
        date: parsed.date ?? prev.date,
        description: (parsed.description ?? "").trim() || prev.description,
      }));
    }
  };

  recognition.start();
  setIsRecording(true);
};

// 4. Add button
<button onClick={handleVoiceInput}>
  {isRecording ? '⏹️ STOP' : '🎤 Voice'}
</button>
```

### 4-Level Duplication Protection

| Level | Protection | Code |
|-------|------------|------|
| 1 | Single result mode | `recognition.continuous = false` |
| 2 | Rebuild from scratch | `finals.join()` instead of `+=` |
| 3 | Double-call guard | `analyzedRef.current` check |
| 4 | Safe fallback | `prev.description` preserves data |

---

## 2. Photo Recognition (Распознавание фото)

### How It Works

1. User takes/uploads a photo of receipt
2. Image is sent to `/api/analyze-receipt` endpoint
3. **Claude Vision API (Anthropic)** analyzes the image
4. Extracted data is returned and fills form fields

### Files Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── analyze-receipt/
│   │       └── route.ts        # API endpoint for receipt analysis
│   └── [locale]/
│       ├── global-expenses/
│       │   └── page.tsx        # Photo input in Add Expense form
│       └── objects/[id]/finance/
│           └── page.tsx        # Photo input in AddExpenseForm
```

### API Endpoint (`/api/analyze-receipt`)

#### Request
```typescript
POST /api/analyze-receipt
Content-Type: application/json

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",  // Base64 image
  "locale": "ru"  // User's language
}
```

#### Response
```typescript
{
  "success": true,
  "data": {
    "name": "LIDL",                      // Store/business name
    "amount": 45.50,                     // Total amount
    "date": "2026-01-15",                // ISO date
    "description": "Supermarket purchase", // Brief description
    "confidence": "high",                // high/medium/low
    "suggestedCategory": "groceries"     // Category suggestion
  }
}
```

### Claude Vision Prompt

```typescript
const prompt = `You are analyzing a receipt/invoice image. Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):

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
8. Return ONLY the JSON object, nothing else`;
```

### Category Mapping

The API returns `suggestedCategory` based on receipt content analysis:

| Category | Matched Items |
|----------|--------------|
| `materials` | Building materials, paint, cement, wood, tiles, pipes, cables |
| `tools` | Tools, equipment, drills, hammers, machines |
| `work` | Services, labor, subcontract, repair, installation |
| `groceries` | Supermarkets, food stores |
| `transport` | Gas stations, parking, taxis |
| `utilities` | Electric, water, phone bills |
| `entertainment` | Restaurants, cinemas |
| `healthcare` | Pharmacies, doctors |
| `education` | Schools, courses, books |
| `other` | Everything else |

### Adding Photo Input to New Form

```typescript
// 1. Add state
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

// 2. Handle photo selection
const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      analyzeReceipt(base64);  // Auto-analyze
    };
    reader.readAsDataURL(file);
  }
};

// 3. Analyze receipt
const analyzeReceipt = async (base64Image: string) => {
  setIsAnalyzing(true);
  try {
    const response = await fetch('/api/analyze-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Image, locale }),
    });
    const result = await response.json();

    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        name: result.data.name ?? prev.name,
        amount: result.data.amount ?? prev.amount,
        date: result.data.date ?? prev.date,
        description: result.data.description ?? prev.description,
        // result.data.suggestedCategory can be used for category matching
        // result.data.confidence indicates recognition quality
      }));
    }
  } catch (error) {
    console.error('Receipt analysis failed:', error);
  } finally {
    setIsAnalyzing(false);
  }
};

// 4. Add input
<input
  type="file"
  accept="image/*"
  capture="environment"  // Use camera on mobile
  onChange={handlePhotoChange}
/>
{photoPreview && <img src={photoPreview} alt="Receipt" />}
{isAnalyzing && <span>Analyzing...</span>}
```

---

## 3. Subscription Restrictions

Voice and Photo inputs are **premium features** available only for:
- Standard plan
- Premium plan
- VIP plan

```typescript
const { user } = useAuth();
const hasVoiceAndPhoto = user?.subscriptionPlan === 'standard' ||
                         user?.subscriptionPlan === 'premium' ||
                         user?.subscriptionPlan === 'vip';

// Show upgrade prompt for free users
{hasVoiceAndPhoto ? (
  <button onClick={handleVoiceInput}>🎤 Voice</button>
) : (
  <button onClick={onUpgradeVoice}>🎤 Upgrade</button>
)}
```

---

## 4. Troubleshooting

### Voice Input Issues

| Problem | Solution |
|---------|----------|
| "Voice not supported" | Use Chrome, Edge, or Safari |
| Wrong language recognition | Check `recognition.lang` is set correctly |
| Text duplicating | Set `recognition.continuous = false` and rebuild finals array |
| Text not updating | Check `interimResults = true` |

### Photo Recognition Issues

| Problem | Solution |
|---------|----------|
| Analysis fails | Check `ANTHROPIC_API_KEY` in environment |
| Wrong amount extracted | Receipt may be blurry, try clearer photo |
| Low confidence | Check `result.data.confidence` field |
| No category matched | Use `result.data.suggestedCategory` as hint |
| Model not found | Ensure `claude-sonnet-4-20250514` is available |

---

## 5. Environment Variables

```env
# For photo recognition (Claude Vision API)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 6. Future Improvements

- [ ] Add speech synthesis to confirm parsed data
- [ ] Support for multiple receipts in one photo
- [ ] Offline photo OCR (without API)
- [ ] Voice commands ("delete", "cancel", "save")
- [ ] Multi-currency detection and conversion
