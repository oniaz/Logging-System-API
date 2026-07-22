export const LOG_LEVELS = Object.freeze(["INFO", "WARN", "ERROR"]);

export const isValidLogLevel = (level) => LOG_LEVELS.includes(level);
