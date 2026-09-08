import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const region = searchParams.get('region') || '';
    const maxCost = searchParams.get('cost') ? parseInt(searchParams.get('cost')!) : undefined;
    const minPopularity = searchParams.get('popularity') ? parseInt(searchParams.get('popularity')!) : undefined;

    // Build Prisma query clauses
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { country: { contains: search } },
        { region: { contains: search } }
      ];
    }

    if (country) {
      where.country = country;
    }

    if (region) {
      where.region = region;
    }

    if (maxCost !== undefined) {
      where.costIndex = { lte: maxCost };
    }

    if (minPopularity !== undefined) {
      where.popularity = { gte: minPopularity };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: [
        { popularity: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(cities);
  } catch (error: any) {
    console.error('Fetch cities error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}
