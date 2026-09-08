import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tripId, isPublic } = await req.json();
    const userId = session.user.id;

    // Verify ownership
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role !== 'OWNER') {
      return NextResponse.json({ message: 'Forbidden: Only owners can share trips' }, { status: 403 });
    }

    if (isPublic) {
      // Generate a unique slug
      const randomString = Math.random().toString(36).substring(2, 7) + Date.now().toString(36).substring(5);
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      const slugTitle = trip?.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'trip';
      
      const slug = `${slugTitle}-${randomString}`;

      // Update trip and shared_trips tables in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedTrip = await tx.trip.update({
          where: { id: tripId },
          data: {
            isPublic: true,
            shareSlug: slug,
          },
        });

        // Delete existing shared records if any
        await tx.sharedTrip.deleteMany({ where: { tripId } });

        const shared = await tx.sharedTrip.create({
          data: {
            tripId,
            slug,
          },
        });

        return { trip: updatedTrip, shared };
      });

      return NextResponse.json({
        isPublic: true,
        slug: result.shared.slug,
      });
    } else {
      // Make private
      await prisma.$transaction(async (tx) => {
        await tx.trip.update({
          where: { id: tripId },
          data: {
            isPublic: false,
            shareSlug: null,
          },
        });

        await tx.sharedTrip.deleteMany({ where: { tripId } });
      });

      return NextResponse.json({
        isPublic: false,
        slug: null,
      });
    }
  } catch (error: any) {
    console.error('Share trip error:', error);
    return NextResponse.json(
      { message: 'Failed to update trip sharing settings' },
      { status: 500 }
    );
  }
}
