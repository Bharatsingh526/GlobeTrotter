import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validations';
import * as bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate input data using Zod
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid signup data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User and Profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: 'USER',
        },
      });

      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          name,
          language: 'English',
        },
      });

      return { user: newUser, profile: newProfile };
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: result.user.id,
        email: result.user.email,
        name: result.profile.name,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
