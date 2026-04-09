import { useState } from 'react';
import { authApi } from '@/lib/api';

interface MagicLinkFormProps {
  onSent?: () => void;
}

export function MagicLinkForm({ onSent }: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      await authApi.sendMagicLink(email);
      setStatus('sent');
      onSent?.();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a magic link to <span className="font-medium text-gray-700">{email}</span>.
            Click the link to sign in.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">MarketFlow</h1>
          <p className="text-gray-500 text-sm">Sign in with a magic link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={status === 'loading'}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          No password needed. We&apos;ll email you a sign-in link.
        </p>
      </div>
    </div>
  );
}
