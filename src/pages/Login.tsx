import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function Login() {
  const { signInWithGoogle, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center p-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
            <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
          </div>
          <h1 className="text-2xl font-bold text-white">Contentstack E2E</h1>
        </div>
        <p className="text-[#a1a1aa]">Sign in to see the dashboard</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-xl p-8">
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          Welcome back
        </h2>
        <p className="text-[#a1a1aa] text-center text-sm mb-6">
          Sign in with your Contentstack Google account
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path
                    fill="#FFF"
                    d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#FFF"
                    d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09c1.97 3.92 6.02 6.62 10.71 6.62z"
                  />
                  <path
                    fill="#FFF"
                    d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29v-3.09h-3.98c-.82 1.62-1.29 3.44-1.29 5.38s.47 3.76 1.29 5.38l3.98-3.09z"
                  />
                  <path
                    fill="#FFF"
                    d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42c-2.07-1.94-4.78-3.13-8.02-3.13-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </g>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Privacy Notice */}
        <p className="mt-6 text-xs text-[#71717a] text-center leading-relaxed">
          By signing in, you agree that Contentstack may collect and use your
          corporate email and in-app usage data (page views, clicks, alert
          preferences) to power personalization, alerts, and product
          improvements. See our{' '}
          <a href="#" className="text-purple-400 hover:text-purple-300">
            Internal Privacy Notice
          </a>{' '}
          for details.
        </p>
      </div>
    </div>
  );
}

