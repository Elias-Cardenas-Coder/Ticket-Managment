'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/app/components/Navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FadeInUp, ScaleIn } from '@/app/components/Animations';

type Solicitude = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdById: string;
  createdBy?: { id: string; email: string; name: string };
  applications?: Application[];
};

type Application = {
  id: string;
  userId: string;
  requestId: string;
  status: string;
};

type Applicant = {
  id: string;
  user: { id: string; email: string; name: string };
  request: { id: string; title: string };
  status: string;
  createdAt: string;
};

export default function RequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [solicitudes, setSolicitudes] = useState<Solicitude[]>([]);
  const [userApplications, setUserApplications] = useState<Record<string, Application>>({});
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [selectedSolicitude, setSelectedSolicitude] = useState<Solicitude | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');

  const user = (session?.user ?? null) as any | null;
  const isAgent = user?.role === 'AGENT';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  async function loadSolicitudes() {
    setLoading(true);
    const res = await fetch('/api/requests', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.success) {
      setSolicitudes(data.data.data || []);
      // Build map of user applications
      const appMap: Record<string, Application> = {};
      data.data.data.forEach((sol: Solicitude) => {
        if (sol.applications && sol.applications.length > 0) {
          sol.applications.forEach((app) => {
            appMap[app.requestId] = app;
          });
        }
      });
      setUserApplications(appMap);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (status === 'authenticated') loadSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleCreateSolicitude(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    setLoading(true);
    const res = await fetch('/api/requests', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    });

    const data = await res.json();
    if (data.success) {
      setNewTitle('');
      setNewDescription('');
      loadSolicitudes();
    } else {
      alert(data.error || 'Error creating solicitude');
    }
    setLoading(false);
  }

  async function handleApply(requestId: string) {
    setLoading(true);
    const res = await fetch('/api/applications', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });

    const data = await res.json();
    if (data.success) {
      loadSolicitudes();
    } else {
      alert(data.error || 'Error applying to solicitude');
    }
    setLoading(false);
  }

  async function handleDeleteSolicitude(id: string) {
    if (!confirm(`${'Delete this request'}?`)) return;

    setLoading(true);
    const res = await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });

    const data = await res.json();
    if (data.success) {
      loadSolicitudes();
    } else {
      alert(data.error || 'Error deleting solicitude');
    }
    setLoading(false);
  }

  function openEditModal(sol: Solicitude) {
    setEditId(sol.id);
    setEditTitle(sol.title || '');
    setEditDescription(sol.description || '');
    setEditStatus(sol.status === 'CLOSED' ? 'CLOSED' : 'OPEN');
    setEditOpen(true);
  }

  async function handleSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(editId)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription, status: editStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEditOpen(false);
        setEditId(null);
        loadSolicitudes();
      } else {
        alert(data.error || 'Error updating solicitude');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating solicitude');
    }
    setLoading(false);
  }

  async function fetchApplicants(requestId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications?requestId=${encodeURIComponent(requestId)}`, { credentials: 'same-origin' });
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data || []);
        const sol = solicitudes.find((s) => s.id === requestId) || null;
        setSelectedSolicitude(sol);
        setApplicantsOpen(true);
      } else {
        alert(data.error || 'Error cargando aplicantes');
      }
    } catch (e) {
      console.error(e);
      alert('Error cargando aplicantes');
    }
    setLoading(false);
  }

  async function handleUpdateApplication(appId: string, status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh applicants and solicitudes lists
        fetchApplicants(selectedSolicitude?.id || '');
        loadSolicitudes();
      } else {
        alert(data.error || 'Error actualizando aplicación');
      }
    } catch (e) {
      console.error(e);
      alert('Error actualizando aplicación');
    }
    setLoading(false);
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-300 dark:border-purple-600 border-t-purple-600 dark:border-t-purple-300 rounded-full"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <FadeInUp>
          <motion.div className="mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
              📋 {'Requests'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isAgent ? 'Manage requests' : 'View your requests'}
            </p>
          </motion.div>

          {/* Admin Create Form */}
          {isAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="card-glass p-8 mb-12 backdrop-blur-xl border border-white/20 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">✏️ {'New Request'}</h2>
              <form onSubmit={handleCreateSolicitude} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{'Title'}</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={'Title'}
                    className="input w-full"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{'Description'}</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder={'Description'}
                    className="input w-full min-h-24"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !newTitle || !newDescription}
                  className="btn-gradient w-full disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Create Request'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Solicitudes List */}
          <div className="grid gap-6">
            {solicitudes.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glass p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No hay solicitudes disponibles</p>
              </motion.div>
            ) : (
              solicitudes.map((solicitud, index) => (
                <motion.div
                  key={solicitud.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-glass p-6 backdrop-blur-xl border border-white/20 dark:border-gray-700 hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{solicitud.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{solicitud.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
                        📌 Creada por: {solicitud.createdBy?.name || 'Admin'}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${solicitud.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {solicitud.status === 'OPEN' ? '🔓 Abierta' : '🔒 Cerrada'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {isAgent ? (
                      <>
                        <button onClick={() => openEditModal(solicitud)} className="btn-secondary text-sm">✏️ {'Edit'}</button>
                        <button onClick={() => handleDeleteSolicitude(solicitud.id)} disabled={loading} className="btn-danger text-sm">
                          🗑️ {'Delete'}
                        </button>
                        <button onClick={() => fetchApplicants(solicitud.id)} className="btn-secondary text-sm ml-auto">👥 {'View Applicants'} ({(solicitud.applications || []).length})</button>
                      </>
                    ) : (
                      <>
                        {userApplications[solicitud.id] ? (
                          <div className="flex items-center gap-2 w-full">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${userApplications[solicitud.id].status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : userApplications[solicitud.id].status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                              {userApplications[solicitud.id].status === 'PENDING' ? `⏳ ${'Pending'}` : userApplications[solicitud.id].status === 'APPROVED' ? `✅ ${'Approved'}` : `❌ ${'Rejected'}`}
                            </span>
                            <button className="btn-secondary text-sm ml-auto">🔍 {'View Details'}</button>
                          </div>
                        ) : (
                          <button onClick={() => handleApply(solicitud.id)} disabled={loading || solicitud.status !== 'OPEN'} className="btn-gradient w-full disabled:opacity-50">
                            ✋ {'Apply'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </FadeInUp>
        {/* Applicants modal */}
        {applicantsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setApplicantsOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{'Applicants'} - {selectedSolicitude?.title}</h3>
                  <p className="text-sm text-gray-500">{'Manage applications'}</p>
                </div>
                <button onClick={() => setApplicantsOpen(false)} className="text-gray-500 hover:text-gray-700">✖</button>
              </div>

              <div className="space-y-3 max-h-80 overflow-auto">
                {applicants.length === 0 ? (
                  <p className="text-center text-gray-500">{'No applicants yet'}</p>
                ) : (
                  applicants.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div>
                        <div className="font-semibold">{a.user.name} <span className="text-xs text-gray-400">({a.user.email})</span></div>
                        <div className="text-sm text-gray-500">{'Applied at'}: {new Date(a.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${a.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : a.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.status}
                        </span>
                        {a.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleUpdateApplication(a.id, 'APPROVED')} className="btn btn-success text-sm">{'Accept'}</button>
                            <button onClick={() => handleUpdateApplication(a.id, 'REJECTED')} className="btn btn-danger text-sm">{'Reject'}</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Solicitude modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-w-2xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">✏️ {'Edit Request'}</h3>
                  <p className="text-sm text-gray-500">{'Update request details'}</p>
                </div>
                <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700">✖</button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{'Title'}</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{'Description'}</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="input w-full min-h-24" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{'Status'}</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className="input w-48">
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">{'Cancel'}</button>
                  <button type="submit" disabled={loading} className="btn-gradient">{'Save'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
