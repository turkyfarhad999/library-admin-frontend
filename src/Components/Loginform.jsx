 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenText, Mail, Lock, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError('Invalid email or password.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-sm bg-base-100 shadow-xl">
      <div className="card-body gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-xl bg-primary p-3 text-primary-content">
            <BookOpenText className="size-6" />
          </div>

          <h1 className="text-2xl font-bold">Admin sign in</h1>

          <p className="text-sm text-base-content/70">
            Sign in to manage books, members and loans.
          </p>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="alert alert-error alert-soft text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="form-control w-full">
            <span className="mb-1 block text-sm font-medium">Email</span>

            <span className="input w-full">
              <Mail className="size-4 opacity-60" />

              <input
                type="email"
                name="email"
                autoComplete="username"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </span>
          </label>

          <label className="form-control w-full">
            <span className="mb-1 block text-sm font-medium">Password</span>

            <span className="input w-full">
              <Lock className="size-4 opacity-60" />

              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="cursor-pointer opacity-60 hover:opacity-100"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </span>
          </label>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Signing in
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;