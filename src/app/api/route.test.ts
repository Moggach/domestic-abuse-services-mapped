/**
 * @jest-environment node
 */
import type { Feature } from '../types';

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));

// Mock instances are tracked on a static property (rather than a module-scope
// variable) so the array exists as soon as the factory runs, before route.ts's
// module-level `new Ratelimit(...)` calls fire.
jest.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    limit: jest.Mock;
    static instances: { limit: jest.Mock }[] = [];
    constructor() {
      this.limit = jest.fn().mockResolvedValue({
        success: true,
        limit: 30,
        remaining: 29,
        reset: 1700000000,
      });
      Ratelimit.instances.push(this);
    }
    static slidingWindow = jest.fn(() => 'sliding-window-limiter');
  }
  return { Ratelimit };
});

jest.mock('../../services/serviceData', () => ({
  getServicesFromDb: jest.fn(),
  createService: jest.fn(),
}));

jest.mock('../lib/postcodes', () => ({
  fetchCoordinates: jest.fn(),
}));

import { Ratelimit } from '@upstash/ratelimit';

import { createService, getServicesFromDb } from '../../services/serviceData';
import { fetchCoordinates } from '../lib/postcodes';

import { GET, POST } from './route';

const mockGetServicesFromDb = getServicesFromDb as jest.Mock;
const mockCreateService = createService as jest.Mock;
const mockFetchCoordinates = fetchCoordinates as jest.Mock;

// route.ts creates readRatelimit then writeRatelimit at module load, in that order.
const [readRatelimit, writeRatelimit] = (
  Ratelimit as unknown as { instances: { limit: jest.Mock }[] }
).instances;

function makeService(overrides: {
  name: string;
  lng: number;
  lat: number;
}): Feature {
  return {
    type: 'Feature',
    properties: {
      name: overrides.name,
      description: '',
      address: '',
      postcode: '',
      email: '',
      website: '',
      phone: '',
      serviceType: [],
      serviceSpecialism: [],
      localAuthority: '',
      approved: true,
    },
    geometry: { type: 'Point', coordinates: [overrides.lng, overrides.lat] },
  };
}

describe('GET /api', () => {
  const originalAdminToken = process.env.ADMIN_API_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    readRatelimit.limit.mockResolvedValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: 1700000000,
    });
    mockGetServicesFromDb.mockResolvedValue([
      makeService({ name: 'Near London', lng: -0.1278, lat: 51.5074 }),
      makeService({ name: 'Near Manchester', lng: -2.2374, lat: 53.4809 }),
    ]);
  });

  afterEach(() => {
    process.env.ADMIN_API_TOKEN = originalAdminToken;
  });

  it('returns 429 with rate-limit headers when the read limit is exceeded', async () => {
    readRatelimit.limit.mockResolvedValue({
      success: false,
      limit: 30,
      remaining: 0,
      reset: 1700000000,
    });

    const res = await GET(new Request('http://localhost/api'));

    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(mockGetServicesFromDb).not.toHaveBeenCalled();
  });

  it('returns 400 for a malformed postcode', async () => {
    const res = await GET(
      new Request('http://localhost/api?postcode=not-a-postcode')
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid postcode/i);
  });

  it('returns 400 when the postcode cannot be geocoded', async () => {
    mockFetchCoordinates.mockResolvedValue(null);

    const res = await GET(
      new Request('http://localhost/api?postcode=ZZ99+9ZZ')
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/postcode not found/i);
  });

  it('returns every service unmodified when no postcode is given', async () => {
    const res = await GET(new Request('http://localhost/api'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.type).toBe('FeatureCollection');
    expect(body.features).toHaveLength(2);
    expect(body.features[0].properties.distance).toBeUndefined();
  });

  it('filters by radius and sorts by distance when a postcode is given', async () => {
    // Roughly London coordinates: London service is ~0mi, Manchester ~163mi away.
    mockFetchCoordinates.mockResolvedValue({
      latitude: 51.508,
      longitude: -0.1281,
    });

    const res = await GET(
      new Request('http://localhost/api?postcode=SW1A+1AA&radius=50')
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.features).toHaveLength(1);
    expect(body.features[0].properties.name).toBe('Near London');
    expect(body.features[0].properties.distance).toBeLessThan(50);
  });

  it('sorts multiple in-radius results nearest-first', async () => {
    mockGetServicesFromDb.mockResolvedValue([
      makeService({ name: 'Farther', lng: -0.2, lat: 51.6 }),
      makeService({ name: 'Nearer', lng: -0.1278, lat: 51.5074 }),
    ]);
    mockFetchCoordinates.mockResolvedValue({
      latitude: 51.5074,
      longitude: -0.1278,
    });

    const res = await GET(
      new Request('http://localhost/api?postcode=SW1A+1AA&radius=100')
    );
    const body = await res.json();

    expect(body.features.map((f: Feature) => f.properties.name)).toEqual([
      'Nearer',
      'Farther',
    ]);
  });
});

describe('POST /api', () => {
  const originalAdminToken = process.env.ADMIN_API_TOKEN;
  const validBody = {
    'Service name': 'Test Service',
    'Service address': '123 Main St',
    'Service postcode': 'SW1A 1AA',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_API_TOKEN = 'test-admin-token';
    writeRatelimit.limit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: 1700000000,
    });
    mockCreateService.mockResolvedValue({ id: 'new-id' });
  });

  afterEach(() => {
    process.env.ADMIN_API_TOKEN = originalAdminToken;
  });

  function postRequest(body: unknown, authHeader?: string) {
    return new Request('http://localhost/api', {
      method: 'POST',
      headers: authHeader ? { authorization: authHeader } : undefined,
      body: JSON.stringify(body),
    });
  }

  it('returns 429 with rate-limit headers when the write limit is exceeded', async () => {
    writeRatelimit.limit.mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: 1700000000,
    });

    const res = await POST(postRequest(validBody, 'Bearer test-admin-token'));

    expect(res.status).toBe(429);
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it('returns 401 when no Authorization header is sent', async () => {
    const res = await POST(postRequest(validBody));

    expect(res.status).toBe(401);
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it('returns 401 when the bearer token is wrong', async () => {
    const res = await POST(postRequest(validBody, 'Bearer wrong-token'));

    expect(res.status).toBe(401);
  });

  it('returns 401 rather than authorizing when ADMIN_API_TOKEN is unset', async () => {
    delete process.env.ADMIN_API_TOKEN;

    const res = await POST(postRequest(validBody, 'Bearer undefined'));

    expect(res.status).toBe(401);
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it('returns 400 when a required field is missing', async () => {
    const { ['Service name']: _omitted, ...incomplete } = validBody;

    const res = await POST(postRequest(incomplete, 'Bearer test-admin-token'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Service name/);
    expect(mockCreateService).not.toHaveBeenCalled();
  });

  it('creates the service and returns its id on valid input', async () => {
    const res = await POST(postRequest(validBody, 'Bearer test-admin-token'));

    expect(mockCreateService).toHaveBeenCalledWith(validBody);
    const body = await res.json();
    expect(body).toEqual({ success: true, id: 'new-id' });
  });

  it('returns 500 when createService throws', async () => {
    mockCreateService.mockRejectedValue(new Error('db down'));

    const res = await POST(postRequest(validBody, 'Bearer test-admin-token'));

    expect(res.status).toBe(500);
  });
});
