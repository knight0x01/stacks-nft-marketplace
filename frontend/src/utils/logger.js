export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.isDev = import.meta.env.DEV;
  }

  info(message, ...args) {
    if (this.isDev) {
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[${this.context}] ${message}`, ...args);
  }

  debug(message, ...args) {
    if (this.isDev) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
