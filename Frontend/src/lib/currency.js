// World Currencies Database & Automatic Geolocation Detection Service

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateFromUSD: 83.5 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateFromUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateFromUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateFromUSD: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateFromUSD: 155.0 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', rateFromUSD: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateFromUSD: 1.51 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', rateFromUSD: 3.67 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', rateFromUSD: 1.35 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', rateFromUSD: 7.24 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', rateFromUSD: 5.15 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', rateFromUSD: 18.4 }
];

// Country ISO Code -> Currency Code Map
const COUNTRY_CURRENCY_MAP = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  AE: 'AED',
  SG: 'SGD',
  CN: 'CNY',
  BR: 'BRL',
  ZA: 'ZAR'
};

// Timezone -> Currency Mappings for instant zero-latency browser detection
const TIMEZONE_CURRENCY_MAP = {
  'Asia/Kolkata': 'INR',
  'Asia/Calcutta': 'INR',
  'America/New_York': 'USD',
  'America/Chicago': 'USD',
  'America/Denver': 'USD',
  'America/Los_Angeles': 'USD',
  'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD',
  'America/Toronto': 'CAD',
  'America/Vancouver': 'CAD',
  'Europe/London': 'GBP',
  'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Rome': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Dublin': 'EUR',
  'Asia/Tokyo': 'JPY',
  'Australia/Sydney': 'AUD',
  'Australia/Melbourne': 'AUD',
  'Australia/Brisbane': 'AUD',
  'Australia/Perth': 'AUD',
  'Asia/Dubai': 'AED',
  'Asia/Singapore': 'SGD',
  'Asia/Shanghai': 'CNY',
  'America/Sao_Paulo': 'BRL',
  'Africa/Johannesburg': 'ZAR'
};

/**
 * Multi-Provider Asynchronous Geo-IP Location Fetcher
 * Tries fast geolocation APIs sequentially to find user's exact country/currency
 */
export async function fetchGeoIPCurrency() {
  const fetchWithTimeout = async (url, timeoutMs = 2500) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return await res.json();
    } catch (e) {
      clearTimeout(timer);
    }
    return null;
  };

  // Provider 1: ipapi.co
  try {
    const data = await fetchWithTimeout('https://ipapi.co/json/');
    if (data) {
      const code = data.currency || COUNTRY_CURRENCY_MAP[data.country_code];
      if (code) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase());
        if (found) return found;
      }
    }
  } catch (e) {}

  // Provider 2: geojs.io
  try {
    const data = await fetchWithTimeout('https://get.geojs.io/v1/ip/geo.json');
    if (data && data.country_code) {
      const code = COUNTRY_CURRENCY_MAP[data.country_code.toUpperCase()];
      if (code) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (found) return found;
      }
    }
  } catch (e) {}

  // Provider 3: ipwho.is
  try {
    const data = await fetchWithTimeout('https://ipwho.is/');
    if (data && data.success) {
      const code = data.currency?.code || COUNTRY_CURRENCY_MAP[data.country_code];
      if (code) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === code.toUpperCase());
        if (found) return found;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Detects currency automatically based on location & environment:
 * 1. Saved user preference in localStorage (if user explicitly overrode)
 * 2. Instant Browser Timezone Location Check (Zero Latency)
 * 3. Browser Locale Location Check
 * 4. Fallback Default
 */
export async function detectAutoCurrency() {
  // 1. Check local saved currency preference if explicitly set
  const saved = localStorage.getItem('sb_user_currency');
  if (saved) {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === saved.toUpperCase());
    if (found) return found;
  }

  // 2. Instant Location via Browser Timezone
  try {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTz && TIMEZONE_CURRENCY_MAP[userTz]) {
      const matchCode = TIMEZONE_CURRENCY_MAP[userTz];
      const match = SUPPORTED_CURRENCIES.find(c => c.code === matchCode);
      if (match) return match;
    }
  } catch (e) {
    console.warn('Timezone currency detection fallback', e);
  }

  // 3. Instant Location via Browser Language / Locale
  try {
    const userLangs = navigator.languages || [navigator.language || ''];
    for (const lang of userLangs) {
      if (lang.includes('IN')) return SUPPORTED_CURRENCIES.find(c => c.code === 'INR');
      if (lang.includes('GB')) return SUPPORTED_CURRENCIES.find(c => c.code === 'GBP');
      if (lang.includes('CA')) return SUPPORTED_CURRENCIES.find(c => c.code === 'CAD');
      if (lang.includes('AU')) return SUPPORTED_CURRENCIES.find(c => c.code === 'AUD');
      if (lang.includes('JP')) return SUPPORTED_CURRENCIES.find(c => c.code === 'JPY');
      if (lang.includes('AE')) return SUPPORTED_CURRENCIES.find(c => c.code === 'AED');
      if (lang.includes('US')) return SUPPORTED_CURRENCIES.find(c => c.code === 'USD');
    }
  } catch (e) {
    console.warn('Locale currency detection fallback', e);
  }

  // Default fallback if no location detected
  return SUPPORTED_CURRENCIES[0]; // INR
}

export function saveUserCurrency(currencyCode) {
  localStorage.setItem('sb_user_currency', currencyCode);
}

export function getSavedCurrency() {
  const code = localStorage.getItem('sb_user_currency') || 'INR';
  return SUPPORTED_CURRENCIES.find(c => c.code === code) || SUPPORTED_CURRENCIES[0];
}

export function formatMoney(amount, currencyObj) {
  const currency = currencyObj || getSavedCurrency();
  const convertedAmount = amount * (currency.rateFromUSD || 1);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(convertedAmount);
  } catch (e) {
    return `${currency.symbol}${convertedAmount.toLocaleString()}`;
  }
}
