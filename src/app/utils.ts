import type { IconType } from 'react-icons';
import {
  AiOutlineHome,
  AiOutlineSafety,
  AiOutlineIdcard,
} from 'react-icons/ai';
import {
  FaHandsHelping,
  FaGavel,
  FaDog,
  FaEye
 
} from 'react-icons/fa';
import { RiPsychotherapyLine } from "react-icons/ri";

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



export const iconMapping: Record<string, IconType> = {
  'Domestic abuse support': FaHandsHelping,
  'Legal advice': FaGavel,
  'Immigration advice': AiOutlineIdcard,
  'Pet fostering': FaDog,
  'Honour based abuse': FaEye,
  'Stalking support': AiOutlineSafety,
  'Housing support': AiOutlineHome,
  "Counselling service": RiPsychotherapyLine,
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
