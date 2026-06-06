'use client';

import Image from 'next/image';
import { adminApi } from '@/lib/api';
import { branding, isExternal } from '@/lib/branding';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.login(email, password);
      localStorage.setItem('token', res.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="flex flex-col items-center gap-2">
            {/* Show secondary logo on the login screen so placements differ from the admin shell */}
            <span className="inline-flex items-center rounded-lg bg-white px-4 py-3 shadow-lg">
              <Image
                src={branding.logoSecondary}
                alt={`${branding.siteName} logo`}
                width={180}
                height={54}
                priority
                unoptimized={isExternal(branding.logoSecondary)}
                className="h-12 w-auto"
              />
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Admin Portal</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h1 className="mb-1 text-xl font-bold text-slate-800">Sign in</h1>
          <p className="mb-6 text-sm text-slate-500">Enter your administrator credentials to continue.</p>

          <form onSubmit={onSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-email"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-[var(--admin-accent)] focus:outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-[var(--admin-accent)] focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--admin-accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-600">
          Contact your system administrator if you need access.
        </p>
      </div>
    </div>
  );
}
