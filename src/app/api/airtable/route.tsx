import type { FieldSet, Records } from 'airtable';
import Airtable from 'airtable';
import { NextResponse } from 'next/server';

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
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
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

export async function GET() {
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

  const data = approvedRecords.map((record) =>
    transformServiceData(record.fields as ServiceDataFields)
  );
  return NextResponse.json(data);
}
