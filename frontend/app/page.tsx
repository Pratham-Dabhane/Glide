import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Removed demo banner for production */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Glide</h1>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/sign-in" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-8" style={{ color: '#111827' }}>
              Glide — Debug. Monitor. Automate.
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto" style={{ color: '#6B7280' }}>
              Smooth workflows, smarter automation. Real-time monitoring and alerts for your automation stack.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/demo"
                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
              >
                View Demo
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border" style={{ borderColor: '#E5E7EB' }}>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-gray-600">Continuous monitoring of all your workflows with 5-minute check intervals</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border" style={{ borderColor: '#E5E7EB' }}>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
                <p className="text-gray-600">Get notified immediately via Slack and email when workflows fail</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm border" style={{ borderColor: '#E5E7EB' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
                <p className="text-gray-600">Track success rates, error patterns, and workflow performance over time</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-200 py-8">
          <div className="text-center text-gray-500">
            <p>© 2025 Glide. Built with Next.js, Node.js, and Supabase.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}