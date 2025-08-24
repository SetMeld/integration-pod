/* eslint-disable no-console */
import { createIntegrationLogger } from "./logger";

interface CapturedConsole {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  restore: () => void;
}

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

export function captureConsoleForIntegration(
  integrationName: string,
): CapturedConsole {
  const logger = createIntegrationLogger(integrationName);

  const capturedConsole: CapturedConsole = {
    log: (...args: unknown[]) => {
      logger.info("Integration console.log", {
        args: args.map((arg) => String(arg)),
      });
      originalConsole.log(...args);
    },
    error: (...args: unknown[]) => {
      logger.error("Integration console.error", {
        args: args.map((arg) => String(arg)),
      });
      originalConsole.error(...args);
    },
    warn: (...args: unknown[]) => {
      logger.warn("Integration console.warn", {
        args: args.map((arg) => String(arg)),
      });
      originalConsole.warn(...args);
    },
    info: (...args: unknown[]) => {
      logger.info("Integration console.info", {
        args: args.map((arg) => String(arg)),
      });
      originalConsole.info(...args);
    },
    debug: (...args: unknown[]) => {
      logger.debug("Integration console.debug", {
        args: args.map((arg) => String(arg)),
      });
      originalConsole.debug(...args);
    },
    restore: () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    },
  };

  // Override console methods
  console.log = capturedConsole.log;
  console.error = capturedConsole.error;
  console.warn = capturedConsole.warn;
  console.info = capturedConsole.info;
  console.debug = capturedConsole.debug;

  return capturedConsole;
}

export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
}
