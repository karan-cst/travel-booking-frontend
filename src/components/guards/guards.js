'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hydrateAuth } from '@/store/slices/authSlice';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function AuthGuard({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Hydrate state from localStorage
    dispatch(hydrateAuth());
    setChecking(false);
  }, [dispatch]);

  useEffect(() => {
    if (!checking) {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!isAuthenticated && !storedToken) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, checking, router]);

  if (checking || (!isAuthenticated && (typeof window !== 'undefined' ? localStorage.getItem('token') : null))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export function RoleGuard({ children, allowedRoles = [] }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { role, isAuthenticated } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    dispatch(hydrateAuth());
    setChecking(false);
  }, [dispatch]);

  useEffect(() => {
    if (!checking) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (rolesArray.length > 0 && !rolesArray.includes(role)) {
        router.push('/packages'); // Redirect forbidden users to packages search listing
      }
    }
  }, [role, isAuthenticated, checking, allowedRoles, router]);

  if (checking || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasAccess = rolesArray.length === 0 || rolesArray.includes(role);

  return hasAccess ? children : null;
}
