'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/app/components/Navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FadeInUp, HoverScale } from '@/app/components/Animations';
import Link from 'next/link';

interface TicketStats {
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  metrics: {
    unassigned: number;
    noResponse: number;
    avgResponseTime: number | null;
    avgResolutionTime: number | null;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  commentCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  const user = session?.user as any | undefined;
  const isAgent = user?.role === 'AGENT';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && !isAgent) {
      router.push('/dashboard/tickets');
    }
  }, [status, router, isAgent]);

  useEffect(() => {
    if (status === 'authenticated' && isAgent) {
      fetchStats();
      fetchRecentTickets();
    }
  }, [status, isAgent]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tickets/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTickets = async () => {
    try {
      const response = await fetch('/api/tickets?limit=5&sort=createdAt&order=desc');
      if (response.ok) {
        const data = await response.json();
        setRecentTickets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recent tickets:', error);
    }
  };

  const handleAddComment = async (ticketId: string) => {
    const comment = commentText[ticketId];
    if (!comment?.trim()) return;

    setSubmittingComment(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: comment, isInternal: false }),
      });

      if (response.ok) {
        setCommentText({ ...commentText, [ticketId]: '' });
        fetchRecentTickets(); // Refresh to update comment count
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(null);
    }
  };

  // Helper functions for labels
  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
    };
    return statusMap[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
    };
    return priorityMap[priority] || priority;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-green-600 dark:border-t-green-400 rounded-full"
        />
      </div>
    );
  }

  const dashboardCards = [
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
      title: 'Tickets',
      desc: isAgent ? 'Manage support tickets' : 'View your tickets',
      href: '/dashboard/tickets',
      color: 'orange'
    },
    ...(isAgent
      ? [
          {
            icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            title: 'Users',
            desc: 'Manage clients and agents',
            href: '/dashboard/users',
            color: 'amber'
          }
        ]
      : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <FadeInUp>
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, {isAgent ? 'Agent' : user?.name || 'User'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manage your support tickets efficiently
            </p>
          </motion.div>

          {/* Statistics Tables */}
          {stats && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Ticket Overview
              </h2>
              
              {/* Status Table */}
              <motion.div 
                className="card-glass mb-6 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Status</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className="hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Open</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">
                          {stats.byStatus.open}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byStatus.open / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">In Progress</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {stats.byStatus.inProgress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byStatus.inProgress / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Resolved</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          {stats.byStatus.resolved}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byStatus.resolved / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-gray-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Closed</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {stats.byStatus.closed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byStatus.closed / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          {stats.byStatus.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          100%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Priority Table */}
              <motion.div 
                className="card-glass mb-6 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets by Priority</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">High</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600 dark:text-red-400">
                          {stats.byPriority.high}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byPriority.high / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Medium</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          {stats.byPriority.medium}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byPriority.medium / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Low</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">
                          {stats.byPriority.low}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {stats.byStatus.total > 0 ? Math.round((stats.byPriority.low / stats.byStatus.total) * 100) : 0}%
                        </td>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          {stats.byPriority.high + stats.byPriority.medium + stats.byPriority.low}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                          100%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Agent Metrics Table */}
              {isAgent && (
                <motion.div 
                  className="card-glass mb-8 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metric</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Unassigned Tickets
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600 dark:text-red-400">
                            {stats.metrics.unassigned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              stats.metrics.unassigned === 0 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {stats.metrics.unassigned === 0 ? 'All Assigned' : 'Needs Attention'}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Awaiting First Response
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600 dark:text-red-400">
                            {stats.metrics.noResponse}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              stats.metrics.noResponse === 0 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {stats.metrics.noResponse === 0 ? 'All Responded' : 'Action Required'}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Avg Response Time
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {stats.metrics.avgResponseTime ? `${stats.metrics.avgResponseTime}m` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {stats.metrics.avgResponseTime && stats.metrics.avgResponseTime < 60 ? 'Excellent' : 'Good'}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Avg Resolution Time
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {stats.metrics.avgResolutionTime ? `${stats.metrics.avgResolutionTime}h` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              {stats.metrics.avgResolutionTime && stats.metrics.avgResolutionTime < 24 ? 'Excellent' : 'Good'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Recent Tickets Section - Only for Agents */}
          {isAgent && recentTickets.length > 0 && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Recent Tickets
                </h2>
              </div>
              <div className="space-y-4">
                {recentTickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    className="card-glass p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                            {ticket.ticketNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            ticket.status === 'resolved' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {getStatusLabel(ticket.status)}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {ticket.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {ticket.createdBy.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {ticket.commentCount} comments
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link href={`/dashboard/tickets/${ticket.id}`}>
                        <button className="btn btn-secondary text-sm ml-4">
                          {'View Details'}
                        </button>
                      </Link>
                    </div>

                    {/* Quick Comment Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Quick reply..."
                          value={commentText[ticket.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [ticket.id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(ticket.id);
                            }
                          }}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => handleAddComment(ticket.id)}
                          disabled={submittingComment === ticket.id || !commentText[ticket.id]?.trim()}
                          className="btn btn-primary text-sm"
                        >
                          {submittingComment === ticket.id ? (
                            <span>Sending...</span>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              Reply
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </FadeInUp>
      </div>
    </div>
  );
}
