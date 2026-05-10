'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Plus, Search, Download, Upload, Edit, Trash2, Loader2,
  X, ChevronLeft, ChevronRight, Filter, FileSpreadsheet, CheckCircle,
  XCircle, GraduationCap, BookOpen, Mail, Phone, Calendar
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Mahasiswa {
  id: string; nim: string; nama_lengkap: string; tempat_lahir: string
  tanggal_lahir: string; jenis_kelamin: string; email: string; no_hp: string
  tahun_masuk: string; tahun_lulus: string | null; ipk: string | null
  status: string; prodi: { id: string; nama: string; jenjang: string; fakultas: { nama: string } }
  ijazah: { id: string; status: string; nomor_ijazah: string } | null
  created_at: string
}

interface Fakultas { id: string; kode: string; nama: string; prodis: Prodi[] }
interface Prodi { id: string; kode: string; nama: string; jenjang: string }

export default function MahasiswaPage() {
  const [data, setData] = useState<Mahasiswa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [fakultasList, setFakultasList] = useState<Fakultas[]>([])
  const [prodiList, setProdiList] = useState<Prodi[]>([])
  const [filterProdi, setFilterProdi] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [form, setForm] = useState({
    nim: '', nama_lengkap: '', email: '', no_hp: '',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'L',
    prodi_id: '', tahun_masuk: '', create_user: false,
  })

  const [importData, setImportData] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      if (filterProdi) params.prodi_id = filterProdi
      if (filterStatus) params.status = filterStatus
      const res = await axios.get(`${API_URL}/mahasiswa`, { params })
      setData(res.data.data || [])
      setLastPage(res.data.last_page || 1)
      setTotal(res.data.total || 0)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRef = async () => {
    try {
      const [fakRes, prodiRes] = await Promise.all([
        axios.get(`${API_URL}/fakultas`),
        axios.get(`${API_URL}/prodi`),
      ])
      setFakultasList(fakRes.data || [])
      setProdiList(prodiRes.data || [])
    } catch {}
  }

  useEffect(() => { fetchData() }, [page, search, filterProdi, filterStatus])
  useEffect(() => { fetchRef() }, [])

  const resetForm = () => {
    setForm({ nim: '', nama_lengkap: '', email: '', no_hp: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'L', prodi_id: '', tahun_masuk: '', create_user: false })
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editId) {
        await axios.put(`${API_URL}/mahasiswa/${editId}`, form)
        toast.success('Mahasiswa berhasil diupdate')
      } else {
        await axios.post(`${API_URL}/mahasiswa`, form)
        toast.success('Mahasiswa berhasil ditambahkan')
      }
      resetForm()
      setShowAdd(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.errors?.[Object.keys(error.response?.data?.errors || {})[0]]?.[0] || 'Gagal menyimpan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/mahasiswa/${id}`)
      const m = res.data
      setForm({
        nim: m.nim, nama_lengkap: m.nama_lengkap, email: m.email,
        no_hp: m.no_hp || '', tempat_lahir: m.tempat_lahir || '',
        tanggal_lahir: m.tanggal_lahir || '', jenis_kelamin: m.jenis_kelamin || 'L',
        prodi_id: m.prodi_id, tahun_masuk: m.tahun_masuk || '', create_user: false,
      })
      setEditId(id)
      setShowAdd(true)
    } catch { toast.error('Gagal memuat data') }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus ${name}?`)) return
    try {
      await axios.delete(`${API_URL}/mahasiswa/${id}`)
      toast.success('Mahasiswa berhasil dihapus')
      fetchData()
    } catch { toast.error('Gagal menghapus (mungkin memiliki sertifikat)') }
  }

  const handleImport = async () => {
    setIsSubmitting(true)
    try {
      const rows = importData.trim().split('\n').filter(Boolean).map(line => {
        const [nim, nama_lengkap, email, prodi_kode, tahun_masuk] = line.split(',').map(s => s.trim())
        return { nim, nama_lengkap, email, prodi_kode, tahun_masuk }
      })
      if (rows.length === 0) { toast.error('Data kosong'); return }
      await axios.post(`${API_URL}/mahasiswa/import`, { data: rows })
      toast.success(`${rows.length} mahasiswa berhasil diimport`)
      setImportData('')
      setShowImport(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal import')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    const header = 'NIM,Nama Lengkap,Email,Prodi,Fakultas,Tahun Masuk,Status'
    const rows = data.map(m =>
      `${m.nim},"${m.nama_lengkap}",${m.email},${m.prodi?.nama || ''},${m.prodi?.fakultas?.nama || ''},${m.tahun_masuk},${m.status}`
    ).join('\n')
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mahasiswa_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success('Data diexport')
  }

  const handleGenerateCertificate = (mahasiswaId: string) => {
    window.location.href = `/dashboard/sertifikat?mahasiswa_id=${mahasiswaId}`
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      lulus: 'bg-green-500/20 text-green-400',
      aktif: 'bg-blue-500/20 text-blue-400',
      dropout: 'bg-red-500/20 text-red-400',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Data Mahasiswa</h1>
          <p className="text-gray-400 text-sm mt-1">Total {total} mahasiswa terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setShowImport(true); setShowAdd(false) }} className="px-3 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => { setShowAdd(true); setShowImport(false); resetForm() }} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Mahasiswa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari NIM, nama, email..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
          />
        </div>
        <select value={filterProdi} onChange={e => { setFilterProdi(e.target.value); setPage(1) }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          <option value="">Semua Prodi</option>
          {prodiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="lulus">Lulus</option>
          <option value="dropout">Dropout</option>
        </select>
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
              <button onClick={() => { setShowAdd(false); resetForm() }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">NIM *</label>
                  <input type="text" value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Nama Lengkap *</label>
                  <input type="text" value={form.nama_lengkap} onChange={e => setForm({ ...form, nama_lengkap: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">No. HP</label>
                  <input type="text" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tempat Lahir</label>
                  <input type="text" value={form.tempat_lahir} onChange={e => setForm({ ...form, tempat_lahir: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tanggal Lahir</label>
                  <input type="date" value={form.tanggal_lahir} onChange={e => setForm({ ...form, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Jenis Kelamin</label>
                  <select value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Program Studi *</label>
                  <select value={form.prodi_id} onChange={e => setForm({ ...form, prodi_id: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                    <option value="">Pilih Prodi</option>
                    {fakultasList.map(f => (
                      <optgroup key={f.id} label={f.nama}>
                        {(f.prodis || []).map(p => <option key={p.id} value={p.id}>{p.nama} ({p.jenjang})</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tahun Masuk *</label>
                  <input type="text" value={form.tahun_masuk} onChange={e => setForm({ ...form, tahun_masuk: e.target.value })} required maxLength={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                {!editId && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="create_user" checked={form.create_user} onChange={e => setForm({ ...form, create_user: e.target.checked })}
                      className="rounded bg-white/5 border-white/10" />
                    <label htmlFor="create_user" className="text-sm text-gray-300">Buat akun login</label>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                <button type="button" onClick={() => { setShowAdd(false); resetForm() }} className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editId ? 'Simpan Perubahan' : 'Tambah Mahasiswa'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Import Modal */}
      {showImport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Import Mahasiswa</h2>
              <button onClick={() => { setShowImport(false); setImportData('') }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Masukkan data dengan format: <code className="text-blue-400">NIM, Nama Lengkap, Email, Kode Prodi, Tahun Masuk</code>
            </p>
            <p className="text-xs text-gray-500 mb-4">Contoh:<br />
              <code className="text-gray-400">20200121001, Ahmad Fauzi, ahmad@email.com, TI, 2020<br />20200121002, Siti Nurhaliza, siti@email.com, SI, 2020</code>
            </p>
            <textarea
              value={importData} onChange={e => setImportData(e.target.value)}
              placeholder="Tempel data di sini..."
              rows={8}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm font-mono"
            />
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => { setShowImport(false); setImportData('') }} className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
              <button onClick={handleImport} disabled={isSubmitting || !importData.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import Data
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">NIM</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Nama</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Prodi</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Status</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Ijazah</th>
                  <th className="text-center p-3 text-sm text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-sm font-mono">{m.nim}</td>
                    <td className="p-3">
                      <Link href={`/dashboard/mahasiswa/${m.id}`} className="text-sm font-medium hover:text-blue-400 transition-colors">
                        {m.nama_lengkap}
                      </Link>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </td>
                    <td className="p-3 text-sm">{m.prodi?.nama || '-'}</td>
                    <td className="p-3">{statusBadge(m.status)}</td>
                    <td className="p-3">
                      {m.ijazah ? (
                        <span className={`text-xs ${m.ijazah.status === 'issued' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {m.ijazah.nomor_ijazah}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleGenerateCertificate(m.id)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          + Buat Sertifikat
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(m.id)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(m.id, m.nama_lengkap)} className="text-red-400 hover:text-red-300 transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada data mahasiswa</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Halaman {page} dari {lastPage}
              </p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
