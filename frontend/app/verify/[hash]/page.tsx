'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Shield, ExternalLink } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface CertificateData {
  student_name: string
  nim: string
  diploma_number: string
  program_study: string
  graduation_date: string
  ipk: string
  fakultas?: string
}

interface Result {
  valid: boolean
  blockchain_verified?: boolean
  local_found?: boolean
  certificate_data?: CertificateData
  details?: any
}

export default function VerifyByHashPage() {
  const params = useParams()
  const hash = params.hash as string
  const [result, setResult] = useState<Result | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyHash = async () => {
      if (!hash || hash.length !== 64) {
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.post(`${API_URL}/verify/hash`, { hash })
        setResult(response.data)
      } catch (error) {
        console.error('Verification failed:', error)
        setResult({ valid: false })
      } finally {
        setIsLoading(false)
      }
    }

    verifyHash()
  }, [hash])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Memverifikasi ijazah...</p>
        </div>
      </div>
    )
  }

  if (!hash || hash.length !== 64) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Hash Tidak Valid</h2>
          <p className="text-gray-400">Hash SHA-256 harus terdiri dari 64 karakter hexadecimal</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className={`glass-card p-8 ${result?.valid ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
              <Shield className={`w-4 h-4 ${result?.valid ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm font-medium">Blockchain Verification</span>
            </div>

            {result?.valid ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}

            <h1 className={`text-3xl font-bold mb-2 ${result?.valid ? 'text-green-400' : 'text-red-400'}`}>
              {result?.valid ? 'Ijazah VALID' : 'Ijazah TIDAK VALID'}
            </h1>
            <p className="text-gray-400">
              {result?.valid
                ? 'Ijazah ini terverifikasi dan terdaftar di blockchain'
                : 'Ijazah tidak ditemukan di blockchain atau telah dimanipulasi'}
            </p>
          </div>

          {result?.valid && result?.certificate_data && (
            <>
              <div className="border-t border-white/10 pt-6">
                <h2 className="text-lg font-semibold mb-4">Data Mahasiswa</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Nama Lengkap</p>
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
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-gray-400 mb-1">Hash SHA-256</p>
                <p className="font-mono text-xs break-all text-gray-300">{hash}</p>
              </div>
            </>
          )}

          {!result?.local_found && (
            <div className="mt-6 p-4 glass rounded-lg">
              <p className="text-sm text-yellow-400">
                Ijazah tidak ditemukan dalam database lokal. Verifikasi hanya berdasarkan blockchain.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
