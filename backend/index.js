/**
 * Apallaktis Backend Server
 * Express API with AFM validation service
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Routes
const afmRoutes = require('./routes/afm');
app.use('/api/afm', afmRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Apallaktis Backend API',
    version: '1.0.0',
    endpoints: {
      afm_validate: 'POST /api/afm/validate - Fast format validation',
      afm_verify: 'POST /api/afm/verify - Full AADE verification (slow)',
      health: 'GET /api/afm/health - Health check'
    }
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Apallaktis Backend running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/afm/validate - Format validation`);
  console.log(`   POST http://localhost:${PORT}/api/afm/verify - AADE verification`);
  console.log(`   GET  http://localhost:${PORT}/api/afm/health - Health check`);
});

module.exports = app;
