/**
 * AFM (Greek Tax ID) Validator Service
 * Validates AFM through official GEMI/AADE source
 * Uses headless browser automation
 */

const puppeteer = require('puppeteer');

/**
 * Validates AFM format (9 digits only)
 * @param {string} afm - Input AFM (may contain spaces)
 * @returns {object} - { valid: boolean, cleaned: string, error: string|null }
 */
function validateAfmFormat(afm) {
  // Remove spaces and separators
  const cleaned = afm.replace(/[\s\-]/g, '');

  // Check if exactly 9 digits
  const isValid = /^\d{9}$/.test(cleaned);

  return {
    valid: isValid,
    cleaned: cleaned,
    error: isValid ? null : 'INVALID_FORMAT'
  };
}

/**
 * Main AFM verification function
 * @param {string} afm - AFM to verify
 * @returns {Promise<object>} - Verification result
 */
async function verifyAfm(afm) {
  const startTime = new Date();
  console.log('[AFM Validator] START:', afm);

  // Step 1: Validate format first
  const formatCheck = validateAfmFormat(afm);
  if (!formatCheck.valid) {
    console.log('[AFM Validator] INVALID FORMAT');
    return {
      afm: formatCheck.cleaned,
      source: 'AADE',
      checked_at: startTime.toISOString(),
      valid_format: false,
      found: false,
      status: 'UNKNOWN',
      name: null,
      doy: null,
      raw_text: null,
      error: 'INVALID_FORMAT',
      message: 'ΑΦΜ должен содержать ровно 9 цифр'
    };
  }

  const cleanedAfm = formatCheck.cleaned;
  let browser = null;
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount <= maxRetries) {
    try {
      console.log(`[AFM Validator] Attempt ${retryCount + 1}/${maxRetries + 1}`);

      // Step 2: Launch headless browser
      console.log('[AFM Validator] Launching browser...');
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();

      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      // Step 3: Navigate to GEMI search page
      console.log('[AFM Validator] Opening page...');
      await page.goto('https://publicity.businessportal.gr/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Step 4: Check for CAPTCHA or blocking
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('captcha') || bodyText.includes('CAPTCHA') ||
          bodyText.includes('blocked') || bodyText.includes('robot')) {
        console.log('[AFM Validator] CAPTCHA or block detected');
        throw new Error('BLOCKED_OR_CAPTCHA');
      }

      // Step 5: Find and fill AFM input field
      console.log('[AFM Validator] Filling AFM input...');

      // Try multiple selectors
      const inputSelectors = [
        'input[name*="vat"]',
        'input[name*="afm"]',
        'input[placeholder*="ΑΦΜ"]',
        'input[id*="vat"]',
        'input[id*="afm"]',
        'input[type="text"]'
      ];

      let inputFilled = false;
      for (const selector of inputSelectors) {
        try {
          const input = await page.$(selector);
          if (input) {
            await input.type(cleanedAfm);
            console.log(`[AFM Validator] Input filled using selector: ${selector}`);
            inputFilled = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!inputFilled) {
        console.log('[AFM Validator] Could not find input field');
        throw new Error('PAGE_CHANGED');
      }

      // Step 6: Submit the form
      console.log('[AFM Validator] Submitting form...');

      const buttonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Αναζήτηση")',
        'button:contains("Search")'
      ];

      let submitted = false;
      for (const selector of buttonSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await Promise.all([
              button.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 })
            ]);
            console.log('[AFM Validator] Form submitted');
            submitted = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!submitted) {
        // Try pressing Enter as fallback
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
      }

      // Step 7: Parse results
      console.log('[AFM Validator] Parsing results...');

      const pageContent = await page.content();
      const pageText = await page.evaluate(() => document.body.innerText);

      // Check if no results
      const noResultsPatterns = [
        'δεν βρέθηκε',
        'δεν βρέθηκαν',
        'not found',
        '0 αποτελέσματα',
        '0 results',
        'no results'
      ];

      const hasNoResults = noResultsPatterns.some(pattern =>
        pageText.toLowerCase().includes(pattern.toLowerCase())
      );

      if (hasNoResults) {
        console.log('[AFM Validator] NOT FOUND');
        await browser.close();
        return {
          afm: cleanedAfm,
          source: 'AADE',
          checked_at: startTime.toISOString(),
          valid_format: true,
          found: false,
          status: 'UNKNOWN',
          name: null,
          doy: null,
          raw_text: pageText.substring(0, 500),
          error: null,
          message: 'ΑΦΜ не найден в AADE'
        };
      }

      // Try to extract company data
      let companyName = null;
      let companyStatus = 'UNKNOWN';
      let doy = null;

      // Look for table rows or result cards
      const results = await page.evaluate(() => {
        const data = [];

        // Try table format
        const rows = document.querySelectorAll('table tr, .result-row, .company-item');
        rows.forEach(row => {
          const text = row.innerText;
          if (text && text.length > 0) {
            data.push(text);
          }
        });

        return data;
      });

      if (results.length > 0) {
        // Extract name from first result
        companyName = results[0].split('\n')[0] || null;

        // Check for status keywords
        const statusText = pageText.toLowerCase();
        if (statusText.includes('ενεργη') || statusText.includes('active')) {
          companyStatus = 'ACTIVE';
        } else if (statusText.includes('διαγραμμενη') || statusText.includes('inactive') ||
                   statusText.includes('closed')) {
          companyStatus = 'INACTIVE';
        }

        // Try to find DOY
        const doyMatch = pageText.match(/ΔΟΥ[:\s]+([Α-ΩA-Z\s]+)/);
        if (doyMatch) {
          doy = doyMatch[1].trim();
        }

        console.log('[AFM Validator] FOUND:', { name: companyName, status: companyStatus });

        await browser.close();

        const message = companyStatus === 'ACTIVE'
          ? `ΑΦΜ найден, статус активен${companyName ? ', ' + companyName : ''}`
          : companyStatus === 'INACTIVE'
          ? `ΑΦΜ найден, статус неактивен${companyName ? ', ' + companyName : ''}`
          : `ΑΦΜ найден${companyName ? ', ' + companyName : ''}`;

        return {
          afm: cleanedAfm,
          source: 'AADE',
          checked_at: startTime.toISOString(),
          valid_format: true,
          found: true,
          status: companyStatus,
          name: companyName,
          doy: doy,
          raw_text: pageText.substring(0, 500),
          error: null,
          message: message
        };
      }

      // If we got here, format seems valid but couldn't parse results
      console.log('[AFM Validator] Results unclear');
      await browser.close();

      return {
        afm: cleanedAfm,
        source: 'AADE',
        checked_at: startTime.toISOString(),
        valid_format: true,
        found: false,
        status: 'UNKNOWN',
        name: null,
        doy: null,
        raw_text: pageText.substring(0, 500),
        error: 'PAGE_CHANGED',
        message: 'Не удалось проверить ΑΦΜ: структура страницы изменилась'
      };

    } catch (error) {
      console.log('[AFM Validator] ERROR:', error.message);

      if (browser) {
        await browser.close();
      }

      // Handle specific errors
      if (error.message === 'BLOCKED_OR_CAPTCHA') {
        return {
          afm: cleanedAfm,
          source: 'AADE',
          checked_at: startTime.toISOString(),
          valid_format: true,
          found: false,
          status: 'UNKNOWN',
          name: null,
          doy: null,
          raw_text: null,
          error: 'BLOCKED_OR_CAPTCHA',
          message: 'Не удалось проверить ΑΦΜ: требуется CAPTCHA'
        };
      }

      if (error.message === 'PAGE_CHANGED') {
        return {
          afm: cleanedAfm,
          source: 'AADE',
          checked_at: startTime.toISOString(),
          valid_format: true,
          found: false,
          status: 'UNKNOWN',
          name: null,
          doy: null,
          raw_text: null,
          error: 'PAGE_CHANGED',
          message: 'Не удалось проверить ΑΦΜ: структура страницы изменилась'
        };
      }

      // Retry on network errors
      if (retryCount < maxRetries &&
          (error.message.includes('timeout') ||
           error.message.includes('net::') ||
           error.message.includes('Navigation'))) {
        retryCount++;
        console.log(`[AFM Validator] Retrying... (${retryCount}/${maxRetries})`);
        continue;
      }

      // Final error
      return {
        afm: cleanedAfm,
        source: 'AADE',
        checked_at: startTime.toISOString(),
        valid_format: true,
        found: false,
        status: 'UNKNOWN',
        name: null,
        doy: null,
        raw_text: null,
        error: error.message.includes('timeout') ? 'TIMEOUT' : 'UNKNOWN_ERROR',
        message: `Не удалось проверить ΑΦΜ: ${error.message}`
      };
    }

    break; // Exit retry loop if successful
  }
}

module.exports = {
  verifyAfm,
  validateAfmFormat
};
