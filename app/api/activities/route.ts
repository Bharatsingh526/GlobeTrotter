import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActivityCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (cityId) {
      where.cityId = cityId;
    }

    if (category) {
      where.category = category as ActivityCategory;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('Fetch activities error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
