/**
 * Centralized Logger for DiscreetKit
 * Supports structured logging with contexts, trace IDs, and levels.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogOptions {
    context?: string;
    traceId?: string;
    data?: any;
}

class Logger {
    private isProduction = process.env.NODE_ENV === 'production';

    private format(level: LogLevel, message: string, options?: LogOptions) {
        const timestamp = new Date().toISOString();
        const context = options?.context ? `[${options.context}]` : '';
        const trace = options?.traceId ? `[${options.traceId}]` : '';
        const data = options?.data ? `\nData: ${JSON.stringify(options.data, null, 2)}` : '';
        
        return `${timestamp} [${level}]${context}${trace} ${message}${data}`;
    }

    info(message: string, options?: LogOptions) {
        console.log(this.format('INFO', message, options));
    }

    warn(message: string, options?: LogOptions) {
        console.warn(this.format('WARN', message, options));
    }

    error(message: string, options?: LogOptions) {
        console.error(this.format('ERROR', message, options));
        if (options?.data instanceof Error) {
            console.error(options.data);
        }
    }

    debug(message: string, options?: LogOptions) {
        if (!this.isProduction || process.env.DEBUG_MODE === 'true') {
            console.log(this.format('DEBUG', message, options));
        }
    }
}

export const logger = new Logger();
