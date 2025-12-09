import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/tickets/[id] - Get a single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check permissions - users can only view their own tickets unless they're agents
    if (
      session.user.role !== 'AGENT' &&
      ticket.createdById !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filter internal comments for non-agents
    if (session.user.role !== 'AGENT') {
      ticket.comments = ticket.comments.filter((comment: any) => !comment.isInternal);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Update a ticket
export async function PATCH(
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
    const { title, description, status, priority, category, assignedToId } = body;

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

    const updateData: any = {};

    // Only agents can update these fields
    if (isAgent) {
      if (status !== undefined) {
        updateData.status = status;
        
        // Track status changes
        if (status === 'in_progress' && !ticket.firstResponseAt) {
          updateData.firstResponseAt = new Date();
        }
        if (status === 'resolved' && !ticket.resolvedAt) {
          updateData.resolvedAt = new Date();
        }
        if (status === 'closed' && !ticket.closedAt) {
          updateData.closedAt = new Date();
        }
      }
      if (priority !== undefined) updateData.priority = priority;
      if (category !== undefined) updateData.category = category;
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    }

    // Owners can update title and description only if ticket is not closed
    if (isOwner && ticket.status !== 'closed') {
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Delete a ticket (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'AGENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
