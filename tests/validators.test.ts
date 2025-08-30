import { registerSchema } from '@/lib/validators';
import { expect, test } from 'vitest';

test('rejects invalid email', () => {
  const result = registerSchema.safeParse({ email: 'bad', password: '123456' });
  expect(result.success).toBe(false);
});
