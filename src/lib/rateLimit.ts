const requests = new Map<string, { count: number; first: number }>();
const LIMIT = 30;
const WINDOW = 60_000; // 1 minute

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip);
  if (!entry || now - entry.first > WINDOW) {
    requests.set(ip, { count: 1, first: now });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}
