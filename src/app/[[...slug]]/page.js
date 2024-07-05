import '../../index.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import Home from '../App';

export async function generateStaticParams() {
  const slugs = [
    { slug: [] },
  ];

  return slugs;
}

async function fetchAirtableData() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/airtable`;
  console.log(`Fetching Airtable data from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log(`Fetched data: ${text}`);

    try {
      const data = JSON.parse(text);
      console.log(`Parsed data: ${JSON.stringify(data, null, 2)}`);
      return data;
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error(`Error fetching Airtable data: ${error.message}`);
    return [];
  }
}

const flattenAndUnique = (data) => {
  const allServiceTypes = data.reduce((acc, item) => {
    const serviceTypes = item.properties?.serviceType || item['Service type'];
    if (Array.isArray(serviceTypes)) {
      acc.push(...serviceTypes);
    } else if (typeof serviceTypes === 'string') {
      acc.push(...serviceTypes.split(',').map(type => type.trim()));
    } else if (serviceTypes) {
      acc.push(serviceTypes);
    }
    return acc;
  }, []);
  return [...new Set(allServiceTypes)].filter(Boolean);
};

const flattenAndUniqueSpecialisms = (data) => {
  const allSpecialisms = data.reduce((acc, item) => {
    const specialisms = item.properties?.serviceSpecialism || item['Service specialism'];
    if (Array.isArray(specialisms)) {
      acc.push(...specialisms);
    } else if (typeof specialisms === 'string') {
      acc.push(...specialisms.split(',').map(specialism => specialism.trim()));
    } else if (specialisms) {
      acc.push(specialisms);
    }
    return acc;
  }, []);
  return [...new Set(allSpecialisms)].filter(Boolean);
};

const Page = async () => {
  const serverAirtableData = await fetchAirtableData();
  const initialServiceTypes = flattenAndUnique(serverAirtableData);
  const initialSpecialisms = flattenAndUniqueSpecialisms(serverAirtableData);
  const featureCollection = {
    type: "FeatureCollection",
    features: serverAirtableData
  };

  return (
    <Home
      serverAirtableData={featureCollection}
      initialServiceTypes={initialServiceTypes}
      initialSpecialisms={initialSpecialisms}
    />
  );
};

export default Page;
