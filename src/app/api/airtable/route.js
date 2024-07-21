import Airtable from 'airtable';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 0 }); 

function transformServiceData(serviceData) {
    return {
        type: "Feature",
        properties: {
            name: serviceData["Service name"] || "",
            address: serviceData["Service address"] || "",
            postcode: serviceData["Service postcode"] || "",
            email: serviceData["Service email address"] || "",
            website: serviceData["Service website"] || "",
            phone: serviceData["Service phone number"] || "",
            donate: serviceData["Service donation link"] || "", 
            serviceType: serviceData["Service type"] || [],
            serviceSpecialism: serviceData["Specialist services for"] || []
        },
        geometry: {
            type: "Point",
            coordinates: [
                parseFloat(serviceData["Lng"] || 0),
                parseFloat(serviceData["Lat"] || 0)
            ]
        }
    };
}

export async function GET() {
  const cachedData = cache.get("geoJsonData");
  
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  let base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);
  const records = await base('services').select().firstPage();
  const data = records.map(record => transformServiceData(record.fields));

  cache.set("geoJsonData", data);
  
  return NextResponse.json(data);
}
