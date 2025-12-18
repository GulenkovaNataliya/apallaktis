# Apallaktis Backend - AFM Validator

Backend service for validating Greek Tax Identification Numbers (ΑΦΜ) through official AADE/GEMI source.

## Features

✅ **Format validation** - Fast local check (9 digits)
✅ **AADE verification** - Real check through official GEMI registry
✅ **Company data extraction** - Name, status (ACTIVE/INACTIVE), ΔΟΥ
✅ **Error handling** - CAPTCHA detection, timeouts, page changes
✅ **Retry logic** - Automatic retry on network errors

## Installation

```bash
cd backend
npm install
```

This will install:
- `puppeteer` - Headless browser for automation
- `express` - Web framework for API
- `nodemon` - Development auto-reload

## Usage

### Option 1: API Server

Start the Express API server:

```bash
npm start
```

Server runs on `http://localhost:3002`

#### API Endpoints:

**1. Format Validation (Fast)**
```bash
POST http://localhost:3002/api/afm/validate
Content-Type: application/json

{
  "afm": "123 456 789"
}
```

Response:
```json
{
  "valid": true,
  "cleaned": "123456789",
  "error": null
}
```

**2. Full AADE Verification (10-30 seconds)**
```bash
POST http://localhost:3002/api/afm/verify
Content-Type: application/json

{
  "afm": "123456789"
}
```

Response:
```json
{
  "afm": "123456789",
  "source": "AADE",
  "checked_at": "2025-12-18T10:30:00.000Z",
  "valid_format": true,
  "found": true,
  "status": "ACTIVE",
  "name": "ΕΤΑΙΡΕΙΑ ΑΕ",
  "doy": "Αθηνών",
  "raw_text": "...",
  "error": null,
  "message": "ΑΦΜ найден, статус активен, ΕΤΑΙΡΕΙΑ ΑΕ"
}
```

**3. Health Check**
```bash
GET http://localhost:3002/api/afm/health
```

### Option 2: Direct Usage (Node.js)

```javascript
const { verifyAfm } = require('./services/afmValidator');

async function checkAfm() {
  const result = await verifyAfm('123456789');
  console.log(result);
}

checkAfm();
```

### Option 3: Test Examples

```bash
npm run test:afm
```

## Response Object Structure

```typescript
{
  afm: string;              // Cleaned AFM (9 digits)
  source: "AADE";           // Always AADE
  checked_at: string;       // ISO timestamp
  valid_format: boolean;    // True if 9 digits
  found: boolean;           // True if found in AADE
  status: string;           // "ACTIVE" | "INACTIVE" | "UNKNOWN"
  name: string | null;      // Company name if found
  doy: string | null;       // ΔΟΥ if found
  raw_text: string | null;  // Raw result text (first 500 chars)
  error: string | null;     // Error code if failed
  message: string;          // User-friendly message
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_FORMAT` | Not exactly 9 digits |
| `BLOCKED_OR_CAPTCHA` | Site requires CAPTCHA |
| `TIMEOUT` | Network timeout (30s) |
| `PAGE_CHANGED` | Site structure changed |
| `UNKNOWN_ERROR` | Other error |

## User Messages (Russian)

| Status | Message |
|--------|---------|
| Found + Active | "ΑΦΜ найден, статус активен, {name}" |
| Found + Inactive | "ΑΦΜ найден, статус неактивен, {name}" |
| Not Found | "ΑΦΜ не найден в AADE" |
| Invalid Format | "ΑΦΜ должен содержать ровно 9 цифр" |
| Error | "Не удалось проверить ΑΦΜ: {error}" |

## How It Works

1. **Format Validation** - Remove spaces, check 9 digits
2. **Browser Launch** - Puppeteer headless Chrome
3. **Navigate to GEMI** - `https://publicity.businessportal.gr/`
4. **Fill AFM** - Find VAT input field
5. **Submit Search** - Click search button
6. **Parse Results** - Extract company data
7. **Return JSON** - Structured response

## Official Sources

- **GEMI (Γενικό Εμπορικό Μητρώο)** - [businessportal.gr](https://www.businessportal.gr/en/i-want-to-find-information-about-a-company/)
- **AADE (Ανεξάρτητη Αρχή Δημοσίων Εσόδων)** - [aade.gr](https://www.aade.gr/en)
- **Gov.gr Business Search** - [gov.gr](https://www.gov.gr/en/upourgeia/upourgeio-anaptuxes/anaptuxes/stoikheia-demosiotetas-emporikon-epikheireseon-eggegrammenon-sto-geme)

## Security & Compliance

✅ No personal data stored in logs (except AFM and status)
✅ No CAPTCHA bypass (returns error if detected)
✅ Official sources only (GEMI/AADE)
✅ Retry limit: 1 attempt (prevents abuse)

## Development

```bash
# Install dependencies
npm install

# Run API server with auto-reload
npm run dev

# Run tests
npm run test:afm
```

## Production Considerations

⚠️ **Important:**

1. **Rate Limiting** - Add rate limiting to prevent abuse
2. **Caching** - Cache results for 24h to reduce load
3. **Queue** - Use job queue (Bull/Bee) for async processing
4. **Monitoring** - Track success/failure rates
5. **Error Alerts** - Alert on PAGE_CHANGED (site updated)

## Example Integration with Frontend

```javascript
// Frontend: app/[locale]/register/page.tsx

const validateAfm = async (afm) => {
  const response = await fetch('http://localhost:3002/api/afm/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ afm })
  });

  const result = await response.json();

  if (!result.valid_format) {
    setError('ΑΦΜ должен содержать 9 цифр');
    return false;
  }

  if (!result.found) {
    setError('ΑΦΜ не найден в AADE');
    return false;
  }

  if (result.status !== 'ACTIVE') {
    setError('ΑΦΜ неактивен');
    return false;
  }

  // Success!
  setCompanyName(result.name);
  setDoy(result.doy);
  return true;
};
```

## License

ISC

---

**Created:** 2025-12-18
**Source:** Official AADE/GEMI registry
**Status:** Ready for testing
