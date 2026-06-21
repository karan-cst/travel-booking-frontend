'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidationSchema } from '@/validations/auth';
import { postReq } from '@/services/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, hydrateAuth } from '@/store/slices/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // If already logged in, redirect away to the source page or default dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const dest = searchParams.get('redirectTo');
      if (dest) {
        router.push(dest);
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/packages');
      }
    }
  }, [isAuthenticated, role, router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    setApiError('');
    try {
      const response = await postReq('/auth/login', data);
      if (response?.status === 'success' && response?.data) {
        dispatch(setCredentials(response.data));
      } else {
        setApiError('Invalid credentials or response structure.');
      }
    } catch (err) {
      setApiError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md shadow-orange-100">
            RS
          </div>
          <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight font-serif-elegant">
            Welcome back
          </h2>
          <p className="mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Sign in to your travel dashboard
          </p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50/50 text-red-700 rounded-2xl text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{apiError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-2xl text-xs font-bold focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50/10'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 pl-0.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`block w-full pl-11 pr-11 py-3 border rounded-2xl text-xs font-bold focus:outline-none transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50/10'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-xs font-bold uppercase tracking-wider rounded-2xl text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-md shadow-orange-100 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sign In
            </button>
          </div>
        </form>

        <div className="text-center pt-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            For testing, run <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 lowercase font-mono font-normal">npm run seed</code> in backend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
