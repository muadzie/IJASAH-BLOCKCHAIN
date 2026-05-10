'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen, Target, Award, Loader2,
  GraduationCap, Shield, CheckCircle, XCircle, ExternalLink, Copy, Download,
  ArrowLeft, Edit, FileText, Globe
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export default function MahasiswaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/mahasiswa/${params.id}`)
        setData(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-400">Mahasiswa tidak ditemukan</div>
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      lulus: 'bg-green-500/20 text-green-400 border-green-500/30',
      aktif: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      dropout: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    )
  }

  const certStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      issued: 'text-green-400',
      draft: 'text-yellow-400',
      revoked: 'text-red-400',
    }
    return <span className={`text-sm font-medium ${styles[status] || 'text-gray-400'}`}>{status}</span>
  }

  const InfoCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex items-center gap-3 p-3 glass rounded-lg">
      <div className={`p-2 rounded-lg ${color || 'bg-blue-500/20'}`}>
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value || '-'}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold shrink-0">
            {data.nama_lengkap?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{data.nama_lengkap}</h1>
                <p className="text-gray-400 font-mono text-sm mt-0.5">{data.nim}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(data.status)}
                <Link
                  href={`/dashboard/mahasiswa?id=${data.id}`}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">{data.prodi?.nama} ({data.prodi?.jenjang})</span>
              <span className="text-xs text-gray-500">&bull;</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">{data.prodi?.fakultas?.nama}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoCard icon={Mail} label="Email" value={data.email} color="bg-blue-500/20" />
          <InfoCard icon={Phone} label="No. HP" value={data.no_hp} color="bg-green-500/20" />
          <InfoCard icon={MapPin} label="Tempat Lahir" value={data.tempat_lahir} color="bg-orange-500/20" />
          <InfoCard icon={Calendar} label="Tanggal Lahir" value={data.tanggal_lahir} color="bg-purple-500/20" />
          <InfoCard icon={Calendar} label="Tahun Masuk" value={data.tahun_masuk} color="bg-cyan-500/20" />
          <InfoCard icon={Award} label="Tahun Lulus" value={data.tahun_lulus || 'Belum lulus'} color="bg-yellow-500/20" />
          <InfoCard icon={Target} label="IPK" value={data.ipk ? Number(data.ipk).toFixed(2) : '-'} color="bg-pink-500/20" />
          <InfoCard icon={User} label="Jenis Kelamin" value={data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : '-'} color="bg-indigo-500/20" />
        </div>

        {data.judul_skripsi && (
          <div className="mt-4 p-3 glass rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400">Judul Skripsi</p>
            </div>
            <p className="text-sm">{data.judul_skripsi}</p>
          </div>
        )}
      </motion.div>

      {/* Certificate Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card p-6 border ${data.ijazah?.status === 'issued' ? 'border-green-500/20' : data.ijazah ? 'border-yellow-500/20' : 'border-white/5'}`}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Ijazah Digital
        </h2>

        {data.ijazah ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Nomor Ijazah</p>
                <p className="font-medium font-mono text-sm">{data.ijazah.nomor_ijazah}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p className="flex items-center gap-1.5">
                  {data.ijazah.status === 'issued' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : data.ijazah.status === 'revoked' ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-yellow-400" />
                  )}
                  {certStatusBadge(data.ijazah.status)}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400">Hash SHA-256</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-300 break-all">{data.ijazah.hash_sha256}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(data.ijazah.hash_sha256); toast.success('Hash disalin!') }}
                    className="text-blue-400 hover:text-blue-300 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {data.ijazah.blockchain_tx_hash && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-400">Blockchain Transaction</p>
                  <code className="text-xs font-mono text-gray-500 break-all">{data.ijazah.blockchain_tx_hash}</code>
                </div>
              )}
              {data.ijazah.issued_at && (
                <div>
                  <p className="text-xs text-gray-400">Tanggal Terbit</p>
                  <p className="text-sm">{new Date(data.ijazah.issued_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>

            {data.ijazah.status === 'issued' && (
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/verify/${data.ijazah.hash_sha256}`}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Verifikasi Online
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.get(`${API_URL}/certificates/${data.ijazah.id}/download`, { responseType: 'blob' })
                      const url = URL.createObjectURL(new Blob([res.data]))
                      const a = document.createElement('a')
                      a.href = url; a.download = `Ijazah_${data.nim}.pdf`
                      a.click(); URL.revokeObjectURL(url)
                      toast.success('Download berhasil')
                    } catch { toast.error('Gagal download') }
                  }}
                  className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <XCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Mahasiswa ini belum memiliki ijazah digital</p>
            <Link
              href={`/dashboard/sertifikat?mahasiswa_id=${data.id}`}
              className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Buat Sertifikat
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
