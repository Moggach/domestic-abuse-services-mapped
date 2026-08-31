import { Client } from 'pg';

import type { Feature } from '../app/types';

export async function getServicesFromDb(): Promise<Feature[]> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
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
        preciseLocationHidden: row.location_level === 'borough_only',
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

export interface NewServiceInput {
  'Service name': string;
  'Service description'?: string;
  'Service address': string;
  'Service postcode': string;
  'Service email address'?: string;
  'Service website'?: string;
  'Service phone number'?: string;
  'Service donation link'?: string;
  'Service type'?: string[];
  'Specialist services for'?: string[];
  'Local authority'?: string;
}

export async function createService(
  input: NewServiceInput
): Promise<{ id: string }> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const insertQuery = `
      INSERT INTO services (
        name, description, address, postcode, email, website, phone, donate,
        service_type, service_specialism, local_authority, approved
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING id
    `;

    const values = [
      input['Service name'],
      input['Service description'] || '',
      input['Service address'],
      input['Service postcode'],
      input['Service email address'] || '',
      input['Service website'] || '',
      input['Service phone number'] || '',
      input['Service donation link'] || '',
      input['Service type'] || [],
      input['Specialist services for'] || [],
      input['Local authority'] || '',
      false, // approved
    ];

    const result = await client.query(insertQuery, values);
    return { id: result.rows[0].id };
  } finally {
    await client.end();
  }
}
