import { calculateDistance, determineZoomLevel, isPostcode } from './geo';

describe('calculateDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateDistance(51.5074, -0.1278, 51.5074, -0.1278)).toBe(0);
  });

  it('returns the known distance between London and Manchester in miles', () => {
    // London (Trafalgar Sq) -> Manchester (Piccadilly Gardens), ~163 miles as the crow flies
    const distance = calculateDistance(51.508, -0.1281, 53.4809, -2.2374);
    expect(distance).toBeGreaterThan(160);
    expect(distance).toBeLessThan(166);
  });

  it('is symmetric regardless of argument order', () => {
    const a = calculateDistance(51.5074, -0.1278, 53.4809, -2.2374);
    const b = calculateDistance(53.4809, -2.2374, 51.5074, -0.1278);
    expect(a).toBeCloseTo(b, 10);
  });
});

describe('isPostcode', () => {
  it.each([
    'SW1A 1AA',
    'sw1a1aa',
    'AB12 3CD',
    'M1 1AE',
    'B33 8TH',
    'W1A 0AX',
    'EC1A 1BB',
  ])('accepts valid UK postcode "%s"', (postcode) => {
    expect(isPostcode(postcode)).toBe(true);
  });

  it.each(['', 'not a postcode', '12345', 'SW1A', 'SW1A 1AAA', '   '])(
    'rejects invalid input "%s"',
    (input) => {
      expect(isPostcode(input)).toBe(false);
    }
  );

  it('trims surrounding whitespace before validating', () => {
    expect(isPostcode('  SW1A 1AA  ')).toBe(true);
  });
});

describe('determineZoomLevel', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('returns 5 for desktop-width screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    expect(determineZoomLevel()).toBe(5);
  });

  it('returns 4 for mobile-width screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 375,
    });
    expect(determineZoomLevel()).toBe(4);
  });
});
