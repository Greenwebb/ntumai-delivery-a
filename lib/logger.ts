/**
 * Centralized logging utility
 * 
 * Provides environment-aware logging with different levels:
 * - debug: Verbose logging for development
 * - info: General information
 * - warn: Warning messages
 * - error: Error messages
 * 
 * In production, only warnings and errors are logged.
 * In development, all levels are logged with color coding.
 * 
 * Usage:
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('User data:', user);
 * logger.info('API request started');
 * logger.warn('Deprecated API used');
 * logger.error('Failed to fetch data', error);
 * ```
 */

const isDevelopment = __DEV__;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Debug level logging - only in development
   */
  debug(message: string, ...data: any[]) {
    if (!isDevelopment) return;
    
    this.log('debug', message, data);
    console.log(`🔍 [DEBUG]`, message, ...data);
  }

  /**
   * Info level logging
   */
  info(message: string, ...data: any[]) {
    this.log('info', message, data);
    
    if (isDevelopment) {
      console.log(`ℹ️ [INFO]`, message, ...data);
    } else {
      console.log(message, ...data);
    }
  }

  /**
   * Warning level logging
   */
  warn(message: string, ...data: any[]) {
    this.log('warn', message, data);
    
    if (isDevelopment) {
      console.warn(`⚠️ [WARN]`, message, ...data);
    } else {
      console.warn(message, ...data);
    }
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, ...data: any[]) {
    this.log('error', message, { error, ...data });
    
    if (isDevelopment) {
      console.error(`❌ [ERROR]`, message, error, ...data);
    } else {
      console.error(message, error);
    }

    // TODO: Send to error tracking service (Sentry, etc.)
    // if (!isDevelopment) {
    //   Sentry.captureException(error, { extra: { message, data } });
    // }
  }

  /**
   * Store log entry in memory
   */
  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get recent logs (useful for error reports)
   */
  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON string (for error reports)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();
