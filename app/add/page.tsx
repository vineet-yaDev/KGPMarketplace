import { Suspense } from 'react';
import AddContent from './AddContent';
export default function AddPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading your listing data...</div>}>
      <AddContent />
    </Suspense>
  );
}