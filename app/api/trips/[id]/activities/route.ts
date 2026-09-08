import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { itineraryItemSchema } from '@/lib/validations';

// POST: Add an activity to a stop itinerary day
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
    const { tripStopId, activityId, date, startTime, endTime, customCost, notes } = await req.json();

    // Verify trip access
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Verify stop belongs to trip
    const stop = await prisma.tripStop.findUnique({
      where: { id: tripStopId, tripId },
    });
    if (!stop) {
      return NextResponse.json({ message: 'Trip stop not found' }, { status: 404 });
    }

    // Get current activity count for this day/stop to compute next itemOrder
    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const currentItemsCount = await prisma.itineraryItem.count({
      where: {
        tripStopId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const newItem = await prisma.itineraryItem.create({
      data: {
        tripStopId,
        activityId,
        date: new Date(date),
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        customCost: customCost !== undefined ? parseFloat(customCost) : null,
        notes: notes || '',
        itemOrder: currentItemsCount + 1,
      },
      include: {
        activity: true,
      },
    });

    // Proactively register an expense if cost is positive
    const activityInfo = await prisma.activity.findUnique({ where: { id: activityId } });
    const amount = customCost !== undefined ? parseFloat(customCost) : (activityInfo?.estimatedCost || 0);

    if (amount > 0) {
      await prisma.expense.create({
        data: {
          tripId,
          category: 'ACTIVITY',
          amount,
          description: `Activity: ${activityInfo?.name || 'Planned activity'}`,
          expenseDate: new Date(date),
        },
      });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error('Create itinerary item error:', error);
    return NextResponse.json(
      { message: 'Failed to add activity to itinerary' },
      { status: 500 }
    );
  }
}

// PATCH: Reorder activity items on a day
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
    const { itemIds, date, tripStopId } = await req.json(); // Array of item IDs, and context details

    if (!Array.isArray(itemIds)) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    // Verify trip access
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Update in a transaction
    await prisma.$transaction(
      itemIds.map((id, index) =>
        prisma.itineraryItem.update({
          where: { id, tripStopId },
          data: {
            itemOrder: index + 1,
            date: date ? new Date(date) : undefined, // Support moving between days!
          },
        })
      )
    );

    return NextResponse.json({ message: 'Itinerary items reordered successfully' });
  } catch (error: any) {
    console.error('Reorder itinerary items error:', error);
    return NextResponse.json(
      { message: 'Failed to reorder activities' },
      { status: 500 }
    );
  }
}
