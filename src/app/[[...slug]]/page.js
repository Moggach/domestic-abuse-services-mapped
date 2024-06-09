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

    try {
      const data = JSON.parse(text);
      return data;
    } catch (jsonError) {
      throw new Error(`Failed to parse JSON: ${jsonError.message}`);
    }
  } catch (error) {
    return [];
  }
}

export default async function Page() {
  const serverAirtableData = await fetchAirtableData();

  return (
    <>
      <Home serverAirtableData={serverAirtableData} />
    </>
  );
}
