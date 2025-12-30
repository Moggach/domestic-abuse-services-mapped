import { Client } from 'pg';

export async function getServicesFromDb() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const result = await client.query(
      'SELECT * FROM services where approved = true'
    );

    return result.rows.map((row) => ({
      type: 'Feature' as const,
      properties: {
        name: row.name || '',
        description: row.description || '',
        address: row.address || '',
        postcode: row.postcode || '',
        email: row.email || '',
        website: row.website || '',
        phone: row.phone || '',
        donate: row.donate || '',
        serviceType: row.service_type || [],
        serviceSpecialism: row.service_specialism || [],
        approved: row.approved,
        localAuthority: row.local_authority || '',
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [parseFloat(row.lng || '0'), parseFloat(row.lat || '0')],
      },
    }));
  } finally {
    await client.end();
  }
}
