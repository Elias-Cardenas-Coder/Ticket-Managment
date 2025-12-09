'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Navigation } from '@/app/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';


interface Comment {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  comments: Comment[];
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const { data: session, status } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchTicket();
      fetchAgents();
    }
  }, [status, params.id]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      } else if (response.status === 404) {
        router.push('/dashboard/tickets');
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/users?role=AGENT');
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats
        const agentsList = data.success ? (data.data?.data || []) : (Array.isArray(data) ? data : []);
        setAgents(agentsList);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: comment, isInternal }),
      });

      if (response.ok) {
        setComment('');
        setIsInternal(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (response.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: agentId || null }),
      });

      if (response.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error assigning agent:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/tickets');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleEditTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchTicket();
      }
    } catch (error) {
      console.error('Error editing ticket:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const response = await fetch(`/api/tickets/${params.id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        fetchTicket();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
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

  if (!ticket) {
    return null;
  }

  const user = session?.user as any;
  const isAgent = user?.role === 'AGENT';
  const isOwner = ticket.createdBy.id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/dashboard/tickets" className="text-green-600 dark:text-green-400 hover:underline">
            ← {'Back to Tickets'}
          </Link>
          {isAgent && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditTitle(ticket.title);
                  setEditDescription(ticket.description);
                  setIsEditing(true);
                }}
                className="btn btn-secondary"
              >
                ✏️ {'Edit'}
              </button>
              <button
                onClick={handleDeleteTicket}
                className="btn btn-danger"
              >
                🗑️ {'Delete'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="card-glass p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {'Subject'}
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {'Description'}
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleEditTicket} className="btn btn-primary">
                      {'Save'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                      {'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800`}>
                          {getPriorityIcon(ticket.priority)} {getPriorityLabel(ticket.priority)}
                        </span>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {ticket.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>👤 {'Created By'}: {ticket.createdBy.name}</span>
                        <span>🕒 {new Date(ticket.createdAt).toLocaleString()}</span>
                        {ticket.category && <span>📁 {ticket.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{'Description'}</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Comments Section */}
            <div className="card-glass p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {'Comments'} ({ticket.comments.length})
              </h2>
              <div className="space-y-4 mb-6">
                {ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.isInternal
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.user.name}
                        </span>
                        {comment.user.role === 'AGENT' ? (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded">
                            {'Agent'}
                          </span>
                        ) : null}
                        {comment.isInternal && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded">
                            {'Internal'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex-1">
                        {comment.message}
                      </p>
                      {isAgent && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              {ticket.status !== 'CLOSED' && (
                <form onSubmit={handleAddComment} className="space-y-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder={'Write your comment...'}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex items-center justify-between">
                    {isAgent && (
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded"
                        />
                        {'Internal Note'}
                      </label>
                    )}
                    <button
                      type="submit"
                      disabled={submitting || !comment.trim()}
                      className="btn btn-primary ml-auto"
                    >
                      {submitting ? 'Loading...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            {isAgent && (
              <div className="card-glass p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{'Status'}</h3>
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="open">{'Open'}</option>
                  <option value="in_progress">{'In Progress'}</option>
                  <option value="resolved">{'Resolved'}</option>
                  <option value="closed">{'Closed'}</option>
                </select>
              </div>
            )}

            {/* Priority Management */}
            {isAgent && (
              <div className="card-glass p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{'Priority'}</h3>
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdatePriority(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="low">🟢 {'Low'}</option>
                  <option value="medium">🟡 {'Medium'}</option>
                  <option value="high">🟠 {'High'}</option>
                </select>
              </div>
            )}

            {/* Assignment */}
            {isAgent && (
              <div className="card-glass p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{'Assigned To'}</h3>
                <select
                  value={ticket.assignedTo?.id || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{'Unassigned'}</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ticket Info */}
            <div className="card-glass p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{'Ticket Details'}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{'Created At'}:</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{'Updated At'}:</span>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </div>
                </div>
                {ticket.firstResponseAt && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{'First Response'}:</span>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(ticket.firstResponseAt).toLocaleString()}
                    </div>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{'Resolved At'}:</span>
                    <div className="text-gray-900 dark:text-white">
                      {new Date(ticket.resolvedAt).toLocaleString()}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{'Source'}:</span>
                  <div className="text-gray-900 dark:text-white">{ticket.source}</div>
                </div>
                {ticket.assignedTo && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{'Assigned To'}:</span>
                    <div className="text-gray-900 dark:text-white">
                      {ticket.assignedTo.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
