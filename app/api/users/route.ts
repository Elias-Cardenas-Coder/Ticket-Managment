import prisma from '@/lib/prisma';
import { ApiResponse, UserWithoutPassword, PaginatedResponse } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'AGENT') {
      return NextResponse.json({ success: false, error: 'Only agents can access this' } as ApiResponse<null>, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({ success: true, data: { data: users as UserWithoutPassword[], total, page, limit, pages } as PaginatedResponse<UserWithoutPassword> }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse<null>, { status: 500 });
  }
}
