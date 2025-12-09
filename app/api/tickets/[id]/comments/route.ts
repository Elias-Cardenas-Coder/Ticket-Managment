import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// POST /api/tickets/[id]/comments - Add a comment to a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, isInternal } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Comment message is required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions
    const isAgent = session.user.role === 'AGENT';
    const isOwner = ticket.createdById === session.user.id;

    if (!isAgent && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only agents can create internal comments
    const commentIsInternal = isAgent && isInternal === true;

    const comment = await prisma.comment.create({
      data: {
        message,
        ticketId: id,
        userId: session.user.id,
        isInternal: commentIsInternal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Update ticket's firstResponseAt if this is the first agent response
    if (isAgent && !ticket.firstResponseAt) {
      await prisma.ticket.update({
        where: { id },
        data: { firstResponseAt: new Date() },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id]/comments - Delete a comment (agents only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only agents can delete comments
    if (session.user.role !== 'AGENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Verify the comment belongs to this ticket
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.ticketId !== id) {
      return NextResponse.json({ error: 'Comment does not belong to this ticket' }, { status: 400 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
