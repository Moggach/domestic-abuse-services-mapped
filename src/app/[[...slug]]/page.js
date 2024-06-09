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
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/airtable`);
  const data = await response.json();
  return data;
}

export default async function Page() {
  const serverAirtableData = await fetchAirtableData();

  return (
    <>
      <Home serverAirtableData={serverAirtableData} />
    </>
  );
}