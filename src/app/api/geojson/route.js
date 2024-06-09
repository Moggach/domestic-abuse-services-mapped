import { NextResponse } from 'next/server';
import { fetchCoordinates } from '../coordinates/route';

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
