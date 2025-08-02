import { Suspense } from 'react';
import ServiceContent from './ServiceContent';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading products and filters...</div>}>
      <ServiceContent />
    </Suspense>
  );
}