/**
 * Windsurf Error Handler
 * Captures client-side errors and sends them to the Windsurf backend for analysis
 */

(function() {
  // Configuration
  const ERROR_ENDPOINT = '/api/errors';
  const LOG_TO_CONSOLE = true;
  const MAX_ERROR_STACK_LENGTH = 5000;
  
  // Error types to capture
  const errorTypes = {
    RUNTIME: 'runtime',
    NETWORK: 'network',
    PROMISE: 'promise',
    RESOURCE: 'resource',
    CUSTOM: 'custom'
  };
  
  // Format error object for transmission
  function formatError(error, type, metadata = {}) {
    const errorData = {
      type: type,
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack ? error.stack.substring(0, MAX_ERROR_STACK_LENGTH) : 'No stack trace',
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        ...metadata,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        referrer: document.referrer,
        sessionDuration: (performance.now() / 1000).toFixed(2)
      }
    };
    
    return errorData;
  }
  
  // Send error to Windsurf backend
  async function sendErrorToWindsurf(errorData) {
    try {
      if (LOG_TO_CONSOLE) {
        console.error('[Windsurf Error Handler]', errorData);
      }
      
      const response = await fetch(ERROR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      });
      
      if (!response.ok) {
        console.error('[Windsurf Error Handler] Failed to send error:', response.statusText);
      }
    } catch (sendError) {
      // Fallback to localStorage if we can't send the error
      try {
        const storedErrors = JSON.parse(localStorage.getItem('windsurf_errors') || '[]');
        storedErrors.push(errorData);
        localStorage.setItem('windsurf_errors', JSON.stringify(storedErrors.slice(-20))); // Keep last 20 errors
        console.error('[Windsurf Error Handler] Error stored locally:', sendError);
      } catch (storageError) {
        console.error('[Windsurf Error Handler] Complete failure:', storageError);
      }
    }
  }
  
  // Global error handler
  window.onerror = function(message, source, lineno, colno, error) {
    const errorData = formatError(
      error || { message, stack: `at ${source}:${lineno}:${colno}` },
      errorTypes.RUNTIME
    );
    sendErrorToWindsurf(errorData);
    return false; // Let the default handler run
  };
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    const errorData = formatError(
      event.reason instanceof Error ? event.reason : { message: String(event.reason) },
      errorTypes.PROMISE
    );
    sendErrorToWindsurf(errorData);
  });
  
  // Network error handler
  window.addEventListener('error', function(event) {
    // Only handle resource loading errors (not caught by window.onerror)
    if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      const errorData = formatError(
        { message: `Failed to load resource: ${event.target.src || event.target.href}` },
        errorTypes.RESOURCE,
        { resourceType: event.target.tagName.toLowerCase() }
      );
      sendErrorToWindsurf(errorData);
    }
  }, true);
  
  // Expose API for manual error reporting
  window.WindsurfErrorHandler = {
    reportError: function(error, metadata = {}) {
      const errorData = formatError(
        error instanceof Error ? error : { message: String(error) },
        errorTypes.CUSTOM,
        metadata
      );
      sendErrorToWindsurf(errorData);
    },
    
    // Utility to flush stored errors if they couldn't be sent previously
    flushStoredErrors: async function() {
      try {
        const storedErrors = JSON.parse(localStorage.getItem('windsurf_errors') || '[]');
        if (storedErrors.length === 0) return;
        
        for (const errorData of storedErrors) {
          await fetch(ERROR_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
          });
        }
        
        localStorage.removeItem('windsurf_errors');
        console.log(`[Windsurf Error Handler] Flushed ${storedErrors.length} stored errors`);
      } catch (error) {
        console.error('[Windsurf Error Handler] Failed to flush stored errors:', error);
      }
    }
  };
  
  // Try to flush stored errors on load
  document.addEventListener('DOMContentLoaded', function() {
    window.WindsurfErrorHandler.flushStoredErrors();
  });
  
  console.log('[Windsurf Error Handler] Initialized');
})();
