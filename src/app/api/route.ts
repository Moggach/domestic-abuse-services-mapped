import { NextResponse } from 'next/server';

import { getServicesFromDb } from '../../services/serviceData';
import { calculateDistance, fetchCoordinates, isPostcode } from '../utils';

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
