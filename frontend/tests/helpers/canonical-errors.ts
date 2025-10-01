// Import canonical error definitions from actual source
let ERR: any = {};

try {
  const errorsA = require('@/lib/errors');
  ERR = errorsA.ERR || errorsA;
} catch {}

try {
  const errorsB = require('@/lib/app-error');
  ERR = ERR.ERR ? ERR : (errorsB.ERR || errorsB);
} catch {}

export { ERR };
export const DEFAULT_RETRIES = 2;
export const DEFAULT_TIMEOUT_MS = 30000;
