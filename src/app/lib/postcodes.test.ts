import {
  fetchCoordinates,
  fetchLocalAuthority,
  lookupPostcode,
} from './postcodes';

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

describe('lookupPostcode', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns the formatted postcode and coordinates when found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: 200,
        result: { postcode: 'BD1 4PS', latitude: 53.79, longitude: -1.75 },
      }),
    }) as unknown as typeof fetch;

    await expect(lookupPostcode(' bd14ps ')).resolves.toEqual({
      status: 'found',
      postcode: 'BD1 4PS',
      latitude: 53.79,
      longitude: -1.75,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.postcodes.io/postcodes/bd14ps'
    );
  });

  it('URL-encodes the postcode', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      json: async () => ({ status: 404 }),
    }) as unknown as typeof fetch;

    await lookupPostcode('BD1 4PS');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.postcodes.io/postcodes/BD1%204PS'
    );
  });

  it('reports not_found for a 404', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      json: async () => ({ status: 404, error: 'Postcode not found' }),
    }) as unknown as typeof fetch;

    await expect(lookupPostcode('ZZ99 9ZZ')).resolves.toEqual({
      status: 'not_found',
    });
  });

  it('reports error for other failures', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      json: async () => ({ status: 500 }),
    }) as unknown as typeof fetch;

    await expect(lookupPostcode('BD1 4PS')).resolves.toEqual({
      status: 'error',
    });
  });

  it('reports error when the request fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

    await expect(lookupPostcode('BD1 4PS')).resolves.toEqual({
      status: 'error',
    });
  });
});
