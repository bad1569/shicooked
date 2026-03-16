/**
 * Firebase Error Logging & Debugging Utility
 * Helps diagnose Firebase authentication and database issues
 */

class FirebaseDebugger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  // Log with timestamp
  log(category, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      category,
      message,
      data
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const style = this.getStyleForCategory(category);
    console.log(
      `%c[${category}] ${message}`,
      style,
      data || ''
    );

    return logEntry;
  }

  getStyleForCategory(category) {
    const styles = {
      'AUTH': 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;',
      'ERROR': 'background: #f44336; color: white; padding: 2px 6px; border-radius: 3px;',
      'WARNING': 'background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px;',
      'DEBUG': 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px;',
      'NETWORK': 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px;',
      'DATABASE': 'background: #00BCD4; color: white; padding: 2px 6px; border-radius: 3px;',
      'SUCCESS': 'background: #8BC34A; color: white; padding: 2px 6px; border-radius: 3px;'
    };
    return styles[category] || 'color: gray;';
  }

  // Log Firebase errors with code and message
  logFirebaseError(errorCode, errorMessage, context = '') {
    this.log('ERROR', `Firebase Error [${errorCode}]: ${errorMessage}`, {
      code: errorCode,
      message: errorMessage,
      context: context
    });
  }

  // Log network requests
  logNetworkRequest(method, url, status, responseTime) {
    this.log('NETWORK', `${method} ${url} - ${status}`, {
      method,
      url,
      status,
      responseTime: `${responseTime}ms`
    });
  }

  // Log authentication events
  logAuthEvent(eventType, details) {
    this.log('AUTH', eventType, details);
  }

  // Log database operations
  logDatabaseOp(operation, path, success) {
    this.log('DATABASE', `${operation} ${path}`, { success });
  }

  // Get all logs
  getAllLogs() {
    return this.logs;
  }

  // Get logs by category
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  // Export logs as JSON (for debugging)
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    console.log('%c[DEBUGGER] Logs cleared', this.getStyleForCategory('DEBUG'));
  }

  // Print summary
  printSummary() {
    console.group('%c Firebase Debug Summary', this.getStyleForCategory('DEBUG'));
    console.log(`Total logs: ${this.logs.length}`);
    console.log(`Auth logs: ${this.getLogsByCategory('AUTH').length}`);
    console.log(`Errors: ${this.getLogsByCategory('ERROR').length}`);
    console.log(`Network requests: ${this.getLogsByCategory('NETWORK').length}`);
    console.log(`Database ops: ${this.getLogsByCategory('DATABASE').length}`);
    console.groupEnd();
  }

  // Diagnose common issues
  diagnoseIssues() {
    console.group('%c Firebase Issue Diagnosis', this.getStyleForCategory('WARNING'));
    
    const errors = this.getLogsByCategory('ERROR');
    const authLogs = this.getLogsByCategory('AUTH');
    const networkLogs = this.getLogsByCategory('NETWORK');

    // Check for specific error patterns
    const errorCodes = errors.map(e => e.data?.code);
    
    if (errorCodes.includes('auth/operation-not-allowed')) {
      console.warn('[WARNING] Email/Password authentication is not enabled in Firebase');
      console.warn('   Solution: Enable it in Firebase Console > Authentication > Sign-in method');
    }

    if (errorCodes.includes('auth/email-already-in-use')) {
      console.warn('[WARNING] Email already registered');
      console.warn('   Solution: Use a different email or log in with existing account');
    }

    if (errorCodes.includes('auth/weak-password')) {
      console.warn('[WARNING] Password is too weak (must be 6+ characters)');
      console.warn('   Solution: Use a stronger password');
    }

    if (errors.length > 5) {
      console.error('[ERROR] Multiple errors detected. Check console logs above.');
    }

    if (authLogs.length === 0) {
      console.warn('[WARNING] No auth logs found - authentication may not have been attempted');
    }

    console.log('Recent logs:');
    console.table(this.logs.slice(-10));
    console.groupEnd();
  }
}

// Create global instance
const firebaseDebugger = new FirebaseDebugger();

// Expose to window for console access
window.firebaseDebugger = firebaseDebugger;

export default firebaseDebugger;

/**
 * Usage in console:
 * 
 * Get all logs:
 *   window.firebaseDebugger.getAllLogs()
 * 
 * Get error logs:
 *   window.firebaseDebugger.getLogsByCategory('ERROR')
 * 
 * Print summary:
 *   window.firebaseDebugger.printSummary()
 * 
 * Diagnose issues:
 *   window.firebaseDebugger.diagnoseIssues()
 * 
 * Export logs:
 *   copy(window.firebaseDebugger.exportLogs())
 * 
 * Clear logs:
 *   window.firebaseDebugger.clearLogs()
 */
