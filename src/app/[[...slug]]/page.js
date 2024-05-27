import '../../index.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { ClientOnly } from './client';

export async function generateStaticParams() {
  const slugs = [
    { slug: [] }, 
  ];

  return slugs;
}

export default function Page() {
  return (
    <>
      <ClientOnly />
    </>
  );
}
