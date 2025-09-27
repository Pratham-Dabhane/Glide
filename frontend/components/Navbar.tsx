'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Settings } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Glide
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group inline-flex items-center border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton>
                <button className="text-gray-500 hover:text-blue-600 text-sm font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-10 px-4 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}