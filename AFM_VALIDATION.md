# AFM (ΑΦΜ) Validation System

Greek Tax Number validation and company data lookup.

---

## 1. Overview

**ΑΦΜ (Αριθμός Φορολογικού Μητρώου)** — Greek Tax Identification Number.

- **Format:** Exactly 9 digits
- **Validation:** Modulo 11 checksum algorithm
- **Lookup:** EU VIES (VAT Information Exchange System)

---

## 2. Validation Algorithm

### Rules
1. Must be exactly 9 digits
2. Cannot be all zeros (`000000000`)
3. Cannot be all same digit (`111111111`)
4. Last digit is checksum (modulo 11)

### Checksum Algorithm

```typescript
function validateAFMChecksum(afm: string): boolean {
  const digits = afm.split('').map(Number);
  let sum = 0;

  // Calculate weighted sum of first 8 digits
  for (let i = 0; i < 8; i++) {
    const weight = Math.pow(2, 8 - i);
    sum += digits[i] * weight;
  }

  // Calculate checksum
  const calculatedChecksum = (sum % 11) % 10;
  const actualChecksum = digits[8];

  return calculatedChecksum === actualChecksum;
}
```

### Usage

```typescript
import { validateAFM } from '@/lib/validation/afmValidator';

const result = validateAFM('094259216');
// { valid: true, formatted: '094 259 216' }

const invalid = validateAFM('123456789');
// { valid: false, error: 'Invalid AFM checksum' }
```

---

## 3. API Service: EU VIES

### What is VIES?

**VIES (VAT Information Exchange System)** — official EU service for validating VAT numbers across all EU member states.

- **Provider:** European Commission
- **Cost:** Free
- **Rate Limit:** None documented (but be reasonable)
- **Uptime:** ~99% (can be slow or timeout)

### Endpoint

```
POST https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number
```

### Request

```json
{
  "countryCode": "EL",
  "vatNumber": "094259216"
}
```

> **Note:** Greece uses `EL` (not `GR`) in VIES.

### Response (Valid)

```json
{
  "valid": true,
  "countryCode": "EL",
  "vatNumber": "094259216",
  "requestDate": "2025-01-16",
  "name": "EXAMPLE COMPANY IKE",
  "address": "EXAMPLE STREET 123, ATHENS 10557"
}
```

### Response (Invalid)

```json
{
  "valid": false,
  "countryCode": "EL",
  "vatNumber": "000000000",
  "requestDate": "2025-01-16"
}
```

---

## 4. Data Returned

| Field | Source | Description |
|-------|--------|-------------|
| `name` | VIES | Legal company name (Επωνυμία) |
| `address` | VIES | Full address (street, city, postal code) |
| `valid` | VIES | Whether AFM is registered |
| `activity` | — | **Not provided by VIES** (user must enter) |
| `doy` | — | **Not provided by VIES** (user must enter) |

### What VIES Does NOT Return

- **Δραστηριότητα (Activity)** — Business activity type
- **ΔΟΥ (Tax Office)** — Greek tax office name
- **Trade name** — Only legal name is provided

> These fields must be entered manually by the user during registration.

---

## 5. Code Examples

### Client-Side (Registration Form)

```typescript
// frontend/app/[locale]/register/page.tsx

const handleAfmLookup = async () => {
  const response = await fetch('/api/afm/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ afm: '094259216' }),
  });

  const data = await response.json();

  if (data.success) {
    // Auto-fill form fields
    setCompanyName(data.data.legalName);
    setAddress(data.data.address);
  }
};
```

### API Route (Server-Side)

```typescript
// frontend/app/api/afm/lookup/route.ts

import { checkVATVIES_WithRetry } from '@/lib/integrations/viesClient';

export async function POST(request: NextRequest) {
  const { afm } = await request.json();

  // Validate format
  const cleanAFM = afm.replace(/\D/g, '');
  if (cleanAFM.length !== 9) {
    return NextResponse.json({ success: false, error: 'AFM must be 9 digits' });
  }

  // Check VIES
  const result = await checkVATVIES_WithRetry('EL', cleanAFM);

  if (result.status === 'ok' && result.data) {
    return NextResponse.json({
      success: true,
      data: {
        legalName: result.data.name,
        address: result.data.address,
      },
    });
  }

  return NextResponse.json({ success: false, error: 'ΑΦΜ not found' });
}
```

### VIES Client with Retry

```typescript
// frontend/lib/integrations/viesClient.ts

export async function checkVATVIES_WithRetry(
  countryCode: string,
  vatNumber: string
): Promise<VIESResult> {
  const result = await checkVATVIES(countryCode, vatNumber);

  // Retry on timeout or error
  if (result.status === 'timeout' || result.status === 'error') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return checkVATVIES(countryCode, vatNumber, 10000);
  }

  return result;
}
```

---

## 6. Environment Variables

**None required for VIES** — it's a public API.

However, for future TaxisNet integration (Greek government API), you would need:

```env
# .env.local (future, not implemented)
TAXISNET_USERNAME=your_username
TAXISNET_PASSWORD=your_password
TAXISNET_API_KEY=your_api_key
```

---

## 7. Dependencies

### Required (already installed)

```json
{
  "next": "^16.0.0"
}
```

> No additional packages needed. Uses native `fetch` API.

### Optional (for advanced SOAP integration)

```bash
# If REST API becomes unreliable
npm install soap
# or
npm install validate-vat
```

---

## 8. File Structure

```
frontend/
├── app/
│   └── api/
│       ├── afm/
│       │   └── lookup/
│       │       └── route.ts      # Public API (no auth)
│       └── clients/
│           └── lookup-afm/
│               └── route.ts      # Protected API (with auth)
├── lib/
│   ├── validation/
│   │   └── afmValidator.ts       # Checksum validation
│   └── integrations/
│       └── viesClient.ts         # VIES API client
```

---

## 9. Database Tables

### `clients` — Cached company data

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  afm VARCHAR(9) UNIQUE NOT NULL,
  legal_name TEXT,
  address_json JSONB,
  doy TEXT,
  verification_status TEXT,  -- 'verified', 'partial', 'not_found'
  created_at TIMESTAMPTZ
);
```

### `client_lookups` — Audit log

```sql
CREATE TABLE client_lookups (
  id UUID PRIMARY KEY,
  afm VARCHAR(9) NOT NULL,
  client_id UUID REFERENCES clients(id),
  requested_by_user_id UUID,
  sources_json JSONB,        -- { vies: { status, checkedAt } }
  created_at TIMESTAMPTZ
);
```

---

## 10. Test AFMs

### Valid (for testing)

| AFM | Description |
|-----|-------------|
| `090000045` | AADE test AFM |
| `094259216` | AADE test AFM |

### Invalid

| AFM | Reason |
|-----|--------|
| `000000000` | All zeros |
| `111111111` | All same digit |
| `123456789` | Invalid checksum |

### Generate Test AFM (dev only)

```typescript
import { generateTestAFM } from '@/lib/validation/afmValidator';

const testAFM = generateTestAFM();
// Returns valid random AFM for testing
```

---

## 11. Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `AFM must be 9 digits` | Wrong format | Validate input |
| `Invalid AFM checksum` | Wrong number | Check for typos |
| `ΑΦΜ not found in VIES` | Not registered | May be individual (not company) |
| `Timeout` | VIES slow | Retry with longer timeout |
| `HTTP 503` | VIES down | Retry later |

---

## 12. Limitations

1. **VIES only validates companies** — Individual AFMs may return "not found"
2. **No activity/DOY data** — Must be entered manually
3. **VIES can be slow** — 2-10 second response times are normal
4. **Greek-only** — This implementation is for Greek AFM only

---

## 13. Future Improvements

- [ ] TaxisNet integration (more data, but requires government credentials)
- [ ] ΓΕΜΗ integration (company registry)
- [ ] Caching lookup results in Supabase
- [ ] Rate limiting for abuse prevention
