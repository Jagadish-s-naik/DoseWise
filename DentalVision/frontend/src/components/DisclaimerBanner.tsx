import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-warning/20 border-b border-warning/30 py-3 px-4 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
        <p className="text-gray-900 font-medium">
          <span className="font-bold">Educational Tool Only</span> - This is NOT a substitute for professional dental diagnosis
        </p>
      </div>
    </div>
  );
}
