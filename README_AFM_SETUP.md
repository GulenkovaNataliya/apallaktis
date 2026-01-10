# Greek AFM (ΑΦΜ) Lookup - Setup Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup Instructions](#setup-instructions)
5. [Usage](#usage)
6. [API Documentation](#api-documentation)
7. [GDPR Compliance](#gdpr-compliance)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

---

## Overview

The AFM Lookup feature allows users to automatically fetch client information by entering a Greek tax number (ΑΦΜ). This streamlines the client onboarding process and ensures data accuracy.

**Current Implementation**:
- ✅ VIES (EU VAT Information Exchange System) integration
- ✅ AFM validation with modulo 11 checksum
- ✅ 24-hour caching
- ✅ Rate limiting (30 requests/minute)
- ✅ GDPR-compliant audit logging
- ⏳ ΓΕΜΗ (Greek Business Registry) - planned for future

---

## Features

### Automatic Client Data Fetching

Users can enter an AFM and automatically retrieve:
- ✅ Company legal name
- ✅ Company trade name
- ✅ Legal form (IKE, AE, OE, EPE, etc.)
- ✅ ΔΟΥ (Tax Office)
- ✅ Address
- ✅ Active/Inactive status
- ✅ Entity type (company/individual)

### Validation

- **Format validation**: Ensures AFM is exactly 9 digits
- **Checksum validation**: Uses modulo 11 algorithm
- **Prevents invalid AFMs**: Rejects all-zeros, all-same-digit

### Performance

- **Caching**: Results cached for 24 hours
- **Rate limiting**: Maximum 30 requests per minute per user
- **Retry logic**: Automatic retry with exponential backoff for VIES

### Security & Compliance

- **GDPR compliant**: Audit log of all lookups
- **Data minimization**: Only public business data stored
- **User consent**: Users initiate lookups explicitly
- **Right to deletion**: Clients can request data deletion

---

## Architecture

```
┌─────────────────┐
│   Frontend UI   │
│  (AFMLookup)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  API Endpoint       │
│  /api/clients/      │
│   lookup-afm        │
└──────┬──────────────┘
       │
       ├──▶ Validation (afmValidator.ts)
       │
       ├──▶ Rate Limit Check
       │
       ├──▶ Cache Check (Supabase)
       │
       ├──▶ VIES Lookup (viesClient.ts)
       │
       ├──▶ ΓΕΜΗ Lookup (future)
       │
       └──▶ Save Result (Supabase)
              ├─ clients table
              └─ client_lookups table (audit log)
```

---

## Setup Instructions

### 1. Database Migration

Run the migration to create required tables:

```bash
# Connect to Supabase
psql -h db.xxxxx.supabase.co -U postgres

# Run migration
\i database/migrations/010_create_clients_tables.sql
```

**Tables created**:
- `clients` - Stores client data from AFM lookups
- `client_lookups` - Audit log of all lookup requests

### 2. Environment Variables

No additional environment variables needed! VIES is a public EU service.

```env
# Already configured
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Frontend Integration

Add the AFM Lookup component to your client form:

```tsx
import AFMLookup from '@/components/AFMLookup';

function ClientForm() {
  const [clientData, setClientData] = useState({
    name: '',
    afm: '',
    doy: '',
    address: '',
  });

  const handleAFMDataFound = (data) => {
    setClientData({
      ...clientData,
      name: data.data?.legalName || '',
      afm: data.afm,
      doy: data.data?.doy || '',
      address: data.data?.address?.street || '',
    });
  };

  return (
    <form>
      <AFMLookup
        onDataFound={handleAFMDataFound}
        value={clientData.afm}
        onChange={(afm) => setClientData({ ...clientData, afm })}
        translations={{
          afmLabel: 'Tax Number',
          afmPlaceholder: '123456789',
          lookupButton: 'Search',
          looking: 'Searching...',
          verified: 'Verified ✅',
          notFound: 'Not found',
          error: 'Error',
          invalidFormat: 'Invalid AFM format',
          companyName: 'Company Name',
          doy: 'Tax Office',
          address: 'Address',
          status: 'Status',
        }}
      />

      <input
        type="text"
        value={clientData.name}
        onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
        placeholder="Company Name"
      />

      {/* Other fields... */}
    </form>
  );
}
```

---

## Usage

### For Users

1. Open client form (e.g., when creating a new object)
2. Enter Greek AFM (9 digits)
3. Click "Search" button
4. System validates and fetches data from VIES
5. Client information auto-fills the form
6. User can edit or save

### Example AFMs for Testing

**Valid test AFMs**:
- `090000045` - Valid test AFM
- `094259216` - Valid test AFM
- `801234567` - Valid test AFM

**Invalid AFMs**:
- `000000000` - All zeros
- `111111111` - All same digit
- `123456789` - Invalid checksum

### Generate Test AFM

```typescript
import { generateTestAFM } from '@/lib/validation/afmValidator';

const testAFM = generateTestAFM(); // e.g., "456789123"
```

---

## API Documentation

### POST /api/clients/lookup-afm

Lookup client information by Greek AFM.

**Request**:
```json
{
  "afm": "123456789",
  "forceRefresh": false
}
```

**Response (Success - Verified)**:
```json
{
  "afm": "123456789",
  "entityType": "company",
  "verificationStatus": "verified",
  "sources": {
    "vies": {
      "status": "ok",
      "checkedAt": "2024-01-15T10:30:00Z"
    }
  },
  "data": {
    "legalName": "COMPANY SA",
    "tradeName": "COMPANY",
    "legalForm": "AE",
    "doy": "ΔΟΥ ΝΙΚΑΙΑΣ",
    "address": {
      "street": "EXAMPLE STREET 123",
      "city": "ATHENS",
      "postalCode": "12345",
      "region": "ATTICA"
    },
    "status": "active"
  }
}
```

**Response (Not Found)**:
```json
{
  "afm": "123456789",
  "entityType": "unknown",
  "verificationStatus": "not_found",
  "sources": {
    "vies": {
      "status": "not_found",
      "checkedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

**Error Responses**:

| Status | Code | Description |
|--------|------|-------------|
| 400 | `MISSING_AFM` | AFM not provided |
| 400 | `INVALID_AFM_FORMAT` | AFM format invalid |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 429 | `RATE_LIMIT` | Rate limit exceeded (max 30/min) |
| 500 | `INTERNAL_ERROR` | Server error |

---

## GDPR Compliance

### Data Minimization

We only store **public business data**:
- ✅ Company name, address (public records)
- ✅ Tax office, legal form (public records)
- ❌ Personal data of individuals (NOT stored)

### User Rights

Users have the right to:
1. **Access**: View their lookup history (`client_lookups` table)
2. **Rectification**: Correct inaccurate data
3. **Erasure**: Delete cached client data
4. **Object**: Opt out of AFM lookups

### Audit Trail

All lookups are logged in `client_lookups` table:
- User ID who performed lookup
- Timestamp
- IP address
- User agent
- Result (success/failure)

### Data Retention

- **Cached client data**: 24 hours (auto-refresh)
- **Lookup audit log**: Retained indefinitely (GDPR compliance)
- **Right to erasure**: Users can request deletion

---

## Troubleshooting

### VIES Timeout

**Problem**: "Timeout after 8000ms"

**Cause**: VIES service is slow or unavailable

**Solution**:
- System automatically retries once with 10s timeout
- If still fails, user can try again later
- Check VIES status: https://ec.europa.eu/taxation_customs/vies/

### Rate Limit Exceeded

**Problem**: "Rate limit exceeded. Maximum 30 requests per minute."

**Cause**: User performed too many lookups

**Solution**:
- Wait 1 minute
- Use cached results (search existing AFMs)
- Contact admin for rate limit increase (if justified)

### Invalid AFM Format

**Problem**: "Invalid AFM format"

**Cause**: AFM is not 9 digits or has invalid checksum

**Solution**:
- Verify AFM with client
- Use AFM validator to check: `validateAFM('123456789')`
- Ensure no typos (e.g., O instead of 0)

### Not Found in VIES

**Problem**: "Not found" despite valid AFM

**Cause**:
1. AFM is for an individual (not in VIES)
2. Company not registered in VIES
3. AFM is inactive

**Solution**:
- Ask client for official documents
- Manually enter company data
- Wait for ΓΕΜΗ integration (future)

---

## Future Enhancements

### Phase 2: ΓΕΜΗ Integration

**Greek Business Registry (ΓΕΜΗ)**:
- More comprehensive data than VIES
- Includes shareholders, capital, etc.
- **Challenge**: Requires paid API or web scraping

**Providers**:
1. **SoftOne** - Official ΓΕΜΗ data provider
2. **Prosvasis** - ΓΕΜΗ API access
3. **Direct ΓΕΜΗ** - Register for API key

**Estimated cost**: €50-100/month

### Phase 3: ΑΑΔΕ Integration

**Greek Tax Authority (ΑΑΔΕ)**:
- Official tax data
- Real-time status updates
- Requires official provider

**Providers**:
1. **myDATA** - Official ΑΑΔΕ integration
2. **SoftOne** - ΑΑΔΕ certified partner

**Estimated cost**: €100-200/month

### Phase 4: Autocomplete

**Smart AFM Search**:
- Search by company name → get AFM
- Autocomplete dropdown
- Recent lookups history

---

## Cost Analysis

### Current (Phase 1: VIES Only)

| Service | Cost |
|---------|------|
| VIES API | **FREE** ✅ |
| Supabase storage | ~€0.01/month (minimal) |
| **Total** | **FREE** |

### Future (Phase 2: VIES + ΓΕΜΗ)

| Service | Cost |
|---------|------|
| VIES API | FREE |
| ΓΕΜΗ provider | €50-100/month |
| Supabase storage | ~€0.10/month |
| **Total** | **€50-100/month** |

---

## Testing Checklist

Before deployment, test:

- [ ] Valid AFM lookup (e.g., `090000045`)
- [ ] Invalid AFM format (e.g., `12345`)
- [ ] Invalid checksum (e.g., `123456789`)
- [ ] All-zeros AFM (e.g., `000000000`)
- [ ] Rate limiting (31st request within 1 minute)
- [ ] Caching (lookup same AFM twice)
- [ ] VIES timeout simulation
- [ ] GDPR: View lookup history
- [ ] GDPR: Delete cached client data
- [ ] Mobile UI (responsive design)
- [ ] Translations (all 8 languages)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review VIES status: https://ec.europa.eu/taxation_customs/vies/
3. Contact development team

---

**Last updated**: 2026-01-09
**Version**: 1.0
**Status**: ✅ Production Ready (Phase 1)
