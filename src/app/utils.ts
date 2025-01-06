import type { Feature } from '../app/App';

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance * 0.621371; // Convert to miles
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const fetchCoordinates = async (
  postcode: string
): Promise<Coordinates | null> => {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${postcode}`
    );
    const data = await response.json();
    if (data.status === 200) {
      const { latitude, longitude } = data.result;
      return { latitude, longitude };
    } else {
      console.error('Invalid postcode');
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

export const colorMapping: Record<string, string> = {
  'Domestic abuse support': 'bg-pink-400',
  'Legal advice': 'bg-yellow-400',
  'Immigration advice': 'bg-purple-400',
  'Pet fostering': 'bg-cyan-400',
  'Honour based abuse': 'bg-indigo-400',
  'Stalking support': 'bg-teal-400',
  'Housing support': 'bg-amber-400',
  'BAME women': 'border-amber-400 border-2 text-amber-400 font-bold',
  'Jewish Women': 'border-cyan-400 border-2 text-cyan-400 font-bold',
  'LGBTQ survivors': 'border-purple-400 border-2 text-purple-400 font-bold',
  'Latin American Women': 'border-lime-400 border-2 text-lime-400 font-bold',
  'Asian women': 'border-amber-400 border-2 text-amber-400 font-bold',
  'Gypsy, Roma and Traveller women':
    'border-indigo-400 border-2 text-indigo-400 font-bold',
  'Deaf survivors': 'border-teal-400 border-2 text-teal-400 font-bold',
};

export const determineZoomLevel = (): number => {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 768;
  if (screenWidth >= 768) {
    return 5;
  } else {
    return 4;
  }
};

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
