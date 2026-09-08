import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const originalTripId = params.id;
    const userId = session.user.id;

    // Fetch the original trip with stops and activities
    const originalTrip = await prisma.trip.findUnique({
      where: { id: originalTripId },
      include: {
        stops: {
          include: {
            itineraryItems: true,
          },
        },
      },
    });

    if (!originalTrip) {
      return NextResponse.json({ message: 'Original trip not found' }, { status: 404 });
    }

    // Clone the trip in a single transaction
    const clonedTrip = await prisma.$transaction(async (tx) => {
      // 1. Create cloned trip record
      const newTrip = await tx.trip.create({
        data: {
          userId,
          title: `Copy of ${originalTrip.title}`,
          description: originalTrip.description,
          coverImage: originalTrip.coverImage,
          startDate: originalTrip.startDate,
          endDate: originalTrip.endDate,
          isPublic: false,
          shareSlug: null,
        },
      });

      // 2. Assign ownership
      await tx.tripMember.create({
        data: {
          tripId: newTrip.id,
          userId,
          role: 'OWNER',
        },
      });

      // 3. Clone stops and itinerary items
      for (const stop of originalTrip.stops) {
        const newStop = await tx.tripStop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            startDate: stop.startDate,
            endDate: stop.endDate,
            stopOrder: stop.stopOrder,
            notes: stop.notes,
          },
        });

        // Clone itinerary items for this stop
        for (const item of stop.itineraryItems) {
          await tx.itineraryItem.create({
            data: {
              tripStopId: newStop.id,
              activityId: item.activityId,
              date: item.date,
              startTime: item.startTime,
              endTime: item.endTime,
              customCost: item.customCost,
              notes: item.notes,
              itemOrder: item.itemOrder,
            },
          });
        }
      }

      return newTrip;
    });

    return NextResponse.json({ id: clonedTrip.id });
  } catch (error: any) {
    console.error('Clone trip error:', error);
    return NextResponse.json(
      { message: 'Failed to clone trip' },
      { status: 500 }
    );
  }
}
