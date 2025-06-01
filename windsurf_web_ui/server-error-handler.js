/**
 * Windsurf Error Handler Server
 * Receives client-side errors and logs them for analysis
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Directory to store error logs
const ERROR_LOG_DIR = path.join(__dirname, 'logs');
const ERROR_LOG_FILE = path.join(ERROR_LOG_DIR, 'client-errors.json');

// Ensure log directory exists
if (!fs.existsSync(ERROR_LOG_DIR)) {
  fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
}

// Initialize error log file if it doesn't exist
if (!fs.existsSync(ERROR_LOG_FILE)) {
  fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify([], null, 2));
}

// Load existing errors
let errors = [];
try {
  const errorData = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
  errors = JSON.parse(errorData);
} catch (error) {
  console.error('Failed to load error log file:', error);
  errors = [];
}

// Middleware to handle client errors
router.post('/errors', (req, res) => {
  try {
    const errorData = req.body;
    
    // Add server timestamp
    errorData.serverTimestamp = new Date().toISOString();
    
    // Add to errors array
    errors.push(errorData);
    
    // Limit the number of stored errors to prevent file size issues
    if (errors.length > 1000) {
      errors = errors.slice(-1000);
    }
    
    // Save to file
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(errors, null, 2));
    
    // Log to console
    console.log(`[Windsurf Error Handler] Received client error: ${errorData.message}`);
    
    // Send to Windsurf for analysis (if applicable)
    // This would be implemented based on how Windsurf expects to receive errors
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling client error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all errors (for admin/debugging)
router.get('/errors', (req, res) => {
  res.json(errors);
});

// Get error statistics
router.get('/errors/stats', (req, res) => {
  const stats = {
    total: errors.length,
    byType: {},
    byUrl: {},
    recent: errors.slice(-10)
  };
  
  // Count by type
  errors.forEach(error => {
    if (!stats.byType[error.type]) {
      stats.byType[error.type] = 0;
    }
    stats.byType[error.type]++;
    
    if (!stats.byUrl[error.url]) {
      stats.byUrl[error.url] = 0;
    }
    stats.byUrl[error.url]++;
  });
  
  res.json(stats);
});

// Clear all errors (for admin)
router.delete('/errors', (req, res) => {
  errors = [];
  fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(errors, null, 2));
  res.json({ success: true });
});

module.exports = router;
