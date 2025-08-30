import { rateLimit } from '@/lib/rateLimit';
import { expect, test } from 'vitest';

test('rate limit blocks after 30 requests', () => {
  const ip = '1.1.1.1';
  for (let i = 0; i < 30; i++) {
    expect(rateLimit(ip)).toBe(true);
  }
  expect(rateLimit(ip)).toBe(false);
});
