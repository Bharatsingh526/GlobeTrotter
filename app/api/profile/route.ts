import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations';

// PATCH: Update user profile settings
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate using Zod
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid profile data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, avatarUrl, language } = validationResult.data;

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        name,
        avatarUrl: avatarUrl || null,
        language,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile settings' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user from MySQL (cascades automatically based on relations)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
