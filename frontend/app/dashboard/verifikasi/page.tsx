'use client'

import { VerificationForm } from '@/components/verification/VerificationForm'
import { Shield } from 'lucide-react'

export default function VerifikasiDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verifikasi Ijazah</h1>
        <p className="text-gray-400 text-sm mt-1">Verifikasi keaslian ijazah melalui blockchain</p>
      </div>
      <VerificationForm />
    </div>
  )
}
