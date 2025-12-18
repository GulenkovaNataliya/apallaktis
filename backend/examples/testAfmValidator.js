/**
 * Example usage of AFM Validator
 *
 * Run: node examples/testAfmValidator.js
 */

const { verifyAfm } = require('../services/afmValidator');

async function runTests() {
  console.log('=== AFM Validator Tests ===\n');

  // Test 1: Invalid format (not 9 digits)
  console.log('Test 1: Invalid format');
  const test1 = await verifyAfm('12345');
  console.log(JSON.stringify(test1, null, 2));
  console.log('\n---\n');

  // Test 2: Invalid format (letters)
  console.log('Test 2: Invalid format with letters');
  const test2 = await verifyAfm('ABC123456');
  console.log(JSON.stringify(test2, null, 2));
  console.log('\n---\n');

  // Test 3: Valid format with spaces (will be cleaned)
  console.log('Test 3: Valid format with spaces');
  const test3 = await verifyAfm('123 456 789');
  console.log(JSON.stringify(test3, null, 2));
  console.log('\n---\n');

  // Test 4: Real AFM check (example - may not exist)
  // Note: Replace with a real AFM for testing
  console.log('Test 4: Check real AFM');
  const test4 = await verifyAfm('999999999');
  console.log(JSON.stringify(test4, null, 2));
  console.log('\n---\n');

  console.log('=== Tests Complete ===');
}

// Run tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
