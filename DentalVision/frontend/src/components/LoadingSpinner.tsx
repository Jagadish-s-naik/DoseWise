import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Analyzing X-ray...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
    </div>
  );
}
