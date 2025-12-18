/**
 * AFM Validation API Routes
 */

const express = require('express');
const router = express.Router();
const { verifyAfm, validateAfmFormat } = require('../services/afmValidator');

/**
 * POST /api/afm/validate
 * Validate AFM format only (no external check)
 *
 * Body: { afm: "123456789" }
 * Returns: { valid: boolean, cleaned: string, error: string|null }
 */
router.post('/validate', async (req, res) => {
  try {
    const { afm } = req.body;

    if (!afm) {
      return res.status(400).json({
        error: 'AFM is required'
      });
    }

    const result = validateAfmFormat(afm);

    return res.json(result);
  } catch (error) {
    console.error('AFM validation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/afm/verify
 * Verify AFM through AADE (full check with browser automation)
 *
 * Body: { afm: "123456789" }
 * Returns: Full verification object with company data
 */
router.post('/verify', async (req, res) => {
  try {
    const { afm } = req.body;

    if (!afm) {
      return res.status(400).json({
        error: 'AFM is required'
      });
    }

    // This operation can take 10-30 seconds
    const result = await verifyAfm(afm);

    return res.json(result);
  } catch (error) {
    console.error('AFM verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/afm/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AFM Validator',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
