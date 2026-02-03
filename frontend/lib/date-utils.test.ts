/**
 * Unit tests for addCalendarMonthClamped
 *
 * Run with: npx ts-node frontend/lib/date-utils.test.ts
 * Or: npx tsx frontend/lib/date-utils.test.ts
 */

import { addCalendarMonthClamped, addCalendarMonths } from './date-utils';

interface TestCase {
  input: string;
  expected: string;
  description: string;
}

const testCases: TestCase[] = [
  // Edge cases: months with 31 days → months with fewer days
  {
    input: '2024-01-31',
    expected: '2024-02-29',
    description: 'Jan 31 → Feb 29 (2024 is leap year)',
  },
  {
    input: '2025-01-31',
    expected: '2025-02-28',
    description: 'Jan 31 → Feb 28 (2025 is NOT leap year)',
  },
  {
    input: '2024-03-31',
    expected: '2024-04-30',
    description: 'Mar 31 → Apr 30',
  },
  {
    input: '2024-08-31',
    expected: '2024-09-30',
    description: 'Aug 31 → Sep 30',
  },
  {
    input: '2024-05-31',
    expected: '2024-06-30',
    description: 'May 31 → Jun 30',
  },

  // Leap year edge case
  {
    input: '2024-02-29',
    expected: '2024-03-29',
    description: 'Feb 29 (leap) → Mar 29',
  },

  // Normal cases (no clamping needed)
  {
    input: '2024-01-15',
    expected: '2024-02-15',
    description: 'Jan 15 → Feb 15 (normal)',
  },
  {
    input: '2024-12-15',
    expected: '2025-01-15',
    description: 'Dec 15 → Jan 15 (year rollover)',
  },

  // Year boundary with clamping
  {
    input: '2024-12-31',
    expected: '2025-01-31',
    description: 'Dec 31 → Jan 31 (no clamp needed)',
  },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * VIP renewal logic tests
 * Simulates the business logic from webhook/route.ts
 */
interface VipTestCase {
  vipExpiresAt: string;
  now: string;
  expectedNewExpiry: string;
  description: string;
}

const vipTestCases: VipTestCase[] = [
  // Продление до истечения (накопление)
  {
    vipExpiresAt: '2024-04-15',
    now: '2024-04-10',
    expectedNewExpiry: '2024-05-15',
    description: 'VIP renewal BEFORE expiry: adds month to expiry date',
  },
  // Продление после истечения (реактивация)
  {
    vipExpiresAt: '2024-03-15',
    now: '2024-04-10',
    expectedNewExpiry: '2024-05-10',
    description: 'VIP renewal AFTER expiry: adds month from NOW',
  },
  // Кейс 31 января → февраль (clamp)
  {
    vipExpiresAt: '2024-01-31',
    now: '2024-01-15',
    expectedNewExpiry: '2024-02-29',
    description: 'VIP Jan 31 → Feb 29 (clamp + leap year)',
  },
];

function simulateVipRenewal(vipExpiresAt: Date, now: Date): Date {
  // This mirrors the logic in webhook/route.ts
  const baseDate = vipExpiresAt > now ? vipExpiresAt : now;
  return addCalendarMonthClamped(baseDate);
}

function runVipTests(): void {
  console.log('\n🎖️  Testing VIP Renewal Logic\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of vipTestCases) {
    const vipExpires = new Date(testCase.vipExpiresAt + 'T12:00:00Z');
    const now = new Date(testCase.now + 'T12:00:00Z');
    const result = simulateVipRenewal(vipExpires, now);
    const resultStr = formatDate(result);
    const success = resultStr === testCase.expectedNewExpiry;

    if (success) {
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   VIP expires: ${testCase.vipExpiresAt}, Now: ${testCase.now}`);
      console.log(`   New expiry: ${resultStr}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   VIP expires: ${testCase.vipExpiresAt}, Now: ${testCase.now}`);
      console.log(`   Expected: ${testCase.expectedNewExpiry}`);
      console.log(`   Got:      ${resultStr}`);
      failed++;
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`\n📊 VIP Results: ${passed} passed, ${failed} failed\n`);

  return failed;
}

function runTests(): void {
  console.log('🧪 Testing addCalendarMonthClamped()\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const input = new Date(testCase.input + 'T12:00:00Z');
    const result = addCalendarMonthClamped(input);
    const resultStr = formatDate(result);
    const success = resultStr === testCase.expected;

    if (success) {
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   ${testCase.input} → ${resultStr}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Input:    ${testCase.input}`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Got:      ${resultStr}`);
      failed++;
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  return failed;
}

// Run all tests when executed directly
const calendarFailed = runTests();
const vipFailed = runVipTests();

if (calendarFailed + vipFailed > 0) {
  process.exit(1);
}
