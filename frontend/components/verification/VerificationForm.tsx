'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, XCircle, Loader2, Scan, Shield, Hash } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface VerificationResult {
  valid: boolean
  hash?: string
  certificate_data?: {
    student_name: string
    nim: string
    diploma_number: string
    program_study: string
    graduation_date: string
    ipk: string
    fakultas?: string
  }
  blockchain_verified?: boolean
}

export function VerificationForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [hashInput, setHashInput] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'file' | 'hash'>('file')
  const cleanedHashInput = hashInput.trim().replace(/^0x/i, '')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile)
      setResult(null)
    } else {
      toast.error('Hanya file PDF yang diperbolehkan')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: verificationMethod !== 'file'
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  const handleVerifyByFile = async () => {
    if (!file) {
      toast.error('Silakan pilih file ijazah terlebih dahulu')
      return
    }

    setIsVerifying(true)
    const formData = new FormData()
    formData.append('certificate', file)

    try {
      const response = await axios.post(`${API_URL}/verify/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
      
      if (response.data.valid) {
        toast.success('✓ Ijazah valid! Terverifikasi di blockchain', { duration: 5000 })
      } else {
        toast.error('✗ Ijazah tidak valid atau tidak ditemukan di blockchain', { duration: 5000 })
      }
    } catch (error) {
      toast.error('Gagal memverifikasi ijazah')
      console.error(error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleVerifyByHash = async () => {
    if (!cleanedHashInput || cleanedHashInput.length !== 64) {
      toast.error('Hash harus terdiri dari 64 karakter hexadecimal')
      return
    }

    setIsVerifying(true)

    try {
      const response = await axios.post(`${API_URL}/verify/hash`, {
        hash: cleanedHashInput
      })
      setResult(response.data)
      
      if (response.data.valid) {
        toast.success('✓ Hash valid! Ijazah terdaftar di blockchain', { duration: 5000 })
      } else {
        toast.error('✗ Hash tidak valid atau tidak ditemukan', { duration: 5000 })
      }
    } catch (error) {
      toast.error('Gagal memverifikasi hash')
      console.error(error)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Blockchain Powered Verification</span>
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-4">
            Verifikasi Keaslian Ijazah
          </h2>
          <p className="text-gray-300">
            Unggah file ijazah atau masukkan hash SHA-256 untuk verifikasi instant
          </p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setVerificationMethod('file')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${
              verificationMethod === 'file'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File PDF
          </button>
          <button
            onClick={() => setVerificationMethod('hash')}
            className={`pb-3 px-4 font-medium transition-all flex items-center gap-2 ${
              verificationMethod === 'hash'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            Masukkan Hash
          </button>
        </div>

        <AnimatePresence mode="wait">
          {verificationMethod === 'file' ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-blue-400/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-400">Lepaskan file di sini...</p>
                ) : (
                  <>
                    <p className="text-gray-300 mb-2">
                      Seret & letakkan file ijazah di sini
                    </p>
                    <p className="text-sm text-gray-500">
                      atau klik untuk memilih file (PDF max 5MB)
                    </p>
                  </>
                )}
              </div>

              {file && (
                <div className="mt-4 p-4 glass rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              )}

              <button
                onClick={handleVerifyByFile}
                disabled={!file || isVerifying}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Verifikasi Ijazah'
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="hash"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Hash SHA-256 Ijazah
                </label>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="64 karakter hexadecimal..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Masukkan hash SHA-256 yang tertera pada ijazah digital
                </p>
              </div>

              <button
                onClick={handleVerifyByHash}
                disabled={!cleanedHashInput || isVerifying || cleanedHashInput.length !== 64}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Verifikasi Hash'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 rounded-xl border-2"
              style={{
                borderColor: result.valid ? '#10b981' : '#ef4444',
                backgroundColor: result.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                {result.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {result.valid ? 'Ijazah VALID' : 'Ijazah TIDAK VALID'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {result.valid 
                      ? 'Ijazah ini terdaftar di blockchain dan tidak pernah dimanipulasi' 
                      : 'Ijazah tidak ditemukan di blockchain atau telah dimanipulasi'}
                  </p>
                </div>
              </div>

              {result.valid && result.certificate_data && (
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
                    <p className="font-medium">{result.certificate_data.program_study}</p>
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
                    <p className="text-xs text-gray-400">Tanggal Lulus</p>
                    <p className="font-medium">{result.certificate_data.graduation_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">IPK</p>
                    <p className="font-medium">{result.certificate_data.ipk}</p>
                  </div>
                </div>
              )}

              {result.hash && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">Hash SHA-256</p>
                  <p className="font-mono text-xs break-all">{result.hash}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}