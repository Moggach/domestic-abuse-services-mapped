import Airtable from 'airtable';
import { NextResponse } from 'next/server';

let cachedData = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function GET() {
  const now = Date.now();
  if (cachedData && lastFetchTime && now - lastFetchTime < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  let base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID);

  const records = await base('services').select().firstPage();
  
  const data = records.map(record => record.fields);

  cachedData = data;
  lastFetchTime = now;

  return NextResponse.json(data);
}
