import type { Feature } from '../types';

import {
  extractUniqueLocalAuthorities,
  filterByLocalAuthority,
  filterByServiceType,
  filterBySpecialisms,
  flattenAndUnique,
  flattenAndUniqueSpecialisms,
} from './filters';

function makeFeature(overrides: Partial<Feature['properties']>): Feature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: {
      name: 'Test Service',
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
      ...overrides,
    },
  };
}

describe('filterByServiceType', () => {
  const data = [
    makeFeature({ name: 'A', serviceType: ['Refuge', 'Support'] }),
    makeFeature({ name: 'B', serviceType: 'Helpline' }),
    makeFeature({ name: 'C', serviceType: ['Support'] }),
  ];

  it('returns all data when no service type is given', () => {
    expect(filterByServiceType(data, '')).toHaveLength(3);
  });

  it('matches services whose serviceType array includes the given type', () => {
    const result = filterByServiceType(data, 'Support');
    expect(result.map((f) => f.properties.name)).toEqual(['A', 'C']);
  });

  it('matches services whose serviceType is a plain string equal to the given type', () => {
    const result = filterByServiceType(data, 'Helpline');
    expect(result.map((f) => f.properties.name)).toEqual(['B']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterByServiceType(data, 'Nonexistent')).toEqual([]);
  });
});

describe('filterByLocalAuthority', () => {
  const data = [
    makeFeature({ name: 'A', localAuthority: 'Camden' }),
    makeFeature({ name: 'B', localAuthority: 'Hackney' }),
  ];

  it('returns all data when no local authority is given', () => {
    expect(filterByLocalAuthority(data, '')).toHaveLength(2);
  });

  it('filters to matching local authority only', () => {
    const result = filterByLocalAuthority(data, 'Camden');
    expect(result.map((f) => f.properties.name)).toEqual(['A']);
  });
});

describe('filterBySpecialisms', () => {
  const data = [
    makeFeature({ name: 'A', serviceSpecialism: ['Women', 'LGBTQ+'] }),
    makeFeature({ name: 'B', serviceSpecialism: 'Men' }),
    makeFeature({ name: 'C', serviceSpecialism: ['Children'] }),
  ];

  it('returns all data when no specialisms are given', () => {
    expect(filterBySpecialisms(data, [])).toHaveLength(3);
  });

  it('matches if any selected specialism is present (array field)', () => {
    const result = filterBySpecialisms(data, ['LGBTQ+']);
    expect(result.map((f) => f.properties.name)).toEqual(['A']);
  });

  it('matches if any selected specialism is present (string field)', () => {
    const result = filterBySpecialisms(data, ['Men', 'Nonexistent']);
    expect(result.map((f) => f.properties.name)).toEqual(['B']);
  });

  it('supports multiple selected specialisms matching different items', () => {
    const result = filterBySpecialisms(data, ['Women', 'Children']);
    expect(result.map((f) => f.properties.name)).toEqual(['A', 'C']);
  });
});

describe('flattenAndUnique', () => {
  it('flattens array serviceType fields and dedupes', () => {
    const data = [
      makeFeature({ serviceType: ['Refuge', 'Support'] }),
      makeFeature({ serviceType: ['Support', 'Helpline'] }),
    ];
    expect(flattenAndUnique(data).sort()).toEqual(
      ['Helpline', 'Refuge', 'Support'].sort()
    );
  });

  it('splits comma-separated string serviceType fields', () => {
    const data = [makeFeature({ serviceType: 'Refuge, Support ,Helpline' })];
    expect(flattenAndUnique(data).sort()).toEqual(
      ['Helpline', 'Refuge', 'Support'].sort()
    );
  });

  it('filters out falsy/empty values', () => {
    const data = [makeFeature({ serviceType: ['Refuge', ''] })];
    expect(flattenAndUnique(data)).toEqual(['Refuge']);
  });
});

describe('flattenAndUniqueSpecialisms', () => {
  it('flattens and dedupes specialisms across array and string fields', () => {
    const data = [
      makeFeature({ serviceSpecialism: ['Women'] }),
      makeFeature({ serviceSpecialism: 'Women, Men' }),
    ];
    expect(flattenAndUniqueSpecialisms(data).sort()).toEqual(
      ['Men', 'Women'].sort()
    );
  });
});

describe('extractUniqueLocalAuthorities', () => {
  it('trims, dedupes, and drops empty local authorities', () => {
    const data = [
      makeFeature({ localAuthority: ' Camden ' }),
      makeFeature({ localAuthority: 'Camden' }),
      makeFeature({ localAuthority: '' }),
    ];
    expect(extractUniqueLocalAuthorities(data)).toEqual(['Camden']);
  });
});
