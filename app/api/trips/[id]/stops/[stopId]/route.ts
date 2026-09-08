import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tripStopSchema } from '@/lib/validations';

// PATCH: Update stop notes, dates, etc.
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, stopId } = params;
    const userId = session.user.id;
    const body = await req.json();

    // Verify user is a member of the trip
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Validate update fields (subset of tripStopSchema)
    const updatedStop = await prisma.tripStop.update({
      where: { id: stopId, tripId },
      data: {
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    return NextResponse.json(updatedStop);
  } catch (error: any) {
    console.error('Update stop error:', error);
    return NextResponse.json(
      { message: 'Failed to update stop details' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a stop
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; stopId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, stopId } = params;
    const userId = session.user.id;

    // Verify user is a member of the trip
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete stop in a transaction and shift subsequent stops' orders
    await prisma.$transaction(async (tx) => {
      const stopToDelete = await tx.tripStop.findUnique({
        where: { id: stopId, tripId },
      });

      if (!stopToDelete) {
        throw new Error('Stop not found');
      }

      // Delete the stop (Prisma schema will cascade-delete itineraryItems)
      await tx.tripStop.delete({
        where: { id: stopId },
      });

      // Shift other stops down
      const subsequentStops = await tx.tripStop.findMany({
        where: {
          tripId,
          stopOrder: {
            gt: stopToDelete.stopOrder,
          },
        },
        orderBy: {
          stopOrder: 'asc',
        },
      });

      for (const stop of subsequentStops) {
        await tx.tripStop.update({
          where: { id: stop.id },
          data: {
            stopOrder: stop.stopOrder - 1,
          },
        });
      }
    });

    return NextResponse.json({ message: 'Stop deleted and orders updated' });
  } catch (error: any) {
    console.error('Delete stop error:', error);
    return NextResponse.json(
      { message: 'Failed to delete stop' },
      { status: 500 }
    );
  }
}
