'use client'
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import AddContent from './AddContent';
import { useAuth } from '@/contexts/AuthContext';

export default function AddPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading, don't do anything
    
    if (status === 'unauthenticated') {
      // Redirect to sign in with the current page as callback
      signIn('google', { callbackUrl: window.location.href });
      return;
    }
  }, [status, router]);

  // Show loading state for loading or unauthenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {status === 'loading' ? 'Checking authentication...' : 'Redirecting to login...'}
          </p>
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
