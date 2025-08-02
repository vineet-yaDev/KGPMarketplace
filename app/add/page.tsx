import { Suspense } from 'react';
import SellContent from './ SellContent';

export default function AddPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading your listing data...</div>}>
      <SellContent />
    </Suspense>
  );
}