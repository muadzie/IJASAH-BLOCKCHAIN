'use client'

import { motion } from 'framer-motion'
import { Shield, Globe, Lock, Zap, TrendingUp, Users, CheckCircle, ArrowRight, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { VerificationForm } from '@/components/verification/VerificationForm'

export default function Home() {
  const [stats, setStats] = useState({
    total_alumni: 0,
    total_certificates: 0,
    total_verifications: 0,
    valid_percentage: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/verify/stats`)
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Anti Palsu',
      description: 'Teknologi blockchain memastikan ijazah tidak dapat dipalsukan atau dimanipulasi'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Verifikasi Global',
      description: 'Verifikasi keaslian ijazah dari mana saja, kapan saja secara real-time'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Immutable Record',
      description: 'Data ijazah tersimpan permanen dan tidak bisa diubah di blockchain'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Verifikasi Instant',
      description: 'Proses verifikasi cepat menggunakan hash SHA-256 dan smart contract'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Blockchain Security Active</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Ijazah Digital</span>
              <br />
              Berbasis Blockchain
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Universitas Subang menghadirkan sistem verifikasi ijazah digital 
              dengan teknologi blockchain yang aman, transparan, dan anti-palsu.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/verify"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium hover:shadow-lg transition-all inline-flex items-center gap-2 group"
              >
                Verifikasi Ijazah
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 glass rounded-full font-medium hover:bg-white/10 transition-all inline-flex items-center gap-2"
              >
                Dashboard Alumni
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center"
          >
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold">{stats.total_alumni}</div>
            <div className="text-sm text-gray-400">Total Alumni</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 text-center"
          >
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-2xl font-bold">{stats.total_certificates}</div>
            <div className="text-sm text-gray-400">Ijazah Terbit</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 text-center"
          >
            <QrCode className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold">{stats.total_verifications}</div>
            <div className="text-sm text-gray-400">Total Verifikasi</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 text-center"
          >
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold">{stats.valid_percentage}%</div>
            <div className="text-sm text-gray-400">Tingkat Validitas</div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Keunggulan <span className="text-gradient">Teknologi Blockchain</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Sistem kami menggunakan teknologi blockchain Ethereum untuk menjamin 
              keaslian dan keamanan setiap ijazah yang diterbitkan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center group hover:scale-105 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center text-blue-400 group-hover:text-purple-400 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Coba <span className="text-gradient">Verifikasi Sekarang</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Unggah file ijazah untuk verifikasi keaslian secara instan
            </p>
          </div>
          
          <VerificationForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap untuk Transformasi Digital?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan alumni Universitas Subang yang telah 
                memiliki ijazah digital terverifikasi blockchain
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-medium hover:shadow-lg transition-all"
              >
                Akses Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}