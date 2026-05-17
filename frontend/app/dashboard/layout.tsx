'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, FileText, Shield, Settings, LogOut, Menu, X,
  GraduationCap, Search, ClipboardCheck, UserCog, UserCircle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface User {
  id: string; name: string; email: string; role: string
}

interface NavItem {
  href: string; label: string; icon: any; roles?: string[]
}

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/mahasiswa', label: 'Mahasiswa', icon: Users, roles: ['super_admin', 'admin_akademik'] },
  { href: '/dashboard/sertifikat', label: 'Sertifikat', icon: FileText, roles: ['super_admin', 'admin_akademik'] },
  { href: '/dashboard/verifikasi', label: 'Verifikasi', icon: Shield },
  { href: '/dashboard/riwayat', label: 'Riwayat Verifikasi', icon: ClipboardCheck, roles: ['verifikator', 'super_admin', 'admin_akademik'] },
  { href: '/dashboard/profile', label: 'Profil', icon: UserCircle },
  { href: '/dashboard/admin', label: 'Admin', icon: Settings, roles: ['super_admin'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); setIsLoading(false) } catch {}
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`)
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try { await axios.post(`${API_URL}/auth/logout`) } catch {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
    toast.success('Berhasil logout')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(user.role))

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-500/20 text-red-400',
      admin_akademik: 'bg-blue-500/20 text-blue-400',
      mahasiswa: 'bg-green-500/20 text-green-400',
      verifikator: 'bg-purple-500/20 text-purple-400',
    }
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin_akademik: 'Admin Akademik',
      mahasiswa: 'Mahasiswa',
      verifikator: 'Verifikator',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${styles[role] || 'bg-gray-500/20 text-gray-400'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <UserCog className="w-5 h-5 text-red-400" />
      case 'admin_akademik': return <GraduationCap className="w-5 h-5 text-blue-400" />
      case 'mahasiswa': return <GraduationCap className="w-5 h-5 text-green-400" />
      case 'verifikator': return <Search className="w-5 h-5 text-purple-400" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#0d0d2b] border-r border-white/10 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-sm">Ijazah Blockchain</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <div className="mt-0.5">{roleBadge(user.role)}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl flex items-center px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white mr-4">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            {roleIcon(user.role)}
            <span className="text-sm text-gray-400">Universitas Subang</span>
          </div>
          <div className="flex-1" />
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Kembali ke Beranda
          </Link>
        </header>
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
