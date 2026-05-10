'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export function NavBar() {
  const pathname = usePathname()

  if (pathname?.startsWith('/dashboard')) return null

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block">
              Ijazah <span className="text-gradient">Blockchain</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/verify" className="text-sm text-gray-300 hover:text-white transition-colors">
              Verifikasi
            </Link>
            <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium hover:shadow-lg transition-all">
              Masuk
            </Link>
          </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
    )
  }
