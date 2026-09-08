import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch saved destinations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const saved = await prisma.savedDestination.findMany({
      where: { userId },
      include: {
        city: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('Fetch saved destinations error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch saved destinations' },
      { status: 500 }
    );
  }
}

// POST: Save a city
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { cityId } = await req.json();

    if (!cityId) {
      return NextResponse.json({ message: 'City ID is required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Destination already saved' }, { status: 200 });
    }

    const saved = await prisma.savedDestination.create({
      data: {
        userId,
        cityId,
      },
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Save destination error:', error);
    return NextResponse.json(
      { message: 'Failed to save destination' },
      { status: 500 }
    );
  }
}
