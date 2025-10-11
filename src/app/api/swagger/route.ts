import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';

import { swaggerOptions } from '../../../../swagger'; // adjust this path if needed

export async function GET() {
  const spec = swaggerJsdoc(swaggerOptions);
  return NextResponse.json(spec);
}
