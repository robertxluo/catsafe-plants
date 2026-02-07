'use client';

import { useState, FormEvent } from 'react';

import { ArrowLeft, Lock } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: (email: string) => void;
}

export function AdminLogin({ onBack, onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (email.trim() === 'robertxluo@gmail.com') {
      onLogin(email);
    } else {
      setError('Not allowlisted.');
    }
  }

  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 px-4 min-h-screen">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Back to Search</span>
        </button>

        <div className="bg-white shadow-sm p-8 border border-gray-200 rounded-xl">
          <div className="flex justify-center items-center mb-6">
            <div className="flex justify-center items-center bg-gray-100 rounded-full w-12 h-12">
              <Lock className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          <h1 className="mb-1 font-bold text-gray-900 text-xl text-center">Admin Login</h1>
          <p className="mb-6 text-gray-400 text-sm text-center">
            Only allowlisted accounts can access the admin panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block mb-1 font-medium text-gray-700 text-sm">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                aria-label="Admin email address"
                placeholder="you@example.com"
                className="px-4 py-2.5 border border-gray-300 focus:border-emerald-500 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 w-full text-gray-900 placeholder:text-gray-400 transition-all"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>

            {error && (
              <p className="font-medium text-rose-600 text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-lg w-full font-medium text-white transition-colors cursor-pointer"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
