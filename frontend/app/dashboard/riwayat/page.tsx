'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle, XCircle, Loader2, Search, ChevronLeft, ChevronRight,
  Clock, Filter, FileText, Hash, Camera
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface Log {
  id: string; certificate_hash: string; verification_method: string
  is_valid: boolean; created_at: string; ip_address: string
  ijazah: { id: string; nomor_ijazah: string; mahasiswa: { nama_lengkap: string; nim: string } } | null
}

export default function RiwayatVerifikasiPage() {
  const [data, setData] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterMethod, setFilterMethod] = useState('')
  const [filterValid, setFilterValid] = useState('')
  const [todayStats, setTodayStats] = useState<any>(null)

  const fetchLogs = async () => {
    try {
      const params: any = { page, per_page: 20 }
      if (search) params.search = search
      if (filterMethod) params.method = filterMethod
      if (filterValid !== '') params.valid = filterValid
      const res = await axios.get(`${API_URL}/verification-logs`, { params })
      setData(res.data.data || [])
      setLastPage(res.data.last_page || 1)
      setTotal(res.data.total || 0)
    } catch {} finally { setIsLoading(false) }
  }

  const fetchTodayStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/verification-logs/today`)
      setTodayStats(res.data)
    } catch {}
  }

  useEffect(() => { fetchLogs() }, [page, search, filterMethod, filterValid])
  useEffect(() => { fetchTodayStats() }, [])

  const methodIcon = (method: string) => {
    switch (method) {
      case 'hash': return <Hash className="w-3 h-3" />
      case 'file_upload': return <FileText className="w-3 h-3" />
      case 'qr_code': return <Camera className="w-3 h-3" />
      default: return <Shield className="w-3 h-3" />
    }
  }

  const methodLabel = (method: string) => {
    switch (method) {
      case 'hash': return 'Hash'
      case 'file_upload': return 'File PDF'
      case 'qr_code': return 'QR Code'
      default: return method
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Verifikasi</h1>
        <p className="text-gray-400 text-sm mt-1">Catatan seluruh aktivitas verifikasi ijazah</p>
      </div>

      {todayStats && (
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Verifikasi Hari Ini', value: todayStats.total, color: 'bg-blue-500/20 text-blue-400', icon: Clock },
            { label: 'Valid', value: todayStats.valid, color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
            { label: 'Tidak Valid', value: todayStats.invalid, color: 'bg-red-500/20 text-red-400', icon: XCircle },
            { label: 'Via Hash', value: todayStats.by_method?.hash || 0, color: 'bg-purple-500/20 text-purple-400', icon: Hash },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${s.color}`}><s.icon className="w-4 h-4" /></div>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari hash, nama, NIM..." className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
        </div>
        <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          <option value="">Semua Metode</option>
          <option value="hash">Hash</option>
          <option value="file_upload">File PDF</option>
          <option value="qr_code">QR Code</option>
        </select>
        <select value={filterValid} onChange={e => { setFilterValid(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400">
          <option value="">Semua Status</option>
          <option value="1">Valid</option>
          <option value="0">Tidak Valid</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Waktu</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Mahasiswa</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Metode</th>
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Hash</th>
                  <th className="text-center p-3 text-sm text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(log => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-sm text-gray-300">
                      <p>{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
                      <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString('id-ID')}</p>
                    </td>
                    <td className="p-3 text-sm">
                      {log.ijazah ? (
                        <Link href={`/dashboard/mahasiswa/${log.ijazah.mahasiswa?.nim || '#'}`} className="hover:text-blue-400 transition-colors">
                          <p className="font-medium">{log.ijazah.mahasiswa?.nama_lengkap || '-'}</p>
                          <p className="text-xs text-gray-500">{log.ijazah.mahasiswa?.nim || '-'}</p>
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        {methodIcon(log.verification_method)}
                        {methodLabel(log.verification_method)}
                      </span>
                    </td>
                    <td className="p-3">
                      <code className="text-xs font-mono text-gray-500 max-w-[120px] truncate block">{log.certificate_hash}</code>
                    </td>
                    <td className="p-3 text-center">
                      {log.is_valid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada riwayat verifikasi</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {lastPage > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-gray-400">Total {total} &bull; Hal {page}/{lastPage}</p>
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
