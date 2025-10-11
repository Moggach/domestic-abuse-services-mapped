import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { FieldSet, Records } from 'airtable';
import Airtable from 'airtable';
import { NextResponse } from 'next/server';

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

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

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

  const ip = req.headers.get('cf-connecting-ip') || 
           req.headers.get('x-forwarded-for')?.split(',')[0] || 
           'anonymous';

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers }
    );
  }

  if (postcode && !isPostcode(postcode)) {
    return NextResponse.json(
      { error: 'Invalid postcode format' },
      { status: 400, headers }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json(
      { error: 'Airtable API key or Base ID is missing' },
      { status: 500 }
    );
  }

  const base = new Airtable({ apiKey }).base(baseId);

  let allRecords: Records<FieldSet> = [];

  const fetchAllRecords = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      base('services')
        .select()
        .eachPage(
          (records, fetchNextPage) => {
            allRecords = allRecords.concat(records);
            fetchNextPage();
          },
          (error) => {
            if (error) {
              console.error('Error fetching records:', error);
              reject(error);
            } else {
              resolve();
            }
          }
        );
    });
  };

  try {
    await fetchAllRecords();
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }

  const approvedRecords = allRecords.filter(
    (record) => record.fields['Approved'] === true
  );

  let data = approvedRecords.map((record) =>
    transformServiceData(record.fields as ServiceDataFields)
  );

  if (postcode) {
    const coordinates = await fetchCoordinates(postcode);
    
    if (!coordinates) {
      return NextResponse.json(
        { error: 'Could not find coordinates for the provided postcode' },
        { status: 400, headers }
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
            distance: Math.round(distance * 100) / 100
          }
        };
      })
      .filter((service) => service.properties.distance! <= radius)
      .sort((a, b) => a.properties.distance! - b.properties.distance!);
  }

  return NextResponse.json(data, { headers });
}

/**
 * @openapi
 * /api/airtable:
 *   post:
 *     summary: Add a new domestic abuse service (contact hello@domesticabuseservices.uk for an authorization token)
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
export async function POST(req: Request) {
  const ip = req.headers.get('cf-connecting-ip') || 
           req.headers.get('x-forwarded-for')?.split(',')[0] || 
           'anonymous';

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers }
    );
  }

  const adminToken = process.env.ADMIN_API_TOKEN;
  const authHeader = req.headers.get('authorization');
  const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500, headers });
  }

  const base = new Airtable({ apiKey }).base(baseId);
  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  const body = await req.json();

  const requiredFields = ['Service name', 'Service address', 'Service postcode'];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400, headers });
    }
  }

  try {
    const created = await base('services').create([
      {
        fields: {
          'Service name': body['Service name'],
          'Service description': body['Service description'],
          'Service address': body['Service address'],
          'Service postcode': body['Service postcode'],
          'Service email address': body['Service email address'],
          'Service website': body['Service website'],
          'Service phone number': body['Service phone number'],
          'Service donation link': body['Service donation link'],
          'Service type': body['Service type'] || [],
          'Specialist services for': body['Specialist services for'] || [],
          'Local authority': body['Local authority'],
          'Approved': false,
        },
      },
    ]);

    return NextResponse.json({ success: true, id: created[0].id }, { headers });
  } catch (error) {
    console.error('Airtable error:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500, headers });
  }
}
