/**
 * @jest-environment node
 */
/**
 * Exercises the REAL Upstash-backed rate limiter configured in route.ts.
 * Unlike route.test.ts, @upstash/redis and @upstash/ratelimit are NOT
 * mocked here, so this makes real network calls against your Upstash
 * instance and needs live UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * credentials. It's opt-in via `npm run test:ratelimit`, not part of the
 * default `npm test` run.
 */
import { randomUUID } from 'crypto';

jest.mock('../../services/serviceData', () => ({
  getServicesFromDb: jest.fn().mockResolvedValue([]),
  createService: jest.fn(),
}));

import { GET, POST } from './route';

const hasUpstashCreds =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

if (!hasUpstashCreds) {
  // eslint-disable-next-line no-console
  console.warn(
    'Skipping live rate-limit tests: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set.'
  );
}

const describeIfLive = hasUpstashCreds ? describe : describe.skip;

// A fresh, random client id per test isolates it from Upstash state left
// over by other test runs or manual curl testing against the same bucket.
function requestWithClientId(
  method: 'GET' | 'POST',
  clientId: string,
  init: RequestInit = {}
): Request {
  return new Request('http://localhost/api', {
    method,
    ...init,
    headers: {
      'x-forwarded-for': clientId,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

describeIfLive('GET /api rate limiting (live Upstash)', () => {
  it('allows the first 30 requests in a window, then returns 429', async () => {
    const clientId = `test-get-${randomUUID()}`;
    const statuses: number[] = [];

    for (let i = 0; i < 31; i++) {
      const res = await GET(requestWithClientId('GET', clientId));
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 30)).toEqual(new Array(30).fill(200));
    expect(statuses[30]).toBe(429);
  });

  it('reports X-RateLimit-Remaining counting down by one per request', async () => {
    const clientId = `test-get-headers-${randomUUID()}`;

    const first = await GET(requestWithClientId('GET', clientId));
    const second = await GET(requestWithClientId('GET', clientId));

    const firstRemaining = Number(first.headers.get('X-RateLimit-Remaining'));
    const secondRemaining = Number(second.headers.get('X-RateLimit-Remaining'));

    expect(secondRemaining).toBe(firstRemaining - 1);
  });
});

describeIfLive('POST /api rate limiting (live Upstash)', () => {
  it('allows the first 5 requests in a window, then returns 429', async () => {
    const clientId = `test-post-${randomUUID()}`;
    const statuses: number[] = [];

    for (let i = 0; i < 6; i++) {
      // Rate limiting runs before the auth check, and the token here is
      // deliberately wrong, so under-limit requests 401 rather than
      // succeed — nothing gets written to the real database.
      const res = await POST(
        requestWithClientId('POST', clientId, {
          headers: { authorization: 'Bearer definitely-not-the-real-token' },
          body: JSON.stringify({}),
        })
      );
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 5)).toEqual(new Array(5).fill(401));
    expect(statuses[5]).toBe(429);
  });
});
