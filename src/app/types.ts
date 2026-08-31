export interface Geometry {
  type: 'Point';
  coordinates: [number, number];
}

export interface Properties {
  name: string;
  description: string;
  address: string;
  postcode: string;
  email: string;
  website: string;
  phone: string;
  donate?: string;
  serviceType: string[] | string;
  serviceSpecialism: string[] | string;
  localAuthority: string;
  approved: boolean;
  preciseLocationHidden?: boolean;
}

export interface Feature {
  type: 'Feature';
  properties: Properties;
  geometry: Geometry;
  distance?: number;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

export interface HomePageProps {
  serverData: FeatureCollection;
  initialServiceTypes: string[];
  initialSpecialisms: string[];
  localAuthorities: string[];
}
