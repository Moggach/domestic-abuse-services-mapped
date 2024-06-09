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

export async function POST(req) {
  const { data } = await req.json();

  const featuresWithCoordinates = await Promise.all(data.map(async (item) => {
    const coordinates = await fetchCoordinates(item["Service postcode"]);
    if (coordinates) {
      return {
        type: "Feature",
        properties: {
          name: item["Service name"],
          address: item["Service address"],
          postcode: item["Service postcode"],
          email: item["Service email address"],
          website: item["Service website"],
          phone: item["Service phone number"],
          donate: item["Service donation link"],
          serviceType: item["Service type"],
          specialisms: item["Specialist services for"],
        },
        geometry: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        }
      };
    } else {
      console.error('No coordinates for', item["Service postcode"]);
      return null;
    }
  }));

  const geoJsonData = {
    type: "FeatureCollection",
    features: featuresWithCoordinates.filter(feature => feature !== null)
  };
  return NextResponse.json(geoJsonData);
}
