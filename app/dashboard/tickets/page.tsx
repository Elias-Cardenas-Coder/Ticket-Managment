'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Navigation } from '@/app/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';


interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  commentCount: number;
}

export default function TicketsPage() {
  const router = useRouter();
  
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status, filterStatus, filterPriority, searchQuery]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return priority;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-green-600 dark:border-t-green-400 rounded-full"
        />
      </div>
    );
  }

  const user = session?.user as any;
  const isAgent = user?.role === 'AGENT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isAgent ? 'View and create support tickets' : 'View your support tickets'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              +
            </button>
          </div>

          {/* Filters */}
          <div className="card-glass p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {'Filter by status'.replace('status', 'tickets')}
                </label>
                <input
                  type="text"
                  placeholder={'Search tickets...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {'Status'}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{'All Statuses'}</option>
                  <option value="open">{'Open'}</option>
                  <option value="in_progress">{'In Progress'}</option>
                  <option value="resolved">{'Resolved'}</option>
                  <option value="closed">{'Closed'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {'Priority'}
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{'All Priorities'}</option>
                  <option value="high">{'High'}</option>
                  <option value="medium">{'Medium'}</option>
                  <option value="low">{'Low'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="card-glass p-12 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {'No tickets found'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filterStatus || filterPriority
                    ? 'Filter by status'
                    : 'Create your first ticket'}
                </p>
              </div>
            ) : (
              tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="card-glass p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                            {ticket.ticketNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                            {getStatusLabel(ticket.status)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityIcon(ticket.priority)} {getPriorityLabel(ticket.priority)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {ticket.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>👤 {ticket.createdBy.name}</span>
                            {ticket.assignedTo && (
                              <span>🎯 {'Assigned To'}: {ticket.assignedTo.name}</span>
                            )}
                            <span>💬 {ticket.commentCount} {'comments'}</span>
                            <span>🕒 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                          <Link href={`/dashboard/tickets/${ticket.id}`}>
                            <button className="btn btn-primary text-sm">
                              See Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}

function CreateTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          category: category || null,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass max-w-2xl w-full p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Brief description of the issue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Detailed description of the issue..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🟠 High</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select category</option>
                <option value="TECHNICAL">Technical</option>
                <option value="BILLING">Billing</option>
                <option value="GENERAL">General</option>
                <option value="ACCOUNT">Account</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
