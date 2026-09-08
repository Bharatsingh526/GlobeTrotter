import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { expenseSchema } from '@/lib/validations';

// GET: Fetch all expenses for a trip
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

    // Verify membership
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST: Add a new expense
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

    // Verify membership
    const member = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
    if (!member || member.role === 'VIEWER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Validate using Zod
    const validationResult = expenseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid expense data', errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, amount, currency, description, expenseDate } = validationResult.data;

    const newExpense = await prisma.expense.create({
      data: {
        tripId,
        category,
        amount,
        currency,
        description,
        expenseDate,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { message: 'Failed to log expense' },
      { status: 500 }
    );
  }
}
