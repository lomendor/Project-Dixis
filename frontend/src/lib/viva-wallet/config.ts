/**
 * Viva Wallet Configuration
 * Reads from environment variables
 */

export type VivaEnvironment = 'demo' | 'live';

export interface VivaWalletConfig {
  environment: VivaEnvironment;
  merchantId: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  sourceCode: string;
  baseUrl: string;
  authUrl: string;
  checkoutUrl: string;
}

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export function getVivaWalletConfig(): VivaWalletConfig {
  const environment = (process.env.VIVA_WALLET_ENV || 'demo') as VivaEnvironment;
  const isDemo = environment === 'demo';

  return {
    environment,
    merchantId: getEnv('VIVA_WALLET_MERCHANT_ID'),
    apiKey: getEnv('VIVA_WALLET_API_KEY'),
    clientId: getEnv('VIVA_WALLET_CLIENT_ID'),
    clientSecret: getEnv('VIVA_WALLET_CLIENT_SECRET'),
    sourceCode: getEnv('VIVA_WALLET_SOURCE_CODE'),
    // API endpoints differ between demo and production
    baseUrl: isDemo
      ? 'https://demo-api.vivapayments.com'
      : 'https://api.vivapayments.com',
    authUrl: isDemo
      ? 'https://demo-accounts.vivapayments.com/connect/token'
      : 'https://accounts.vivapayments.com/connect/token',
    checkoutUrl: isDemo
      ? 'https://demo.vivapayments.com/web/checkout'
      : 'https://www.vivapayments.com/web/checkout',
  };
}

/**
 * Check if Viva Wallet is properly configured
 */
export function isVivaWalletConfigured(): boolean {
  try {
    const config = getVivaWalletConfig();
    return !!(
      config.merchantId &&
      config.apiKey &&
      config.clientId &&
      config.clientSecret &&
      config.sourceCode
    );
  } catch {
    return false;
  }
}
