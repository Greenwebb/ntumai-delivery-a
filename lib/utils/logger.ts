// Comprehensive logging utility for mobile app debugging
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string; // 'api', 'ui', 'user-action', 'error', etc.
  message: string;
  data?: any;
  stack?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
}

// Logger configuration
export interface LoggerConfig {
  enabled: boolean;
  maxEntries: number;
  logLevel: LogLevel;
  storeLocally: boolean;
  sendToServer: boolean;
  serverEndpoint?: string;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: __DEV__ || true, // Enable in both dev and production for debugging
  maxEntries: 1000,
  logLevel: LogLevel.DEBUG,
  storeLocally: true,
  sendToServer: false,
  serverEndpoint: undefined,
};

// Logger class
export class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private userId?: string;
  private sessionId: string;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Only load from storage on native platforms
    if (this.config.storeLocally && Platform.OS !== 'web') {
      this.loadLogsFromStorage();
    }
  }

  // Set user ID for logging
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Log an entry
  private log(level: LogLevel, category: string, message: string, data?: any, component?: string): void {
    if (!this.config.enabled || this.shouldLog(level)) {
      const logEntry: LogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data,
        component,
        userId: this.userId,
        sessionId: this.sessionId,
      };

      // Add stack trace for error logs
      if (level === LogLevel.ERROR) {
        logEntry.stack = new Error().stack;
      }

      this.logs.push(logEntry);

      // Maintain max entries
      if (this.logs.length > this.config.maxEntries) {
        this.logs = this.logs.slice(-this.config.maxEntries);
      }

      // Store locally if configured
      if (this.config.storeLocally) {
        this.saveLogsToStorage();
      }

      // Send to server if configured
      if (this.config.sendToServer && this.config.serverEndpoint) {
        this.sendLogToServer(logEntry);
      }

      // Console logging in development
      if (__DEV__) {
        this.logToConsole(logEntry);
      }
    }
  }

  // Check if log level should be logged
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.config.logLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  // Log to console for development
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.category}] ${entry.message}`;
    const details = {
      timestamp: entry.timestamp,
      level: entry.level,
      component: entry.component,
      data: entry.data,
      userId: entry.userId,
      sessionId: entry.sessionId,
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(`%c[DEBUG] ${prefix}`, 'color: #008800', details);
        break;
      case LogLevel.INFO:
        console.info(`%c[INFO] ${prefix}`, 'color: #0000FF', details);
        break;
      case LogLevel.WARN:
        console.warn(`%c[WARN] ${prefix}`, 'color: #FFA500', details);
        break;
      case LogLevel.ERROR:
        console.error(`%c[ERROR] ${prefix}`, 'color: #FF0000', details);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
    }
  }

  // Send log to server
  private async sendLogToServer(entry: LogEntry): Promise<void> {
    if (!this.config.serverEndpoint) return;

    try {
      await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.warn('Failed to send log to server:', error);
    }
  }

  // Save logs to AsyncStorage
  private async saveLogsToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  // Load logs from AsyncStorage
  private async loadLogsFromStorage(): Promise<void> {
    try {
      const storedLogs = await AsyncStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.warn('Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  // Clear logs
  async clearLogs(): Promise<void> {
    this.logs = [];
    if (this.config.storeLocally) {
      try {
        await AsyncStorage.removeItem('app_logs');
      } catch (error) {
        console.warn('Failed to clear logs from storage:', error);
      }
    }
  }

  // Get logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Export logs as JSON string
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Export logs by category
  exportLogsByCategory(category: string): string {
    const categoryLogs = this.getLogsByCategory(category);
    return JSON.stringify(categoryLogs, null, 2);
  }

  // API logging methods
  logApiCall(method: string, url: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, 'api', `API Call: ${method} ${url}`, {
      method,
      url,
      data,
    }, component);
  }

  logApiResponse(url: string, status: number, response?: any, component?: string): void {
    this.log(LogLevel.INFO, 'api', `API Response: ${url} - Status: ${status}`, {
      url,
      status,
      response,
    }, component);
  }

  logApiError(url: string, error: any, component?: string): void {
    this.log(LogLevel.ERROR, 'api', `API Error: ${url}`, {
      url,
      error: error.message || error,
      stack: error.stack,
    }, component);
  }

  // User action logging methods
  logButtonPress(buttonName: string, component?: string, additionalData?: any): void {
    this.log(LogLevel.INFO, 'user-action', `Button Pressed: ${buttonName}`, {
      buttonName,
      component,
      ...additionalData,
    }, component);
  }

  logScreenView(screenName: string, additionalData?: any): void {
    this.log(LogLevel.INFO, 'navigation', `Screen Viewed: ${screenName}`, {
      screenName,
      ...additionalData,
    }, screenName);
  }

  logUserInteraction(interactionType: string, element: string, component?: string, additionalData?: any): void {
    this.log(LogLevel.INFO, 'user-action', `${interactionType}: ${element}`, {
      interactionType,
      element,
      component,
      ...additionalData,
    }, component);
  }

  // Error logging methods
  logError(message: string, error?: any, component?: string): void {
    this.log(LogLevel.ERROR, 'error', message, {
      error: error?.message || error,
      stack: error?.stack,
    }, component);
  }

  logWarning(message: string, data?: any, component?: string): void {
    this.log(LogLevel.WARN, 'warning', message, data, component);
  }

  logInfo(message: string, data?: any, component?: string): void {
    this.log(LogLevel.INFO, 'info', message, data, component);
  }

  logDebug(message: string, data?: any, component?: string): void {
    this.log(LogLevel.DEBUG, 'debug', message, data, component);
  }
}

// Global logger instance
export const logger = new Logger();

// Hook to use logger in components
export const useLogger = (componentName?: string) => {
  return {
    logApiCall: (method: string, url: string, data?: any) => 
      logger.logApiCall(method, url, data, componentName),
    logApiResponse: (url: string, status: number, response?: any) => 
      logger.logApiResponse(url, status, response, componentName),
    logApiError: (url: string, error: any) => 
      logger.logApiError(url, error, componentName),
    logButtonPress: (buttonName: string, additionalData?: any) => 
      logger.logButtonPress(buttonName, componentName, additionalData),
    logScreenView: (screenName: string, additionalData?: any) => 
      logger.logScreenView(screenName, additionalData),
    logUserInteraction: (interactionType: string, element: string, additionalData?: any) => 
      logger.logUserInteraction(interactionType, element, componentName, additionalData),
    logError: (message: string, error?: any) => 
      logger.logError(message, error, componentName),
    logWarning: (message: string, data?: any) => 
      logger.logWarning(message, data, componentName),
    logInfo: (message: string, data?: any) => 
      logger.logInfo(message, data, componentName),
    logDebug: (message: string, data?: any) => 
      logger.logDebug(message, data, componentName),
  };
};