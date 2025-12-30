import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getServicesFromDb } from '../../services/serviceData';
import type { Feature, FeatureCollection } from '../App';
import App from '../App';
import {
  flattenAndUnique,
  flattenAndUniqueSpecialisms,
  extractUniqueLocalAuthorities,
} from '../utils';

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return [{ slug: [] }];
}

const Page: React.FC = async () => {
  const serviceData = await getServicesFromDb();

  const fixedServiceData = serviceData.map((feature) => ({
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: [
        feature.geometry.coordinates[0] ?? 0,
        feature.geometry.coordinates[1] ?? 0,
      ] as [number, number],
    },
  }));

  const initialServiceTypes = flattenAndUnique(fixedServiceData);
  const initialSpecialisms = flattenAndUniqueSpecialisms(fixedServiceData);
  const localAuthorities = extractUniqueLocalAuthorities(fixedServiceData);
  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: fixedServiceData,
  };

  return (
    <App
      serverAirtableData={featureCollection}
      initialServiceTypes={initialServiceTypes}
      initialSpecialisms={initialSpecialisms}
      localAuthorities={localAuthorities}
    />
  );
};

export default Page;
