/**
 * Utility to validate authorization for Cron API routes.
 * 
 * Checks for:
 * 1. Authorization: Bearer <CRON_SECRET>
 * 2. ?secret=<CRON_SECRET> query parameter (useful for testing or manual triggers)
 * 3. In development (when CRON_SECRET is not configured), access is permitted with a warning.
 */
export function validateCronAuth(req) {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured in environment, allow with warning in development
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CRON_SECRET is not configured in production environment.');
    }
    return { authorized: true };
  }

  // 1. Check Bearer Token header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === cronSecret) {
      return { authorized: true };
    }
  }

  // 2. Check query parameter ?secret=... or ?key=...
  try {
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret') || url.searchParams.get('key');
    if (querySecret && querySecret === cronSecret) {
      return { authorized: true };
    }
  } catch (e) {
    // Ignore URL parse error if any
  }

  return { authorized: false, error: 'Unauthorized: Invalid or missing CRON_SECRET' };
}
