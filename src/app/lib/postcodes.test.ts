import { fetchCoordinates, fetchLocalAuthority } from './postcodes';

describe('fetchCoordinates', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns latitude/longitude when the API reports success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        status: 200,
        result: { latitude: 51.5074, longitude: -0.1278 },
      }),
    }) as unknown as typeof fetch;

    const result = await fetchCoordinates('SW1A 1AA');
    expect(result).toEqual({ latitude: 51.5074, longitude: -0.1278 });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.postcodes.io/postcodes/SW1A 1AA'
    );
  });

  it('returns null when the API reports a non-200 status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ status: 404 }),
    }) as unknown as typeof fetch;

    await expect(fetchCoordinates('ZZ99 9ZZ')).resolves.toBeNull();
  });

  it('returns null and does not throw when the request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    await expect(fetchCoordinates('SW1A 1AA')).resolves.toBeNull();
  });
});

describe('fetchLocalAuthority', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns the admin district when the API reports success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        status: 200,
        result: { admin_district: 'Camden' },
      }),
    }) as unknown as typeof fetch;

    await expect(fetchLocalAuthority('SW1A 1AA')).resolves.toBe('Camden');
  });

  it('returns null when the API reports a non-200 status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ status: 404 }),
    }) as unknown as typeof fetch;

    await expect(fetchLocalAuthority('ZZ99 9ZZ')).resolves.toBeNull();
  });

  it('returns null and does not throw when the request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    await expect(fetchLocalAuthority('SW1A 1AA')).resolves.toBeNull();
  });
});
