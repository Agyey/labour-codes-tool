/**
 * Structured JSON Logger for Railway Observability
 * Replaces console.log/error with structured JSON output for better indexing
 * and searchability in log aggregators.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

const buildLogMessage = (level: LogLevel, message: string, context?: LogContext, error?: unknown) => {
  const logObj: Record<string, any> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (error instanceof Error) {
    logObj.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  } else if (error) {
    logObj.error = error;
  }

  return JSON.stringify(logObj);
};

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(buildLogMessage('info', message, context));
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(buildLogMessage('warn', message, context));
  },
  error: (message: string, error?: unknown, context?: LogContext) => {
    console.error(buildLogMessage('error', message, context, error));
  },
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(buildLogMessage('debug', message, context));
    }
  },
};
