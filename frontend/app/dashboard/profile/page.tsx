'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Lock, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/auth/me`).then(res => {
      setUser(res.data)
    }).catch(() => toast.error('Gagal memuat profil')).finally(() => setIsLoading(false))
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== newPasswordConfirmation) {
      toast.error('Konfirmasi password tidak cocok')
      return
    }
    setIsSubmitting(true)
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      })
      toast.success('Password berhasil diubah')
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirmation('')
      setShowForm(false)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[Object.keys(err.response?.data?.errors || {})[0]]?.[0] || 'Gagal mengubah password'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
  }

  if (!user) return null

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin_akademik: 'Admin Akademik',
    mahasiswa: 'Mahasiswa',
    verifikator: 'Verifikator',
  }

  const roleColors: Record<string, string> = {
    super_admin: 'text-red-400 bg-red-500/20',
    admin_akademik: 'text-blue-400 bg-blue-500/20',
    mahasiswa: 'text-green-400 bg-green-500/20',
    verifikator: 'text-purple-400 bg-purple-500/20',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-gray-400 text-sm mt-1">Informasi akun dan pengaturan password</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold shrink-0">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role] || 'text-gray-400 bg-gray-500/20'}`}>
                <Shield className="w-3 h-3 inline mr-1" />
                {roleLabels[user.role] || user.role}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" /> Ubah Password
          </h3>
          <button onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all">
            {showForm ? 'Batal' : 'Ganti Password'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password Saat Ini</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password Baru</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} required minLength={8}
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="submit" disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Simpan Password
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
