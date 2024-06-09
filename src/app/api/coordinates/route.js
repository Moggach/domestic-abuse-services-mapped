import { NextResponse } from 'next/server';

export async function fetchCoordinates(postcode) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postcode)}.json?country=GB&access_token=${accessToken}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const [longitude, latitude] = data.features[0].geometry.coordinates;
    return { longitude, latitude };
  } else {
    return { error: 'No coordinates found' };
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const postcode = searchParams.get('postcode');
  const coordinates = await fetchCoordinates(postcode);
  if (coordinates.error) {
    return NextResponse.json({ error: 'No coordinates found' }, { status: 404 });
  }
  return NextResponse.json(coordinates);
}
