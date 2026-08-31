import type { Feature } from '../types';

export const filterByServiceType = (
  data: Feature[],
  serviceType: string
): Feature[] => {
  if (!serviceType) return data;
  return data.filter((item) => {
    const type = item.properties?.serviceType;
    return Array.isArray(type)
      ? type.includes(serviceType)
      : type === serviceType;
  });
};

export const filterByLocalAuthority = (
  data: Feature[],
  localAuthority: string
): Feature[] => {
  if (!localAuthority) return data;
  return data.filter((item) => {
    const type = item.properties?.localAuthority;
    return Array.isArray(type)
      ? type.includes(localAuthority)
      : type === localAuthority;
  });
};

export const filterBySpecialisms = (
  data: Feature[],
  specialisms: string[]
): Feature[] => {
  if (!specialisms.length) return data;
  return data.filter((item) => {
    const itemSpecialisms = item.properties?.serviceSpecialism;
    return specialisms.some((specialism) =>
      Array.isArray(itemSpecialisms)
        ? itemSpecialisms.includes(specialism)
        : itemSpecialisms === specialism
    );
  });
};

export const flattenAndUnique = (data: Feature[]): string[] => {
  const allServiceTypes: string[] = data.reduce<string[]>(
    (acc: string[], item: Feature) => {
      const serviceTypes: string | string[] | undefined =
        item.properties.serviceType;

      if (Array.isArray(serviceTypes)) {
        acc.push(...serviceTypes);
      } else if (typeof serviceTypes === 'string') {
        acc.push(...serviceTypes.split(',').map((type: string) => type.trim()));
      }
      return acc;
    },
    []
  );
  return [...new Set(allServiceTypes)].filter(Boolean);
};

export const flattenAndUniqueSpecialisms = (data: Feature[]): string[] => {
  const allSpecialisms: string[] = data.reduce<string[]>((acc, item) => {
    const specialisms = item.properties.serviceSpecialism;
    if (Array.isArray(specialisms)) {
      acc.push(...specialisms);
    } else if (typeof specialisms === 'string') {
      acc.push(
        ...specialisms.split(',').map((specialism) => specialism.trim())
      );
    }
    return acc;
  }, []);
  return [...new Set(allSpecialisms)].filter(Boolean);
};

export const extractUniqueLocalAuthorities = (data: Feature[]): string[] => {
  const allLocalAuthorities: string[] = data.reduce<string[]>((acc, item) => {
    const localAuthority = item.properties.localAuthority;

    if (localAuthority && typeof localAuthority === 'string') {
      acc.push(localAuthority.trim());
    }
    return acc;
  }, []);

  return [...new Set(allLocalAuthorities)].filter(Boolean);
};
