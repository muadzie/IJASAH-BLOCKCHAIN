'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Users, Plus, Edit, Trash2, Loader2, Search, Shield,
  Server, RefreshCw, Activity, BookOpen, X, UserCog
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface AppUser { id: string; name: string; email: string; role: string; created_at: string; mahasiswa?: any }
interface Fakultas { id: string; kode: string; nama: string; prodis?: Prodi[] }
interface Prodi { id: string; fakultas_id: string; kode: string; nama: string; jenjang: string; fakultas?: Fakultas }
interface SystemInfo { php_version: string; laravel_version: string; environment: string; debug_mode: boolean; blockchain_mock_mode: boolean; app_url: string; frontend_url: string; database: string }
interface Activity { id: string; user: { name: string } | null; action: string; description: string; created_at: string }

const roleOptions = ['super_admin', 'admin_akademik', 'mahasiswa', 'verifikator']
const roleColors: Record<string, string> = {
  super_admin: 'bg-red-500/20 text-red-400',
  admin_akademik: 'bg-blue-500/20 text-blue-400',
  mahasiswa: 'bg-green-500/20 text-green-400',
  verifikator: 'bg-purple-500/20 text-purple-400',
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'fakultas', label: 'Fakultas & Prodi', icon: BookOpen },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'system', label: 'System', icon: Server },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Manajemen sistem dan pengguna</p>
      </div>

      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'fakultas' && <FakultasManagement />}
      {activeTab === 'activity' && <ActivityLogs />}
      {activeTab === 'system' && <SystemInfoPanel />}
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mahasiswa' })
  const [editingRole, setEditingRole] = useState<{ id: string; role: string } | null>(null)

  const fetchUsers = async () => {
    try {
      const params: any = { per_page: 50 }
      if (search) params.search = search
      const res = await axios.get(`${API_URL}/users`, { params })
      setUsers(res.data.data || [])
    } catch {} finally { setIsLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/users`, form)
      toast.success('User berhasil dibuat')
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', role: 'mahasiswa' })
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.errors?.email?.[0] || 'Gagal membuat user')
    }
  }

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await axios.put(`${API_URL}/users/${id}/role`, { role })
      toast.success('Role berhasil diupdate')
      setEditingRole(null)
      fetchUsers()
    } catch { toast.error('Gagal update role') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus user "${name}"?`)) return
    try {
      await axios.delete(`${API_URL}/users/${id}`)
      toast.success('User berhasil dihapus')
      fetchUsers()
    } catch { toast.error('Gagal menghapus user') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tambah User Baru</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nama</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                  {roleOptions.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all">Simpan</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Nama</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Email</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Role</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Terdaftar</th>
                  <th className="text-center p-3 text-sm text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-sm font-medium">{user.name}</td>
                    <td className="p-3 text-sm text-gray-400">{user.email}</td>
                    <td className="p-3">
                      {editingRole?.id === user.id ? (
                        <div className="flex items-center gap-1">
                          <select value={editingRole.role} onChange={e => setEditingRole({ ...editingRole, role: e.target.value })}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs focus:outline-none focus:border-blue-400">
                            {roleOptions.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                          </select>
                          <button onClick={() => handleRoleChange(user.id, editingRole.role)} className="text-green-400 hover:text-green-300 text-xs">ok</button>
                          <button onClick={() => setEditingRole(null)} className="text-red-400 hover:text-red-300 text-xs">x</button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-500/20 text-gray-400'}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setEditingRole({ id: user.id, role: user.role })} className="text-blue-400 hover:text-blue-300 transition-colors" title="Ganti Role">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id, user.name)} className="text-red-400 hover:text-red-300 transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Tidak ada user</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FakultasManagement() {
  const [fakultas, setFakultas] = useState<Fakultas[]>([])
  const [prodi, setProdi] = useState<Prodi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddFakultas, setShowAddFakultas] = useState(false)
  const [showAddProdi, setShowAddProdi] = useState(false)
  const [fakultasForm, setFakultasForm] = useState({ kode: '', nama: '' })
  const [prodiForm, setProdiForm] = useState({ fakultas_id: '', kode: '', nama: '', jenjang: 'S1' })

  const fetchData = async () => {
    try {
      const [fakRes, prodiRes] = await Promise.all([
        axios.get(`${API_URL}/fakultas`),
        axios.get(`${API_URL}/prodi`),
      ])
      setFakultas(fakRes.data || [])
      setProdi(prodiRes.data || [])
    } catch {} finally { setIsLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleAddFakultas = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/fakultas`, fakultasForm)
      toast.success('Fakultas berhasil dibuat')
      setShowAddFakultas(false)
      setFakultasForm({ kode: '', nama: '' })
      fetchData()
    } catch { toast.error('Gagal membuat fakultas') }
  }

  const handleDeleteFakultas = async (id: string, nama: string) => {
    if (!confirm(`Yakin hapus fakultas ${nama}?`)) return
    try {
      await axios.delete(`${API_URL}/fakultas/${id}`)
      toast.success('Fakultas berhasil dihapus')
      fetchData()
    } catch { toast.error('Gagal (masih memiliki prodi)') }
  }

  const handleAddProdi = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/prodi`, prodiForm)
      toast.success('Prodi berhasil dibuat')
      setShowAddProdi(false)
      setProdiForm({ fakultas_id: '', kode: '', nama: '', jenjang: 'S1' })
      fetchData()
    } catch { toast.error('Gagal membuat prodi') }
  }

  const handleDeleteProdi = async (id: string, nama: string) => {
    if (!confirm(`Yakin hapus prodi ${nama}?`)) return
    try {
      await axios.delete(`${API_URL}/prodi/${id}`)
      toast.success('Prodi berhasil dihapus')
      fetchData()
    } catch { toast.error('Gagal (masih memiliki mahasiswa)') }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setShowAddFakultas(true)} className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Fakultas
        </button>
        <button onClick={() => setShowAddProdi(true)} className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Prodi
        </button>
      </div>

      {showAddFakultas && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah Fakultas</h3>
            <form onSubmit={handleAddFakultas} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Kode</label>
                <input type="text" value={fakultasForm.kode} onChange={e => setFakultasForm({ ...fakultasForm, kode: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nama</label>
                <input type="text" value={fakultasForm.nama} onChange={e => setFakultasForm({ ...fakultasForm, nama: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddFakultas(false)} className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all">Simpan</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {showAddProdi && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tambah Prodi</h3>
            <form onSubmit={handleAddProdi} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Fakultas</label>
                <select value={prodiForm.fakultas_id} onChange={e => setProdiForm({ ...prodiForm, fakultas_id: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                  <option value="">Pilih Fakultas</option>
                  {fakultas.map(f => <option key={f.id} value={f.id}>{f.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Kode Prodi</label>
                <input type="text" value={prodiForm.kode} onChange={e => setProdiForm({ ...prodiForm, kode: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nama Prodi</label>
                <input type="text" value={prodiForm.nama} onChange={e => setProdiForm({ ...prodiForm, nama: e.target.value })} required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Jenjang</label>
                <select value={prodiForm.jenjang} onChange={e => setProdiForm({ ...prodiForm, jenjang: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                  {['D3', 'D4', 'S1', 'S2', 'S3'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddProdi(false)} className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all">Simpan</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {fakultas.map(f => (
          <div key={f.id} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{f.nama}</h3>
                <p className="text-xs text-gray-400">Kode: {f.kode}</p>
              </div>
              <button onClick={() => handleDeleteFakultas(f.id, f.nama)} className="text-red-400 hover:text-red-300 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {(f.prodis || []).map(p => (
                <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5">
                  <span className="text-sm">{p.nama} <span className="text-xs text-gray-500">({p.jenjang})</span></span>
                  <button onClick={() => handleDeleteProdi(p.id, p.nama)} className="text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!f.prodis || f.prodis.length === 0) && (
                <p className="text-xs text-gray-500 italic">Belum ada prodi</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityLogs() {
  const [logs, setLogs] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/activity-logs`, { params: { page, per_page: 20 } })
        setLogs(res.data.data || [])
        setLastPage(res.data.last_page || 1)
      } catch {} finally { setIsLoading(false) }
    }
    fetchLogs()
  }, [page])

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>

  return (
    <div className="glass-card p-4">
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-300">{log.description}</p>
              <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                <span>{log.user?.name || 'System'}</span>
                <span>{new Date(log.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{log.action}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-center text-gray-500 py-4">Belum ada aktivitas</p>}
      </div>
      {lastPage > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">Hal {page}/{lastPage}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50">Prev</button>
            <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

function SystemInfoPanel() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/system/info`).then(res => setInfo(res.data)).catch(() => {}).finally(() => setIsLoading(false))
  }, [])

  const handleClearCache = async () => {
    setIsClearing(true)
    try {
      await axios.post(`${API_URL}/system/clear-cache`)
      toast.success('Cache berhasil dibersihkan')
    } catch { toast.error('Gagal') } finally { setIsClearing(false) }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-blue-400" /> System Information</h2>
        <div className="space-y-3">
          {info && [
            ['PHP Version', info.php_version],
            ['Laravel Version', info.laravel_version],
            ['Environment', info.environment],
            ['Debug Mode', info.debug_mode ? 'Enabled' : 'Disabled'],
            ['Database', info.database],
            ['Blockchain Mode', info.blockchain_mock_mode ? 'Mock (Development)' : 'Production'],
            ['App URL', info.app_url],
            ['Frontend URL', info.frontend_url],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between py-1 border-b border-white/5 last:border-0">
              <span className="text-sm text-gray-400">{label as string}</span>
              <span className="text-sm font-mono">{value as string}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-blue-400" /> Actions</h2>
        <div className="space-y-3">
          <button onClick={handleClearCache} disabled={isClearing}
            className="w-full px-4 py-3 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Clear Cache
          </button>
          <p className="text-xs text-gray-500 text-center">Membersihkan cache aplikasi, view, route, config</p>
        </div>
      </div>
    </div>
  )
}
