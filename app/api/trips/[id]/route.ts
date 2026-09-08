import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tripSchema } from '@/lib/validations';

// Utility to verify membership
async function checkTripAccess(tripId: string, userId: string) {
  const member = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId, userId },
    },
  });
  return member;
}

// GET: Retrieve a single trip's details
export async function GET(
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

    const access = await checkTripAccess(tripId, userId);
    if (!access) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            city: true,
            itineraryItems: {
              include: {
                activity: true,
              },
              orderBy: {
                itemOrder: 'asc',
              },
            },
          },
          orderBy: {
            stopOrder: 'asc',
          },
        },
        expenses: true,
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error: any) {
    console.error('Fetch trip error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch trip details' },
      { status: 500 }
    );
  }
}

// PATCH: Update trip properties
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
    const body = await req.json();

    const access = await checkTripAccess(tripId, userId);
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const validationResult = tripSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, coverImage, startDate, endDate } = validationResult.data;

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        title,
        description,
        coverImage,
        startDate,
        endDate,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error: any) {
    console.error('Update trip error:', error);
    return NextResponse.json(
      { message: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a trip
export async function DELETE(
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

    const access = await checkTripAccess(tripId, userId);
    if (!access || access.role !== 'OWNER') {
      return NextResponse.json({ message: 'Forbidden: Only the owner can delete this trip' }, { status: 403 });
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    console.error('Delete trip error:', error);
    return NextResponse.json(
      { message: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
