'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const PUBLIC_PATHS = ['/login', '/register']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const skipCheck = isPublic(pathname)

  useEffect(() => {
    if (skipCheck) return
    if (!localStorage.getItem('token')) {
      router.replace('/login')
    }
  }, [skipCheck, router])

  return <>{children}</>
}
