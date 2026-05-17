'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Shield, ExternalLink, Globe } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface CertificateData {
  student_name: string
  nim: string
  diploma_number: string
  program_study: string
  graduation_year: string
  ipk?: string
  fakultas?: string
}

interface Result {
  valid: boolean
  blockchain_verified?: boolean
  local_found?: boolean
  revoked?: boolean
  revoked_message?: string
  certificate_data?: CertificateData
  blockchain_info?: {
    network: string
    explorer_url: string | null
    tx_hash: string | null
    block_number: string | null
  }
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
      } catch {
        setResult({ valid: false, blockchain_verified: false })
      } finally { setIsLoading(false) }
    }
    verifyHash()
  }, [hash])

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Memverifikasi di Sepolia Testnet...</p>
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
          <p className="text-gray-400">Hash SHA-256 harus 64 karakter hexadecimal</p>
        </div>
      </div>
    )
  }

  const isRevoked = result?.revoked
  const isValid = result?.valid && !isRevoked

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className={`glass-card p-8 ${isRevoked ? 'border-yellow-500/30' : isValid ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-4">
              <Globe className={`w-4 h-4 ${isValid ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm font-medium">Sepolia Testnet</span>
            </div>

            {isRevoked ? (
              <XCircle className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            ) : isValid ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}

            <h1 className={`text-3xl font-bold mb-2 ${isRevoked ? 'text-yellow-400' : isValid ? 'text-green-400' : 'text-red-400'}`}>
              {isRevoked ? 'Ijazah REVOKED' : isValid ? 'Ijazah VALID' : 'Ijazah TIDAK VALID'}
            </h1>
            <p className="text-gray-400">
              {isRevoked
                ? 'Ijazah ini telah dicabut di Sepolia Testnet'
                : isValid
                  ? 'Ijazah terverifikasi di Sepolia Testnet'
                  : 'Ijazah tidak ditemukan di Sepolia Testnet'}
            </p>
          </div>

          {isValid && result?.certificate_data && (
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
              </div>
            </>
          )}

          {result?.blockchain_info && (
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Network:</span>
                <span className="text-green-400 font-medium">{result.blockchain_info.network || 'Sepolia Testnet'}</span>
              </div>
              {result.blockchain_info.tx_hash && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400">Tx Hash:</span>
                  <code className="text-xs font-mono text-gray-300 truncate max-w-[200px]">{result.blockchain_info.tx_hash}</code>
                  <a href={result.blockchain_info.explorer_url || '#'} target="_blank"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 whitespace-nowrap">
                    <ExternalLink className="w-3 h-3" /> Etherscan
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-xs text-gray-400 mb-1">SHA-256 Hash</p>
            <p className="font-mono text-xs break-all text-gray-300">{hash}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
