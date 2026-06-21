'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginValidationSchema } from '@/validations/auth';
import { postReq } from '@/services/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, hydrateAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // If already logged in, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/packages');
      }
    }
  }, [isAuthenticated, role, router]);

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
        // Redirection will be handled by the useEffect above
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
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-blue-200">
            RS
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access your RoamSync travel bookings
          </p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-11 pr-4 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`block w-full pl-11 pr-11 py-3 border rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-200/50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Sign In
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            For local testing, run <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">npm run seed</code> in backend folder for credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
