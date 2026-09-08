import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tripStopSchema } from '@/lib/validations';

// POST: Add a new stop (city) to a trip
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const userId = session.user.id;
    const body = await req.json();

    // Verify user is a member of the trip
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Validate request body
    const validationResult = tripStopSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid stop data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { cityId, startDate, endDate, notes } = validationResult.data;

    // Get current stops count to calculate next stopOrder
    const currentStopsCount = await prisma.tripStop.count({
      where: { tripId },
    });

    const newStop = await prisma.tripStop.create({
      data: {
        tripId,
        cityId,
        startDate,
        endDate,
        stopOrder: currentStopsCount + 1,
        notes: notes || '',
      },
      include: {
        city: true,
      },
    });

    return NextResponse.json(newStop, { status: 201 });
  } catch (error: any) {
    console.error('Create stop error:', error);
    return NextResponse.json(
      { message: 'Failed to add stop' },
      { status: 500 }
    );
  }
}

// PATCH: Reorder stops order
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const userId = session.user.id;
    const { stopIds } = await req.json(); // Array of stop IDs in their new order

    if (!Array.isArray(stopIds)) {
      return NextResponse.json({ message: 'Invalid payload, expected array of stopIds' }, { status: 400 });
    }

    // Verify user is a member of the trip
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Perform updates in a transaction
    await prisma.$transaction(
      stopIds.map((id, index) =>
        prisma.tripStop.update({
          where: { id, tripId },
          data: { stopOrder: index + 1 },
        })
      )
    );

    return NextResponse.json({ message: 'Stops reordered successfully' });
  } catch (error: any) {
    console.error('Reorder stops error:', error);
    return NextResponse.json(
      { message: 'Failed to reorder stops' },
      { status: 500 }
    );
  }
}
