import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

import type { NewServiceInput } from '../../services/serviceData';
import { createService, getServicesFromDb } from '../../services/serviceData';
import { calculateDistance, isPostcode } from '../lib/geo';
import { fetchCoordinates } from '../lib/postcodes';

/**
 * @openapi
 * /api:
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

  let data = await getServicesFromDb();

  if (postcode) {
    const coordinates = await fetchCoordinates(postcode);
    if (!coordinates) {
      return NextResponse.json(
        { error: 'Postcode not found' },
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
      .filter((s) => s.properties.distance! <= radius)
      .sort((a, b) => a.properties.distance! - b.properties.distance!);
  }

  return NextResponse.json({ type: 'FeatureCollection', features: data });
}

/**
 * @openapi
 * /api:
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
 *         description: Server error
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

export async function POST(req: Request) {
  const ip =
    req.headers.get('cf-connecting-ip') ||
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
  if (!authHeader || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers }
    );
  }

  const body: NewServiceInput = await req.json();

  const requiredFields: (keyof NewServiceInput)[] = [
    'Service name',
    'Service address',
    'Service postcode',
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing field: ${field}` },
        { status: 400, headers }
      );
    }
  }

  try {
    const { id } = await createService(body);
    return NextResponse.json({ success: true, id }, { headers });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500, headers }
    );
  }
}
