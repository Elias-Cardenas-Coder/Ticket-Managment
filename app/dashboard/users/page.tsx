'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/app/components/Navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FadeInUp, HoverScale } from '@/app/components/Animations';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

type UserTicket = {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [userTicketsOpen, setUserTicketsOpen] = useState(false);
  const [selectedUserForTickets, setSelectedUserForTickets] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CLIENT', clientType: 'EXTERNAL' });
  const [creating, setCreating] = useState(false);

  const user = (session?.user ?? null) as any | null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (user && user.role !== 'AGENT') {
      router.push('/dashboard');
    }
  }, [status, router, user]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/users', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.success) setUsers(data.data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'AGENT') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user]);

  

  async function fetchUserTickets(userId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets?createdById=${encodeURIComponent(userId)}`, { credentials: 'same-origin' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUserTickets(data || []);
        const target = users.find((u) => u.id === userId) || null;
        setSelectedUserForTickets(target);
        setUserTicketsOpen(true);
      } else {
        alert('Error loading tickets');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading tickets');
    }
    setLoading(false);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all fields');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('User created successfully');
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'CLIENT', clientType: 'EXTERNAL' });
        load();
      } else {
        alert(data.error || 'Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('User deleted successfully');
        load();
      } else {
        alert(data.error || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setLoading(false);
    }
  }


  if (status === 'loading') {
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

  if (!user || user.role !== 'AGENT') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:bg-gradient-to-br dark:from-black dark:via-slate-950 dark:to-black">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <FadeInUp>
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  👥 {'Clients'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Manage clients and view their tickets
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="card-glass p-8 backdrop-blur-xl overflow-x-auto"
          >
            {loading && (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-4 border-purple-300 dark:border-purple-600 border-t-purple-600 dark:border-t-purple-300 rounded-full"
                />
              </div>
            )}

            {!loading && users.filter(u => u.role !== 'AGENT').length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {'No users found'}
                </p>
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">👤 {'Name'}</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">✉️ {'Email'}</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">🏷️ {'Role'}</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">🏢 {'Client Type'}</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">⚙️ {'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== 'AGENT').map((u, idx) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                        className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-xl">👤</div>
                            <span className="font-semibold text-gray-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200">{'Client'}</span>
                        </td>
                        <td className="px-6 py-4">
                          {(u as any).clientType ? (
                            <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                              (u as any).clientType === 'INTERNAL' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              {(u as any).clientType === 'INTERNAL' ? `🏢 ${'Internal'}` : `🌍 ${'External'}`}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <HoverScale scale={1.03}>
                              <motion.button
                                className="btn-secondary text-sm"
                                onClick={() => fetchUserTickets(u.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                                View Tickets
                              </motion.button>
                            </HoverScale>
                            <HoverScale scale={1.03}>
                              <motion.button
                                className="btn btn-danger text-sm"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </motion.button>
                            </HoverScale>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </FadeInUp>
        {/* User Tickets modal */}
        {userTicketsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setUserTicketsOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{'Title'} - {selectedUserForTickets?.name}</h3>
                  <p className="text-sm text-gray-500">Client's support tickets</p>
                </div>
                <button onClick={() => setUserTicketsOpen(false)} className="text-gray-500 hover:text-gray-700">✖</button>
              </div>

              <div className="space-y-3 max-h-96 overflow-auto">
                {userTickets.length === 0 ? (
                  <p className="text-center text-gray-500">{'No tickets found'}</p>
                ) : (
                  userTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              ticket.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              ticket.status === 'in_progress' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                              ticket.status === 'resolved' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {ticket.status}
                            </span>
                            <span className="text-xs">
                              {ticket.priority === 'high' ? '🟠' : ticket.priority === 'medium' ? '🟡' : '🟢'} {ticket.priority}
                            </span>
                          </div>
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">{ticket.title}</div>
                          <div className="text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</div>
                        </div>
                        <a href={`/dashboard/tickets/${ticket.id}`} className="btn btn-primary text-sm ml-4">
                          View
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 z-10"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a new user account</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="input"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="input"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="AGENT">Agent (Internal)</option>
                  </select>
                </div>

                {newUser.role === 'CLIENT' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Client Type
                    </label>
                    <select
                      value={newUser.clientType}
                      onChange={(e) => setNewUser({ ...newUser, clientType: e.target.value })}
                      className="input"
                    >
                      <option value="EXTERNAL">External Client</option>
                      <option value="INTERNAL">Internal Client</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn btn-primary flex-1"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
