'use client'

import { VerificationForm } from '@/components/verification/VerificationForm'
import { motion } from 'framer-motion'

export default function VerifyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          Verifikasi <span className="text-gradient">Ijazah</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto px-4">
          Verifikasi keaslian ijazah Universitas Subang menggunakan teknologi blockchain.
          Cukup unggah file PDF atau masukkan hash SHA-256.
        </p>
      </motion.div>
      <VerificationForm />
    </div>
  )
}
