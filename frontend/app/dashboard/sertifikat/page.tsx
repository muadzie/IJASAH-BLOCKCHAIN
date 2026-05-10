'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, Loader2, Globe, Plus, XCircle, CheckCircle,
  Edit, Search, ChevronLeft, ChevronRight, ExternalLink, Copy, Save
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Certificate {
  id: string; nomor_ijazah: string; hash_sha256: string; pdf_hash: string | null
  status: string; blockchain_tx_hash: string | null; blockchain_block: string | null
  issued_at: string | null; created_at: string; notes: string | null
  mahasiswa: { id: string; nim: string; nama_lengkap: string; prodi: { nama: string } }
  issuer: { name: string } | null
}

export default function SertifikatPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [showEdit, setShowEdit] = useState<Certificate | null>(null)
  const [generateForm, setGenerateForm] = useState({ mahasiswa_id: '', ipk: '', tanggal_lulus: '', notes: '' })
  const [editForm, setEditForm] = useState({ nomor_ijazah: '', notes: '' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const fetchCertificates = async () => {
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      const response = await axios.get(`${API_URL}/certificates`, { params })
      setData(response.data.data || response.data || [])
      setLastPage(response.data.last_page || 1)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMahasiswa = async () => {
    try {
      const response = await axios.get(`${API_URL}/mahasiswa`, { params: { per_page: 100, status: 'lulus' } })
      const list = response.data.data || response.data || []
      setMahasiswaList(Array.isArray(list) ? list : [])
    } catch {}
  }

  useEffect(() => { fetchCertificates() }, [page, search])
  useEffect(() => { fetchMahasiswa() }, [])

  useEffect(() => {
    const mahasiswaId = searchParams.get('mahasiswa_id')
    if (mahasiswaId) {
      setGenerateForm(prev => ({ ...prev, mahasiswa_id: mahasiswaId }))
      setShowGenerate(true)
    }
  }, [searchParams])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    try {
      await axios.post(`${API_URL}/certificates/generate`, {
        mahasiswa_id: generateForm.mahasiswa_id,
        ipk: parseFloat(generateForm.ipk),
        tanggal_lulus: generateForm.tanggal_lulus,
        notes: generateForm.notes,
      })
      toast.success('Sertifikat berhasil dibuat!')
      setShowGenerate(false)
      setGenerateForm({ mahasiswa_id: '', ipk: '', tanggal_lulus: '', notes: '' })
      fetchCertificates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal membuat sertifikat')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEdit) return
    setIsSaving(true)
    try {
      await axios.put(`${API_URL}/certificates/${showEdit.id}`, editForm)
      toast.success('Sertifikat berhasil diupdate')
      setShowEdit(null)
      fetchCertificates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal update')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await axios.post(`${API_URL}/certificates/${id}/publish`)
      toast.success('Sertifikat berhasil dipublikasi ke blockchain!')
      fetchCertificates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal publish')
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Yakin ingin mencabut sertifikat ini?')) return
    try {
      await axios.post(`${API_URL}/certificates/${id}/revoke`)
      toast.success('Sertifikat berhasil dicabut')
      fetchCertificates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mencabut')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/certificates/${id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ijazah-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download berhasil')
    } catch { toast.error('Gagal mendownload') }
  }

  const openEdit = (cert: Certificate) => {
    setEditForm({ nomor_ijazah: cert.nomor_ijazah, notes: cert.notes || '' })
    setShowEdit(cert)
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-yellow-500/20 text-yellow-400',
      pending: 'bg-blue-500/20 text-blue-400',
      issued: 'bg-green-500/20 text-green-400',
      revoked: 'bg-red-500/20 text-red-400',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Sertifikat</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola penerbitan ijazah digital</p>
        </div>
        <button onClick={() => setShowGenerate(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Sertifikat
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari NIM, nama, nomor ijazah..."
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Generate Sertifikat Baru</h3>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Mahasiswa</label>
                <select value={generateForm.mahasiswa_id} onChange={e => setGenerateForm({ ...generateForm, mahasiswa_id: e.target.value })}
                  required className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm">
                  <option value="">Pilih Mahasiswa (Lulus)</option>
                  {mahasiswaList
                    .filter((m: any) => m.status === 'lulus' || !m.ijazah)
                    .map((m: any) => (
                      <option key={m.id} value={m.id}>{m.nim} - {m.nama_lengkap} ({m.prodi?.nama})</option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">IPK</label>
                  <input type="number" step="0.01" min="0" max="4" value={generateForm.ipk}
                    onChange={e => setGenerateForm({ ...generateForm, ipk: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tanggal Lulus</label>
                  <input type="date" value={generateForm.tanggal_lulus}
                    onChange={e => setGenerateForm({ ...generateForm, tanggal_lulus: e.target.value })} required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Catatan</label>
                <textarea value={generateForm.notes} onChange={e => setGenerateForm({ ...generateForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowGenerate(false)}
                  className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={isGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Generate
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit Sertifikat</h3>
            <div className="mb-4 p-3 glass rounded-lg text-sm">
              <p><span className="text-gray-400">Mahasiswa:</span> {showEdit.mahasiswa?.nama_lengkap} ({showEdit.mahasiswa?.nim})</p>
              <p><span className="text-gray-400">Status:</span> {showEdit.status}</p>
              <p><span className="text-gray-400">Hash:</span> <code className="text-xs">{showEdit.hash_sha256.slice(0, 20)}...</code></p>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nomor Ijazah</label>
                <input type="text" value={editForm.nomor_ijazah}
                  onChange={e => setEditForm({ ...editForm, nomor_ijazah: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Catatan</label>
                <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEdit(null)}
                  className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
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
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">No. Ijazah</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Mahasiswa</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Status</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Hash</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Blockchain</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Tanggal</th>
                  <th className="text-center p-3 text-sm text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cert) => (
                  <tr key={cert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-sm font-mono">{cert.nomor_ijazah}</td>
                    <td className="p-3">
                      <p className="text-sm font-medium">{cert.mahasiswa?.nama_lengkap}</p>
                      <p className="text-xs text-gray-400">{cert.mahasiswa?.nim} &bull; {cert.mahasiswa?.prodi?.nama}</p>
                    </td>
                    <td className="p-3">{statusBadge(cert.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-gray-300 max-w-[120px] truncate block">{cert.hash_sha256}</code>
                        <button onClick={() => { navigator.clipboard.writeText(cert.hash_sha256); toast.success('Hash disalin!') }}
                          className="text-blue-400 hover:text-blue-300 shrink-0"><Copy className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="p-3">
                      {cert.blockchain_tx_hash ? (
                        <span className="flex items-center gap-1 text-xs text-green-400" title={cert.blockchain_tx_hash}>
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span className="font-mono truncate max-w-[100px] block">{cert.blockchain_tx_hash.slice(0, 10)}...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <XCircle className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-400">
                      {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('id-ID') : new Date(cert.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {cert.status === 'draft' && (
                          <>
                            <button onClick={() => openEdit(cert)} className="text-blue-400 hover:text-blue-300 transition-colors p-1" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handlePublish(cert.id)} className="text-green-400 hover:text-green-300 transition-colors p-1" title="Publikasi ke Blockchain">
                              <Globe className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {cert.status === 'issued' && (
                          <>
                            <button onClick={() => handleDownload(cert.id)} className="text-green-400 hover:text-green-300 transition-colors p-1" title="Download PDF">
                              <Download className="w-4 h-4" />
                            </button>
                            <a href={`/verify/${cert.hash_sha256}`} target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors p-1" title="Verifikasi Online">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        {(cert.status === 'draft' || cert.status === 'issued') && (
                          <button onClick={() => handleRevoke(cert.id)} className="text-red-400 hover:text-red-300 transition-colors p-1" title="Cabut">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400">Belum ada sertifikat</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {lastPage > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-gray-400">Halaman {page} dari {lastPage}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50 flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 glass rounded-lg text-sm hover:bg-white/10 transition-all disabled:opacity-50 flex items-center gap-1">
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
