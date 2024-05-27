import '../../index.css';
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
