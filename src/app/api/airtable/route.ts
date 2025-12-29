import { NextResponse } from 'next/server';
import { Client } from 'pg';

import { calculateDistance, fetchCoordinates, isPostcode } from '../../utils';

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    description: string;
    address: string;
    postcode: string;
    email: string;
    website: string;
    phone: string;
    donate: string;
    serviceType: string[];
    serviceSpecialism: string[];
    approved: boolean | undefined;
    localAuthority: string;
    distance?: number;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface ServiceDataFields {
  'Service name'?: string;
  'Service description'?: string;
  'Service address'?: string;
  'Service postcode'?: string;
  'Service email address'?: string;
  'Service website'?: string;
  'Service phone number'?: string;
  'Service donation link'?: string;
  'Service type'?: string[];
  'Specialist services for'?: string[];
  'Local authority'?: string;
  Approved?: boolean;
  Lng?: string;
  Lat?: string;
}

function transformServiceData(serviceData: ServiceDataFields): GeoJSONFeature {
  return {
    type: 'Feature',
    properties: {
      name: serviceData['Service name'] || '',
      description: serviceData['Service description'] || '',
      address: serviceData['Service address'] || '',
      postcode: serviceData['Service postcode'] || '',
      email: serviceData['Service email address'] || '',
      website: serviceData['Service website'] || '',
      phone: serviceData['Service phone number'] || '',
      donate: serviceData['Service donation link'] || '',
      serviceType: serviceData['Service type'] || [],
      serviceSpecialism: serviceData['Specialist services for'] || [],
      approved: serviceData['Approved'],
      localAuthority: serviceData['Local authority'] || '',
    },
    geometry: {
      type: 'Point',
      coordinates: [
        parseFloat(serviceData['Lng'] || '0'),
        parseFloat(serviceData['Lat'] || '0'),
      ],
    },
  };
}

/**
 * @openapi
 * /api/airtable:
 *   get:
 *     summary: Get approved UK domestic abuse services in GeoJSON format
 *     tags:
 *       - Services
 *     parameters:
 *       - in: query
 *         name: postcode
 *         schema:
 *           type: string
 *         description: UK postcode to search near (e.g., "SW1A 1AA")
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in miles (default 10)
 *     responses:
 *       200:
 *         description: A list of services, sorted by distance if postcode provided
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GeoJSONFeature'
 *       400:
 *         description: Invalid postcode format
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const postcode = url.searchParams.get('postcode');
  const radius = parseFloat(url.searchParams.get('radius') || '10');

  if (postcode && !isPostcode(postcode)) {
    return NextResponse.json(
      { error: 'Invalid postcode format' },
      { status: 400 }
    );
  }

  // Connect to PostgreSQL and fetch approved services
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const result = await client.query(
    'SELECT * FROM services WHERE approved = true'
  );
  await client.end();

  let data = result.rows.map((row) => ({
    type: 'Feature',
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
      type: 'Point',
      coordinates: [parseFloat(row.lng || '0'), parseFloat(row.lat || '0')],
    },
  }));

  if (postcode) {
    const coordinates = await fetchCoordinates(postcode);
    if (!coordinates) {
      return NextResponse.json(
        { error: 'Could not find coordinates for the provided postcode' },
        { status: 400 }
      );
    }
    data = data
      .map((service) => {
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          service.geometry.coordinates[1],
          service.geometry.coordinates[0]
        );
        return {
          ...service,
          properties: {
            ...service.properties,
            distance: Math.round(distance * 100) / 100,
          },
        };
      })
      .filter((service) => service.properties.distance! <= radius)
      .sort((a, b) => a.properties.distance! - b.properties.distance!);
  }
  return NextResponse.json(data);
}

/**
 * @openapi
 * /api/airtable:
 *   post:
 *     summary: Add a new domestic abuse service (contact anna_cunnane@proton.me for an authorization token)
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Service name:
 *                 type: string
 *                 example: Test Service
 *               Service address:
 *                 type: string
 *                 example: 123 Main St
 *               Service postcode:
 *                 type: string
 *                 example: AB12 3CD
 *               Service description:
 *                 type: string
 *                 example: This is a test service.
 *               Service email address:
 *                 type: string
 *                 example: test@example.com
 *               Service website:
 *                 type: string
 *                 example: https://example.com
 *               Service phone number:
 *                 type: string
 *                 example: 0123456789
 *               Service donation link:
 *                 type: string
 *                 example: https://donate.example.com
 *               Service type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Support"]
 *               Specialist services for:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Women"]
 *               Local authority:
 *                 type: string
 *                 example: London Borough
 *     responses:
 *       201:
 *         description: Successfully created a new service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized (invalid Bearer token)
 *       500:
 *         description: Airtable error
 */
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
