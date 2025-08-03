import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../../../../swagger'; // adjust this path if needed
import { NextResponse } from 'next/server';

export async function GET() {
  const spec = swaggerJsdoc(swaggerOptions);
  return NextResponse.json(spec);
}
