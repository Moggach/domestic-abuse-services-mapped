import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Feature, FeatureCollection } from '../App';
import App from '../App';

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return [{ slug: [] }];
}

async function fetchAirtableData(): Promise<Feature[]> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/airtable`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    try {
      const data: Feature[] = JSON.parse(text);
      return data;
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON: ${(jsonError as Error).message}`);
    }
  } catch (error) {
    console.error(`Error fetching Airtable data: ${(error as Error).message}`);
    return [];
  }
}

function flattenAndUnique(data: Feature[]): string[] {
  const allServiceTypes: string[] = data.reduce<string[]>((acc, item) => {
    const serviceTypes = item.properties.serviceType;

    if (Array.isArray(serviceTypes)) {
      acc.push(...serviceTypes);
    } else if (typeof serviceTypes === 'string') {
      acc.push(...serviceTypes.split(',').map((type) => type.trim()));
    }
    return acc;
  }, []);
  return [...new Set(allServiceTypes)].filter(Boolean);
}
function flattenAndUniqueSpecialisms(data: Feature[]): string[] {
  const allSpecialisms: string[] = data.reduce<string[]>((acc, item) => {
    const specialisms = item.properties.serviceSpecialism;
    if (Array.isArray(specialisms)) {
      acc.push(...specialisms);
    } else if (typeof specialisms === 'string') {
      acc.push(...specialisms.split(',').map((specialism) => specialism.trim()));
    }
    return acc;
  }, []);
  return [...new Set(allSpecialisms)].filter(Boolean);
}

const Page: React.FC = async () => {
  const serverAirtableData = await fetchAirtableData();
  const initialServiceTypes = flattenAndUnique(serverAirtableData);
  const initialSpecialisms = flattenAndUniqueSpecialisms(serverAirtableData);

  const featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: serverAirtableData,
  };

  return (
    <App
      serverAirtableData={featureCollection}
      initialServiceTypes={initialServiceTypes}
      initialSpecialisms={initialSpecialisms}
    />
  );
};

export default Page;