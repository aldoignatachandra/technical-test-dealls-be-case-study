import winston from "winston";
import { iso } from "./times";

const customLevel = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    integration: 3,
    transaction: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    integration: "blue",
    info: "green",
    transaction: "magenta",
  },
};

// Add color to Winston
winston.addColors(customLevel.colors);

// Create a custom logger
const logger = winston.createLogger({
  levels: customLevel.levels,
  level: "transaction",
  handleExceptions: true,
  handleRejections: true,
  format: winston.format.combine(
    winston.format.colorize({ message: true, level: true }),
    winston.format.timestamp({ format: () => iso(new Date()) }),
    winston.format.ms(),
    winston.format.printf((info) => {
      const { timestamp, level, message, context, scope, meta, ms } = info;
      return `${level}: [${context} - ${scope}] ${message} | ${timestamp} | ${ms} | ${meta ? JSON.stringify(meta) : ""}`;
    })
  ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

// Define log functions
type LogMeta = Record<string, any>;

const log = (context: string, message: string, scope: string): void => {
  const obj = { context, scope, message: message.toString() };
  logger.info(obj);
};

const info = (context: string, message: string, scope: string, meta?: LogMeta): void => {
  const obj = { context, scope, message, meta };
  logger.info(obj);
};

const warn = (context: string, message: string, scope: string, meta?: LogMeta): void => {
  const obj = { context, scope, message, meta };
  logger.warn(obj);
};

const error = (context: string, message: string, scope: string, meta?: LogMeta): void => {
  const obj = { context, scope, message, meta };
  logger.error(obj);
};

// Export the logging functions
export { log, info, warn, error };
