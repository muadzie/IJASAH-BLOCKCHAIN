'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, FileText, Shield, CheckCircle, XCircle, Loader2, GraduationCap,
  BookOpen, TrendingUp, AlertTriangle, Clock, Activity, UserCheck,
  Download, ExternalLink, Copy, Award, BarChart3, Layers
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Stats {
  role: string
  total_alumni?: number
  total_mahasiswa?: number
  total_certificates?: number
  total_issued?: number
  total_draft?: number
  total_revoked?: number
  total_verifications?: number
  total_users?: number
  valid_verifications?: number
  invalid_verifications?: number
  valid_percentage?: number
  today_verifications?: number
  mahasiswa_by_status?: { aktif: number; lulus: number; dropout: number }
  certificates_by_month?: { month: number; year: number; total: number }[]
  verifications_by_day?: { date: string; total: number; valid: number }[]
  recent_activities?: { id: string; user_id: string; action: string; description: string; created_at: string }[]
  top_prodi?: { nama: string; total: number }[]
  // Mahasiswa specific
  profile?: {
    id: string; nim: string; nama_lengkap: string; tempat_lahir: string
    tanggal_lahir: string; jenis_kelamin: string; prodi: string; fakultas: string
    tahun_masuk: string; tahun_lulus: string; ipk: string; status: string
    email: string; no_hp: string
  } | null
  certificate?: {
    id: string; nomor_ijazah: string; hash_sha256: string; status: string
    issued_at: string; blockchain_verified: boolean
  } | null
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userData = localStorage.getItem('user')
        if (userData) setUser(JSON.parse(userData))

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }

        const [statsRes, meRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`),
          axios.get(`${API_URL}/auth/me`),
        ])
        setStats(statsRes.data)
        if (meRes.data && !userData) setUser(meRes.data)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!stats) return null

  const role = stats.role || user?.role

  // ============ MAHASISWA DASHBOARD ============
  if (role === 'mahasiswa') {
    return <MahasiswaDashboard stats={stats} user={user} />
  }

  // ============ VERIFIKATOR DASHBOARD ============
  if (role === 'verifikator') {
    return <VerifikatorDashboard stats={stats} />
  }

  // ============ ADMIN / AKADEMIK DASHBOARD ============
  return <AdminDashboard stats={stats} />
}

function StatCard({ icon: Icon, label, value, color, subtitle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </motion.div>
  )
}

// ===================== MAHASISWA DASHBOARD =====================
function MahasiswaDashboard({ stats, user }: { stats: Stats; user: any }) {
  const profile = stats.profile
  const cert = stats.certificate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Selamat Datang, {user?.name || profile?.nama_lengkap || 'Mahasiswa'}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">Dashboard Mahasiswa - Sistem Ijazah Blockchain</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          icon={UserCheck}
          label="Status Akun"
          value={profile?.status || '-'}
          color="bg-blue-500/20 text-blue-400"
          subtitle={profile?.nim ? `NIM: ${profile.nim}` : undefined}
        />
        <StatCard
          icon={Award}
          label="Status Ijazah"
          value={cert ? (cert.status === 'issued' ? 'Terverifikasi' : cert.status) : 'Belum Ada'}
          color={cert?.status === 'issued' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
          subtitle={cert?.nomor_ijazah || undefined}
        />
        <StatCard
          icon={Shield}
          label="Blockchain"
          value={cert?.blockchain_verified ? 'Terverifikasi' : 'Belum'}
          color={cert?.blockchain_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}
        />
      </div>

      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            Data Mahasiswa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Nama Lengkap</p>
              <p className="font-medium">{profile.nama_lengkap}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">NIM</p>
              <p className="font-medium">{profile.nim}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Program Studi</p>
              <p className="font-medium">{profile.prodi}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fakultas</p>
              <p className="font-medium">{profile.fakultas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tahun Masuk</p>
              <p className="font-medium">{profile.tahun_masuk}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tahun Lulus</p>
              <p className="font-medium">{profile.tahun_lulus || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">IPK</p>
              <p className="font-medium">{profile.ipk || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">No. HP</p>
              <p className="font-medium">{profile.no_hp || '-'}</p>
            </div>
          </div>
        </motion.div>
      )}

      {cert && cert.status === 'issued' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-green-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-semibold">Ijazah Terverifikasi Blockchain</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Nomor Ijazah</p>
              <p className="font-medium font-mono text-sm">{cert.nomor_ijazah}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tanggal Terbit</p>
              <p className="font-medium">{cert.issued_at}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-400">Hash SHA-256</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-gray-300 break-all">{cert.hash_sha256}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cert.hash_sha256)
                    toast.success('Hash disalin!')
                  }}
                  className="text-blue-400 hover:text-blue-300 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Link
              href={`/verify/${cert.hash_sha256}`}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Verifikasi Online
            </Link>
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/verifikasi"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
        >
          Verifikasi Ijazah
        </Link>
      </div>
    </div>
  )
}

// ===================== VERIFIKATOR DASHBOARD =====================
function VerifikatorDashboard({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Verifikator</h1>
        <p className="text-gray-400 text-sm mt-1">Verifikasi keaslian ijazah berbasis blockchain</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Total Verifikasi" value={stats.total_verifications || 0} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={CheckCircle} label="Valid" value={stats.valid_verifications || 0} color="bg-green-500/20 text-green-400" />
        <StatCard icon={XCircle} label="Tidak Valid" value={stats.invalid_verifications || 0} color="bg-red-500/20 text-red-400" />
        <StatCard icon={Activity} label="Hari Ini" value={stats.today_verifications || 0} color="bg-purple-500/20 text-purple-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Verifikasi Cepat
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Gunakan fitur verifikasi untuk memeriksa keaslian ijazah
          </p>
          <Link
            href="/dashboard/verifikasi"
            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
          >
            Buka Halaman Verifikasi
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {stats.valid_percentage !== undefined && stats.valid_percentage >= 80 ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <BarChart3 className="w-5 h-5 text-blue-400" />
            )}
            Tingkat Validitas
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={stats.valid_percentage && stats.valid_percentage >= 80 ? '#10b981' : stats.valid_percentage && stats.valid_percentage >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${stats.valid_percentage || 0} ${100 - (stats.valid_percentage || 0)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {stats.valid_percentage || 0}%
              </span>
            </div>
            <div className="text-sm text-gray-400">
              <p>{stats.valid_verifications || 0} valid dari {stats.total_verifications || 0} verifikasi</p>
            </div>
          </div>
        </motion.div>
      </div>

      {stats.verifications_by_day && stats.verifications_by_day.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Verifikasi 30 Hari Terakhir
          </h2>
          <div className="space-y-2">
            {stats.verifications_by_day.slice(0, 14).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24">{new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-green-500/50 rounded-l-full transition-all"
                    style={{ width: `${day.total > 0 ? (day.valid / day.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{day.valid}/{day.total}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===================== ADMIN / AKADEMIK DASHBOARD =====================
function AdminDashboard({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard {stats.role === 'super_admin' ? 'Super Admin' : 'Admin Akademik'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Overview sistem verifikasi ijazah blockchain</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Total Mahasiswa" value={stats.total_mahasiswa || 0} color="bg-blue-500/20 text-blue-400"
          subtitle={`${stats.mahasiswa_by_status?.lulus || 0} lulus, ${stats.mahasiswa_by_status?.aktif || 0} aktif`} />
        <StatCard icon={FileText} label="Total Sertifikat" value={stats.total_certificates || 0} color="bg-purple-500/20 text-purple-400"
          subtitle={`${stats.total_issued || 0} terbit, ${stats.total_draft || 0} draft`} />
        <StatCard icon={Shield} label="Verifikasi" value={stats.total_verifications || 0} color="bg-green-500/20 text-green-400"
          subtitle={`${stats.valid_percentage || 0}% valid`} />
        <StatCard icon={Users} label="Total Users" value={stats.total_users || 0} color="bg-orange-500/20 text-orange-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stats.top_prodi && stats.top_prodi.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Top Program Studi
            </h2>
            <div className="space-y-3">
              {stats.top_prodi.map((prodi, idx) => (
                <div key={prodi.nama} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-5">{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{prodi.nama}</span>
                      <span className="text-gray-400">{prodi.total} alumni</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(prodi.total / Math.max(...(stats.top_prodi || []).map(p => p.total))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {stats.mahasiswa_by_status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Status Mahasiswa
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Aktif', value: stats.mahasiswa_by_status.aktif, color: 'bg-blue-500', pct: (stats.mahasiswa_by_status.aktif / (stats.total_mahasiswa || 1)) * 100 },
                { label: 'Lulus', value: stats.mahasiswa_by_status.lulus, color: 'bg-green-500', pct: (stats.mahasiswa_by_status.lulus / (stats.total_mahasiswa || 1)) * 100 },
                { label: 'Dropout', value: stats.mahasiswa_by_status.dropout, color: 'bg-red-500', pct: (stats.mahasiswa_by_status.dropout / (stats.total_mahasiswa || 1)) * 100 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="text-gray-400">{item.value} ({Math.round(item.pct)}%)</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {stats.recent_activities && stats.recent_activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Aktivitas Terbaru
          </h2>
          <div className="space-y-3">
            {stats.recent_activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-300">{act.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(act.created_at).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {stats.certificates_by_month && stats.certificates_by_month.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Sertifikat per Bulan
          </h2>
          <div className="flex items-end gap-2 h-32">
            {[...stats.certificates_by_month].reverse().map((item) => {
              const maxVal = Math.max(...stats.certificates_by_month!.map(c => c.total))
              return (
                <div key={`${item.year}-${item.month}`} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all"
                    style={{ height: `${(item.total / maxVal) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{new Date(item.year, item.month - 1).toLocaleDateString('id-ID', { month: 'short' })}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/mahasiswa"
          className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-all flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Kelola Mahasiswa
        </Link>
        <Link
          href="/dashboard/sertifikat"
          className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Kelola Sertifikat
        </Link>
        <Link
          href="/dashboard/verifikasi"
          className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-all flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Verifikasi
        </Link>
      </div>
    </div>
  )
}
