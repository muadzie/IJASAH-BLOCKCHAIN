'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText, Download, Loader2, Globe, Plus, XCircle, CheckCircle,
  Search, ChevronLeft, ChevronRight, ExternalLink, Copy, Upload,
  Wallet, AlertTriangle, Shield, ExternalLink as LinkIcon, Server
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useWallet } from '@/hooks/useWallet'
import { useDropzone } from 'react-dropzone'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io'

interface Certificate {
  id: string; nomor_ijazah: string; hash_sha256: string; pdf_hash: string | null
  status: string; blockchain_tx_hash: string | null; blockchain_block: string | null
  issued_at: string | null; created_at: string; notes: string | null; file_path: string | null
  blockchain_explorer_url: string | null
  mahasiswa: { id: string; nim: string; nama_lengkap: string; prodi: { nama: string } } | null
}

export default function SertifikatPage() {
  const { wallet, connect, switchToSepolia, isLoading: walletLoading } = useWallet()
  const [data, setData] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [blockchainStats, setBlockchainStats] = useState<any>(null)

  // Upload form
  const [file, setFile] = useState<File | null>(null)
  const [nim, setNim] = useState('')
  const [nama, setNama] = useState('')
  const [nomorIjazah, setNomorIjazah] = useState('')
  const [tahunLulus, setTahunLulus] = useState(new Date().getFullYear().toString())
  const [prodi, setProdi] = useState('')
  const [ipk, setIpk] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const searchParams = useSearchParams()
  const mahasiswaId = searchParams.get('mahasiswa_id')

  useEffect(() => {
    if (!mahasiswaId) return
    setShowUpload(true)
    axios.get(`${API_URL}/mahasiswa/${mahasiswaId}`).then(res => {
      const m = res.data
      setNim(m.nim || '')
      setNama(m.nama_lengkap || '')
      setTahunLulus(m.tahun_lulus || new Date().getFullYear().toString())
      setProdi(m.prodi?.nama || '')
      setIpk(m.ipk ? Number(m.ipk).toFixed(2) : '')
      if (m.ijazah?.nomor_ijazah) {
        setNomorIjazah(m.ijazah.nomor_ijazah)
      } else {
        const year = new Date().getFullYear()
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        setNomorIjazah(`UNSUB/${m.prodi?.kode || 'XX'}/${year}/${random}`)
      }
    }).catch(() => toast.error('Gagal mengambil data mahasiswa'))
  }, [mahasiswaId])

  const fetchCertificates = async () => {
    try {
      const params: any = { page, per_page: 15 }
      if (search) params.search = search
      const response = await axios.get(`${API_URL}/ijazah`, { params })
      setData(response.data.data || [])
      setLastPage(response.data.last_page || 1)
    } catch {} finally { setIsLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/ijazah/blockchain/stats`)
      setBlockchainStats(res.data)
    } catch {}
  }

  useEffect(() => { fetchCertificates() }, [page, search])
  useEffect(() => { fetchStats() }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (f?.type === 'application/pdf') {
      setFile(f)
    } else {
      toast.error('Hanya file PDF yang diperbolehkan')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, disabled: !showUpload
  })

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { toast.error('Pilih file PDF'); return }
    if (!nim || !nama || !nomorIjazah) { toast.error('Isi NIM, Nama, dan Nomor Ijazah'); return }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('nim', nim)
    formData.append('nama', nama)
    formData.append('nomor_ijazah', nomorIjazah)
    formData.append('tahun_lulus', tahunLulus)
    formData.append('prodi', prodi)
    if (ipk) formData.append('ipk', ipk)

    try {
      const res = await axios.post(`${API_URL}/ijazah/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data.success) {
        toast.success('Ijazah berhasil diupload & disimpan ke Sepolia!')
        setShowUpload(false)
        setFile(null)
        setNim(''); setNama(''); setNomorIjazah(''); setProdi(''); setIpk('')
        fetchCertificates()
        fetchStats()
      } else {
        toast.error(res.data.blockchain_error || 'Gagal simpan ke blockchain')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[Object.keys(err.response?.data?.errors || {})[0]]?.[0] || 'Upload gagal'
      toast.error(msg)
    } finally { setIsUploading(false) }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Yakin ingin mencabut ijazah ini? Data akan diupdate di Sepolia Testnet.')) return
    try {
      await axios.post(`${API_URL}/ijazah/${id}/revoke`)
      toast.success('Ijazah berhasil dicabut di Sepolia')
      fetchCertificates()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mencabut')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/ijazah/${id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `ijazah-${id}.pdf`; a.click(); URL.revokeObjectURL(url)
      toast.success('Download berhasil')
    } catch { toast.error('Gagal download') }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-yellow-500/20 text-yellow-400',
      issued: 'bg-green-500/20 text-green-400',
      revoked: 'bg-red-500/20 text-red-400',
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Ijazah</h1>
          <p className="text-gray-400 text-sm mt-1">Upload file PDF ijazah & simpan hash ke Sepolia Testnet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Ijazah
          </button>
        </div>
      </div>

      {/* Wallet Status */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Wallet className={`w-5 h-5 ${wallet.isConnected ? 'text-green-400' : 'text-gray-400'}`} />
            <div>
              <p className="text-sm font-medium">Sepolia Testnet Wallet</p>
              <p className="text-xs text-gray-400">
                {wallet.isConnected
                  ? `${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)} | Balance: ${Number(wallet.balance).toFixed(4)} ETH`
                  : 'Belum terhubung'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!wallet.isConnected ? (
              <button onClick={connect} disabled={walletLoading}
                className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-all flex items-center gap-1.5">
                {walletLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
                Connect MetaMask
              </button>
            ) : !wallet.isCorrectNetwork ? (
              <button onClick={switchToSepolia}
                className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-600/30 transition-all flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Switch to Sepolia
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-xs flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> Sepolia Testnet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Stats */}
      {blockchainStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card p-3 text-center">
            <Server className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{blockchainStats.stats?.total_uploaded || 0}</p>
            <p className="text-xs text-gray-400">Total Upload</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Globe className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{blockchainStats.stats?.total_on_chain || 0}</p>
            <p className="text-xs text-gray-400">On Sepolia</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Wallet className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{Number(blockchainStats.wallet?.balance_eth || 0).toFixed(4)}</p>
            <p className="text-xs text-gray-400">SepoliaETH</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Shield className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold">{blockchainStats.stats?.total_verifications || 0}</p>
            <p className="text-xs text-gray-400">Verifikasi</p>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari NIM, nama, nomor ijazah, hash..."
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-sm" />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" /> Upload Ijazah ke Sepolia
              </h3>
              <button onClick={() => { setShowUpload(false); setFile(null) }} className="text-gray-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>

            {!wallet.isConnected ? (
              <div className="p-6 text-center">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-4">Hubungkan wallet MetaMask ke Sepolia Testnet untuk upload</p>
                <button onClick={connect} disabled={walletLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  {walletLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null} Connect MetaMask
                </button>
                <p className="text-xs text-gray-500 mt-3">Butuh SepoliaETH gratis? Dapatkan dari <a href="https://sepoliafaucet.com" target="_blank" className="text-blue-400">sepoliafaucet.com</a></p>
              </div>
            ) : !wallet.isCorrectNetwork ? (
              <div className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-4">Switch network ke Sepolia Testnet</p>
                <button onClick={switchToSepolia}
                  className="px-6 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-600/30 transition-all">Switch to Sepolia</button>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-white/20 hover:border-blue-400/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  {file ? (
                    <div>
                      <p className="text-sm text-green-400">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-300">Seret file PDF ijazah atau klik untuk pilih</p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">NIM *</label>
                    <input type="text" value={nim} onChange={e => setNim(e.target.value)} required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Nama Lengkap *</label>
                    <input type="text" value={nama} onChange={e => setNama(e.target.value)} required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Nomor Ijazah *</label>
                    <input type="text" value={nomorIjazah} onChange={e => setNomorIjazah(e.target.value)} required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-300 mb-1">Tahun Lulus *</label>
                    <input type="number" min="1950" max="2099" value={tahunLulus} onChange={e => setTahunLulus(e.target.value)} required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-300 mb-1">Program Studi</label>
                    <input type="text" value={prodi} onChange={e => setProdi(e.target.value)}
                      placeholder="Contoh: Teknik Informatika"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-300 mb-1">IPK</label>
                    <input type="number" step="0.01" min="0" max="4" value={ipk} onChange={e => setIpk(e.target.value)}
                      placeholder="Contoh: 3.75"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Hash SHA-256 akan dikirim ke smart contract di <strong>Sepolia Testnet</strong>
                </p>

                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => { setShowUpload(false); setFile(null) }}
                    className="px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition-all">Batal</button>
                  <button type="submit" disabled={isUploading || !file}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    {isUploading ? 'Menyimpan ke Sepolia...' : 'Upload & Simpan ke Sepolia'}
                  </button>
                </div>
              </form>
            )}
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
                  <th className="text-left p-3 text-sm text-gray-400 font-medium">Sepolia Tx</th>
                  <th className="text-center p-3 text-sm text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cert) => (
                  <tr key={cert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-sm font-mono">{cert.nomor_ijazah}</td>
                    <td className="p-3">
                      <p className="text-sm font-medium">{cert.mahasiswa?.nama_lengkap || '-'}</p>
                      <p className="text-xs text-gray-400">{cert.mahasiswa?.nim || '-'}</p>
                    </td>
                    <td className="p-3">{statusBadge(cert.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <code className="text-xs font-mono text-gray-300 max-w-[100px] truncate block">{cert.hash_sha256}</code>
                        <button onClick={() => { navigator.clipboard.writeText(cert.hash_sha256); toast.success('Hash disalin!') }}
                          className="text-blue-400 hover:text-blue-300 shrink-0"><Copy className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="p-3">
                      {cert.blockchain_tx_hash ? (
                        <a href={cert.blockchain_explorer_url || `${SEPOLIA_EXPLORER}/tx/${cert.blockchain_tx_hash}`}
                          target="_blank" className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300">
                          <CheckCircle className="w-3 h-3 shrink-0" />
                          <span className="font-mono truncate max-w-[80px] block">{cert.blockchain_tx_hash.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <XCircle className="w-3 h-3" /> Belum
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {cert.status === 'issued' && (
                          <>
                            <button onClick={() => handleDownload(cert.id)}
                              className="text-green-400 hover:text-green-300 transition-colors p-1" title="Download PDF">
                              <Download className="w-4 h-4" />
                            </button>
                            <a href={`/verify/${cert.hash_sha256}`} target="_blank"
                              className="text-blue-400 hover:text-blue-300 transition-colors p-1" title="Verifikasi">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        {(cert.status === 'draft' || cert.status === 'issued') && (
                          <button onClick={() => handleRevoke(cert.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1" title="Revoke di Sepolia">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">Belum ada ijazah terupload</td></tr>
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
