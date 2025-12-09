import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';

// GET /api/tickets/stats - Get ticket statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAgent = session.user.role === 'AGENT';

    // Base where clause
    const baseWhere = isAgent ? {} : { createdById: session.user.id };

    // Get counts by status
    const [open, inProgress, resolved, closed] = await Promise.all([
      prisma.ticket.count({ where: { ...baseWhere, status: 'open' } }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'in_progress' } }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'resolved' } }),
      prisma.ticket.count({ where: { ...baseWhere, status: 'closed' } }),
    ]);

    // Get counts by priority
    const [high, medium, low] = await Promise.all([
      prisma.ticket.count({ where: { ...baseWhere, priority: 'high' } }),
      prisma.ticket.count({ where: { ...baseWhere, priority: 'medium' } }),
      prisma.ticket.count({ where: { ...baseWhere, priority: 'low' } }),
    ]);

    // Get unassigned tickets count (agents only)
    const unassigned = isAgent
      ? await prisma.ticket.count({ where: { assignedToId: null, status: { not: 'closed' } } })
      : 0;

    // Get tickets without response (agents only)
    const noResponse = isAgent
      ? await prisma.ticket.count({
          where: {
            firstResponseAt: null,
            status: { not: 'CLOSED' },
          },
        })
      : 0;

    // Calculate average response time (agents only)
    let avgResponseTime = null;
    if (isAgent) {
      const ticketsWithResponse = await prisma.ticket.findMany({
        where: {
          firstResponseAt: { not: null },
        },
        select: {
          createdAt: true,
          firstResponseAt: true,
        },
      });

      if (ticketsWithResponse.length > 0) {
        const totalResponseTime = ticketsWithResponse.reduce((sum: number, ticket: any) => {
          const responseTime =
            ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime();
          return sum + responseTime;
        }, 0);
        avgResponseTime = Math.round(totalResponseTime / ticketsWithResponse.length / 1000 / 60); // in minutes
      }
    }

    // Calculate average resolution time (agents only)
    let avgResolutionTime = null;
    if (isAgent) {
      const resolvedTickets = await prisma.ticket.findMany({
        where: {
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      });

      if (resolvedTickets.length > 0) {
        const totalResolutionTime = resolvedTickets.reduce((sum: number, ticket: any) => {
          const resolutionTime =
            ticket.resolvedAt!.getTime() - ticket.createdAt.getTime();
          return sum + resolutionTime;
        }, 0);
        avgResolutionTime = Math.round(totalResolutionTime / resolvedTickets.length / 1000 / 60 / 60); // in hours
      }
    }

    return NextResponse.json({
      byStatus: {
        open,
        inProgress,
        resolved,
        closed,
        total: open + inProgress + resolved + closed,
      },
      byPriority: {
        high,
        medium,
        low,
      },
      metrics: {
        unassigned,
        noResponse,
        avgResponseTime, // in minutes
        avgResolutionTime, // in hours
      },
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket statistics' },
      { status: 500 }
    );
  }
}
