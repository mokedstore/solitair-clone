export interface PlayerOriginRecord {
  id: string;
  ip?: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  flag: string;
  device: 'mobile' | 'tablet' | 'desktop';
  referrer: string;
  source: string; // 'Facebook', 'Direct', 'Google', etc.
  timestamp: number;
}

const STORAGE_KEY = 'ssp_player_origins_log';

/**
 * Detects device category from user agent and screen dimensions
 */
export function getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  if (isTablet || (window.innerWidth <= 1024 && window.innerWidth > 600)) {
    return 'tablet';
  }
  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua) || window.innerWidth <= 600;
  if (isMobile) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Identifies the traffic source (e.g. Facebook, Instagram, Google, Direct)
 */
export function detectTrafficSource(): { referrer: string; source: string } {
  if (typeof window === 'undefined') return { referrer: 'Direct', source: 'Direct' };
  
  const ref = document.referrer || '';
  const searchParams = new URLSearchParams(window.location.search);
  const fbclid = searchParams.get('fbclid');

  if (fbclid || ref.includes('facebook.com') || ref.includes('fb.com')) {
    return { referrer: ref || 'Facebook App/Web', source: 'Facebook' };
  }
  if (ref.includes('instagram.com')) {
    return { referrer: ref, source: 'Instagram' };
  }
  if (ref.includes('twitter.com') || ref.includes('t.co') || ref.includes('x.com')) {
    return { referrer: ref, source: 'Twitter / X' };
  }
  if (ref.includes('google.')) {
    return { referrer: ref, source: 'Google' };
  }
  if (ref.length > 0) {
    try {
      const url = new URL(ref);
      return { referrer: ref, source: url.hostname };
    } catch {
      return { referrer: ref, source: 'Referral' };
    }
  }
  return { referrer: 'Direct Link', source: 'Direct' };
}

/**
 * Fetches the user's geographical location using free CORS-friendly IP lookup
 */
export async function fetchCurrentPlayerOrigin(): Promise<PlayerOriginRecord> {
  const device = getDeviceCategory();
  const { referrer, source } = detectTrafficSource();
  const timestamp = Date.now();
  const id = `visit_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;

  // Default fallback in case offline or API blocked
  const fallbackRecord: PlayerOriginRecord = {
    id,
    country: 'Local',
    countryCode: 'LOC',
    city: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    region: navigator.language || '',
    flag: '🌍',
    device,
    referrer,
    source,
    timestamp,
  };

  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data && data.success !== false) {
      const record: PlayerOriginRecord = {
        id,
        country: data.country || 'Unknown Country',
        countryCode: data.country_code || '',
        city: data.city || 'Unknown City',
        region: data.region || '',
        flag: data.flag?.emoji || '🌐',
        device,
        referrer,
        source,
        timestamp,
      };

      saveOriginRecord(record);
      return record;
    }
  } catch {
    // Network or adblocker fallback
  }

  saveOriginRecord(fallbackRecord);
  return fallbackRecord;
}

/**
 * Saves visitor record to localStorage log (keeps last 50 visits)
 */
export function saveOriginRecord(record: PlayerOriginRecord): void {
  try {
    const existing = getStoredOriginRecords();
    // Avoid duplicate entry within 1 minute from the same session
    const isRecentDuplicate = existing.length > 0 &&
      (Date.now() - existing[0].timestamp < 60000) &&
      existing[0].city === record.city &&
      existing[0].country === record.country;

    if (!isRecentDuplicate) {
      const updated = [record, ...existing].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // LocalStorage full or blocked
  }
}

/**
 * Retrieves the stored origin records from localStorage
 */
export function getStoredOriginRecords(): PlayerOriginRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
