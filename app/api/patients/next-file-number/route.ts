import { NextResponse } from 'next/server';
import { getNextFileNumber, ensureMigrations } from '@/lib/db/index';

export async function GET() {
  ensureMigrations();
  return NextResponse.json({ fileNumber: getNextFileNumber() });
}
