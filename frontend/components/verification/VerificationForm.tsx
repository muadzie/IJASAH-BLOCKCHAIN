'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, XCircle, Loader2, Shield, Hash, ExternalLink, Globe } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io'

interface CertificateData {
  student_name: string
  nim: string
  diploma_number: string
  program_study: string
  graduation_year: string
  ipk?: string
  fakultas?: string
}

interface BlockchainInfo {
  network: string
  explorer_url: string | null
  tx_hash: string | null
  block_number: string | null
}

interface VerificationResult {
  valid: boolean
  hash?: string
  blockchain_verified?: boolean
  revoked?: boolean
  revoked_message?: string
  local_found?: boolean
  certificate_data?: CertificateData
  blockchain_info?: BlockchainInfo
}

function ResultCard({ result, hash }: { result: VerificationResult; hash?: string }) {
  const isRevoked = result.revoked
  const isValid = result.valid && !isRevoked
  const borderColor = isRevoked ? '#f59e0b' : isValid ? '#10b981' : '#ef4444'
  const bgColor = isRevoked ? 'rgba(245, 158, 11, 0.1)' : isValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-xl border-2"
      style={{ borderColor, backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-3 mb-4">
        {isRevoked ? (
          <XCircle className="w-8 h-8 text-yellow-400" />
        ) : isValid ? (
          <CheckCircle className="w-8 h-8 text-green-400" />
        ) : (
          <XCircle className="w-8 h-8 text-red-400" />
        )}
        <div>
          <h3 className="text-xl font-bold">
            {isRevoked ? 'IJAZAH REVOKED' : isValid ? 'Ijazah VALID' : 'Ijazah TIDAK VALID'}
          </h3>
          <p className="text-sm text-gray-400">
            {isRevoked
              ? 'Ijazah ini telah dicabut/direvoke di Sepolia Testnet'
              : isValid
                ? 'Ijazah terverifikasi di Sepolia Testnet'
                : 'Ijazah tidak ditemukan di Sepolia Testnet'}
          </p>
        </div>
      </div>

      {result.certificate_data && (
        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-400">Nama Mahasiswa</p>
            <p className="font-medium">{result.certificate_data.student_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">NIM</p>
            <p className="font-medium">{result.certificate_data.nim}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Program Studi</p>
            <p className="font-medium">{result.certificate_data.program_study || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fakultas</p>
            <p className="font-medium">{result.certificate_data.fakultas || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Nomor Ijazah</p>
            <p className="font-medium font-mono text-sm">{result.certificate_data.diploma_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Tahun Lulus</p>
            <p className="font-medium">{result.certificate_data.graduation_year}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">IPK</p>
            <p className="font-medium">{result.certificate_data.ipk || '-'}</p>
          </div>
        </div>
      )}

      {result.blockchain_info && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">Network:</span>
            <span className="font-medium text-green-400">{result.blockchain_info.network || 'Sepolia Testnet'}</span>
          </div>
          {result.blockchain_info.tx_hash && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">Tx Hash:</span>
              <code className="text-xs font-mono text-gray-300 truncate max-w-[200px]">{result.blockchain_info.tx_hash}</code>
              <a href={result.blockchain_info.explorer_url || '#'} target="_blank"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Sepolia Etherscan
              </a>
            </div>
          )}
        </div>
      )}

      {hash && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400">SHA-256 Hash</p>
          <p className="font-mono text-xs break-all text-gray-300">{hash}</p>
        </div>
      )}
    </motion.div>
  )
}

export function VerificationForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [hashInput, setHashInput] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'file' | 'hash'>('file')
  const cleanedHashInput = hashInput.trim().replace(/^0x/i, '')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (f?.type === 'application/pdf') {
      setFile(f); setResult(null)
    } else {
      toast.error('Hanya file PDF yang diperbolehkan')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, disabled: verificationMethod !== 'file'
  })

  const handleVerifyByFile = async () => {
    if (!file) { toast.error('Pilih file PDF'); return }
    setIsVerifying(true)
    const formData = new FormData()
    formData.append('certificate', file)
    try {
      const res = await axios.post(`${API_URL}/verify/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
      if (res.data.valid) {
        toast.success('Ijazah valid! Terverifikasi di Sepolia Testnet', { duration: 5000 })
      } else {
        toast.error(res.data.revoked ? 'Ijazah telah dicabut' : 'Ijazah tidak valid', { duration: 5000 })
      }
    } catch {
      toast.error('Gagal verifikasi')
    } finally { setIsVerifying(false) }
  }

  const handleVerifyByHash = async () => {
    if (cleanedHashInput.length !== 64) {
      toast.error('Hash harus 64 karakter hex')
      return
    }
    setIsVerifying(true)
    try {
      const res = await axios.post(`${API_URL}/verify/hash`, { hash: cleanedHashInput })
      setResult(res.data)
      if (res.data.valid) {
        toast.success('Hash valid! Terdaftar di Sepolia Testnet', { duration: 5000 })
      } else {
        toast.error(res.data.revoked ? 'Ijazah telah dicabut' : 'Hash tidak ditemukan', { duration: 5000 })
      }
    } catch {
      toast.error('Gagal verifikasi')
    } finally { setIsVerifying(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Sepolia Testnet Blockchain</span>
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-4">Verifikasi Keaslian Ijazah</h2>
          <p className="text-gray-300">
            Data diverifikasi langsung dari smart contract di <strong>Sepolia Testnet</strong>
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button onClick={() => setVerificationMethod('file')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${verificationMethod === 'file' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <Upload className="w-4 h-4" /> Upload File PDF
          </button>
          <button onClick={() => setVerificationMethod('hash')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${verificationMethod === 'hash' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            <Hash className="w-4 h-4" /> Masukkan Hash
          </button>
        </div>

        <AnimatePresence mode="wait">
          {verificationMethod === 'file' ? (
            <motion.div key="file" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-white/20 hover:border-blue-400/50'}`}>
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-400">Lepaskan file di sini...</p>
                ) : (
                  <>
                    <p className="text-gray-300 mb-2">Seret & letakkan file PDF ijazah</p>
                    <p className="text-sm text-gray-500">atau klik untuk pilih (PDF max 10MB)</p>
                  </>
                )}
              </div>
              {file && (
                <div className="mt-4 p-4 glass rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 text-sm">Hapus</button>
                </div>
              )}
              <button onClick={handleVerifyByFile} disabled={!file || isVerifying}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verifikasi via Sepolia'}
              </button>
            </motion.div>
          ) : (
            <motion.div key="hash" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <label className="block text-sm font-medium mb-2 text-gray-300">Hash SHA-256 Ijazah</label>
              <input type="text" value={hashInput} onChange={e => setHashInput(e.target.value)}
                placeholder="64 karakter hexadecimal..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm" />
              <p className="text-xs text-gray-500 mt-2">Hash akan diverifikasi ke smart contract di Sepolia Testnet</p>
              <button onClick={handleVerifyByHash}
                disabled={cleanedHashInput.length !== 64 || isVerifying}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verifikasi via Sepolia'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && <ResultCard result={result} hash={result.hash || cleanedHashInput} />}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
