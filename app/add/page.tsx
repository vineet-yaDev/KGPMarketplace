'use client'

import { Suspense } from 'react';
import { useEffect } from 'react';
import { signIn } from 'next-auth/react';
import AddContent from './AddContent';
import { useAuth } from '@/contexts/AuthContext';

export default function AddPage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      signIn('google', { callbackUrl: '/add' });
    }
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your listing data...</p>
        </div>
      </div>
    }>
      <AddContent />
    </Suspense>
  );
}
