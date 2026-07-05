const stringifyMeta = (meta) => {
  if (meta == null) return '';
  if (typeof meta === 'string') return meta;
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
};

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const suffix = meta === undefined ? '' : ` ${stringifyMeta(meta)}`;
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}`;

  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else if (level === 'debug') console.debug(line);
  else console.log(line);
}

export const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => log('debug', message, meta)
};

export default logger;
