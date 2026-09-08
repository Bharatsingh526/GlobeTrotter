import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const cityId = params.id; // cityId passed as url parameter

    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Destination was not saved' }, { status: 404 });
    }

    await prisma.savedDestination.delete({
      where: {
        userId_cityId: { userId, cityId },
      },
    });

    return NextResponse.json({ message: 'Destination unsaved successfully' });
  } catch (error: any) {
    console.error('Delete saved destination error:', error);
    return NextResponse.json(
      { message: 'Failed to unsave destination' },
      { status: 500 }
    );
  }
}
