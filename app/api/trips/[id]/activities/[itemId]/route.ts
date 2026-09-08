import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Edit custom cost, notes, or scheduled time of an activity
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, itemId } = params;
    const userId = session.user.id;
    const body = await req.json();

    // Verify trip access
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedItem = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        startTime: body.startTime !== undefined ? body.startTime : undefined,
        endTime: body.endTime !== undefined ? body.endTime : undefined,
        customCost: body.customCost !== undefined ? parseFloat(body.customCost) : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Update itinerary item error:', error);
    return NextResponse.json(
      { message: 'Failed to update activity schedule' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an activity from a day
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId, itemId } = params;
    const userId = session.user.id;

    // Verify trip access
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Delete item and shift orders inside transaction
    await prisma.$transaction(async (tx) => {
      const itemToDelete = await tx.itineraryItem.findUnique({
        where: { id: itemId },
      });

      if (!itemToDelete) {
        throw new Error('Itinerary item not found');
      }

      await tx.itineraryItem.delete({
        where: { id: itemId },
      });

      // Shift subsequent items on the same day/stop
      const subsequentItems = await tx.itineraryItem.findMany({
        where: {
          tripStopId: itemToDelete.tripStopId,
          date: itemToDelete.date,
          itemOrder: {
            gt: itemToDelete.itemOrder,
          },
        },
        orderBy: {
          itemOrder: 'asc',
        },
      });

      for (const item of subsequentItems) {
        await tx.itineraryItem.update({
          where: { id: item.id },
          data: {
            itemOrder: item.itemOrder - 1,
          },
        });
      }
    });

    return NextResponse.json({ message: 'Activity removed and orders shifted successfully' });
  } catch (error: any) {
    console.error('Delete itinerary item error:', error);
    return NextResponse.json(
      { message: 'Failed to remove activity' },
      { status: 500 }
    );
  }
}
