import Airtable from 'airtable';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); 

export async function GET() {
  const cachedData = cache.get("geoJsonData");
  
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  let base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);
  const records = await base('services').select().firstPage();
  const data = records.map(record => record.fields);

  cache.set("geoJsonData", data);
  
  return NextResponse.json(data);
}
