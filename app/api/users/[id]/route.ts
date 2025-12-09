import prisma from '@/lib/prisma';
import { ApiResponse, UserWithoutPassword } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'AGENT') return NextResponse.json({ success: false, error: 'Only agents can access this' } as ApiResponse<null>, { status: 403 });

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' } as ApiResponse<null>, { status: 404 });

    return NextResponse.json({ success: true, data: user as UserWithoutPassword } as ApiResponse<UserWithoutPassword>, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse<null>, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'AGENT') return NextResponse.json({ success: false, error: 'Only agents can access this' } as ApiResponse<null>, { status: 403 });

    const body = await request.json();
    const { name, role: newRole } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' } as ApiResponse<null>, { status: 404 });

    const updatedUser = await prisma.user.update({ where: { id }, data: { ...(name && { name }), ...(newRole && { role: newRole }) }, select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } });

    return NextResponse.json({ success: true, data: updatedUser as UserWithoutPassword, message: 'User updated successfully' } as ApiResponse<UserWithoutPassword>, { status: 200 });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse<null>, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'AGENT') return NextResponse.json({ success: false, error: 'Only agents can access this' } as ApiResponse<null>, { status: 403 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' } as ApiResponse<null>, { status: 404 });

    // Prevent deleting agent accounts from other agents or self-deleting
    if (user.role === 'AGENT') {
      return NextResponse.json({ success: false, error: 'Cannot delete agent users' } as ApiResponse<null>, { status: 403 });
    }

    // Also protect against deleting yourself (extra safety)
    if (session.user && session.user.id === id) {
      return NextResponse.json({ success: false, error: 'Cannot delete yourself' } as ApiResponse<null>, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted successfully' } as ApiResponse<null>, { status: 200 });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ApiResponse<null>, { status: 500 });
  }
}
