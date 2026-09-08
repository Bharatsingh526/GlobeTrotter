import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tripSchema } from '@/lib/validations';

// GET: Fetch all trips for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const trips = await prisma.trip.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        stops: {
          include: {
            city: true,
          },
        },
        expenses: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(trips);
  } catch (error: any) {
    console.error('Fetch trips error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST: Create a new trip
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate body using Zod
    const validationResult = tripSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid trip data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, coverImage, startDate, endDate } = validationResult.data;

    // Create the trip and assign membership (OWNER) in a transaction
    const newTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId,
          title,
          description: description || '',
          coverImage: coverImage || '',
          startDate,
          endDate,
        },
      });

      await tx.tripMember.create({
        data: {
          tripId: trip.id,
          userId,
          role: 'OWNER',
        },
      });

      return trip;
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error: any) {
    console.error('Create trip error:', error);
    return NextResponse.json(
      { message: 'Failed to create trip. Please try again.' },
      { status: 500 }
    );
  }
}
