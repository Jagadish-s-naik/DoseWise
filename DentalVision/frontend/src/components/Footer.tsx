export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <p className="text-sm">
            <span className="font-semibold text-white">Powered by AI</span> - Results may not be 100% accurate
          </p>
          <p className="text-xs text-gray-400">
            DentalVision is an educational tool designed to help patients understand their dental X-rays.
            This tool does not replace professional dental care or diagnosis.
          </p>
          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} DentalVision. Built with React, Flask, YOLOv8 & Claude AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
