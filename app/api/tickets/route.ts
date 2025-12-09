import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/tickets - List tickets with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const createdById = searchParams.get('createdById');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by assigned agent
    if (assignedToId) {
      where.assignedToId = assignedToId === 'unassigned' ? null : assignedToId;
    }

    // Filter by creator
    if (createdById) {
      where.createdById = createdById;
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { ticketNumber: { contains: search } }
      ];
    }

    // If user is not AGENT, only show their tickets
    if (session.user.role !== 'AGENT') {
      where.createdById = session.user.id;
    }

    const tickets = await prisma.ticket.findMany({
      where,
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
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Add comment count to each ticket
    const ticketsWithCount = tickets.map((ticket: any) => ({
      ...ticket,
      commentCount: ticket.comments.length,
      comments: undefined,
    }));

    return NextResponse.json(ticketsWithCount);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, category, source } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate ticket number
    const ticketCount = await prisma.ticket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        priority: priority || 'medium',
        category: category || null,
        source: source || 'WEB',
        createdById: session.user.id,
        status: 'open',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
