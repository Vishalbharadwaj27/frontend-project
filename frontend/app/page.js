'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Task Manager</h1>
        <div className="space-x-4">
          <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</a>
          <a href="/register" className="bg-green-500 text-white px-4 py-2 rounded">Register</a>
        </div>
      </div>
    </div>
  )
}