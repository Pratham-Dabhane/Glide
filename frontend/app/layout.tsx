import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zapier Debugger & Monitor',
  description: 'Monitor and debug your Zapier workflows with real-time alerts',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white border-b border-gray-200">
            <SignedOut>
              <SignInButton>
                <button className="text-gray-600 hover:text-gray-800 font-medium text-sm">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-sm h-10 px-4 cursor-pointer transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </header>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}