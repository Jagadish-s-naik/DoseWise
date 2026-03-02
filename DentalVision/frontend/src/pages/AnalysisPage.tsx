import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { XrayCanvas } from '../components/XrayCanvas';
import { FindingCard } from '../components/FindingCard';
import type { Detection, Explanation } from '../lib/api';
import { generatePDF } from '../lib/pdfGenerator';

interface LocationState {
  imageUrl: string;
  detections: Detection[];
  explanations: Explanation[];
  imageSize: number[];
  source: string;
}

export function AnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');
  const [showAccuracyTooltip, setShowAccuracyTooltip] = useState(false);

  if (!state) {
    // Redirect to home if no state
    navigate('/');
    return null;
  }

  const { imageUrl, detections, explanations, imageSize, source } = state;

  const handleExportPDF = () => {
    generatePDF(
      canvasDataUrl || imageUrl,
      explanations,
      { width: imageSize[0], height: imageSize[1] }
    );
  };

  const handleCanvasReady = (dataUrl: string) => {
    setCanvasDataUrl(dataUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Upload</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={20} />
            Export PDF Report
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel: X-ray with Canvas Overlay */}
          <div className="fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Annotated X-Ray</h2>
              <p className="text-gray-600 text-sm">
                {detections.length} detection{detections.length !== 1 ? 's' : ''} found
                {source !== 'yolov8' && (
                  <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-1 rounded">
                    Using {source} mode
                  </span>
                )}
              </p>
            </div>

            <XrayCanvas
              imageUrl={imageUrl}
              detections={detections}
              onCanvasReady={handleCanvasReady}
            />
          </div>

          {/* Right Panel: Findings */}
          <div className="slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Findings</h2>
              
              {/* Accuracy Tooltip */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowAccuracyTooltip(true)}
                  onMouseLeave={() => setShowAccuracyTooltip(false)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Info size={16} />
                  <span>How accurate is this?</span>
                </button>

                {showAccuracyTooltip && (
                  <div className="absolute right-0 top-8 w-80 glass-card p-4 z-10 shadow-xl fade-in">
                    <p className="text-sm text-gray-700">
                      Our AI uses state-of-the-art YOLOv8 technology, which achieves high accuracy
                      in dental X-ray analysis. However, results may vary based on image quality.
                    </p>
                    <p className="text-sm text-gray-700 mt-2 font-semibold">
                      Always consult with a licensed dentist for professional diagnosis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Findings List */}
            <div className="space-y-4">
              {explanations.length > 0 ? (
                explanations.map((explanation, index) => (
                  <FindingCard key={index} finding={explanation} />
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <p className="text-gray-500">No significant findings detected.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    This might indicate healthy teeth or image quality issues.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 glass-card p-4 bg-blue-50/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-1">Privacy First</p>
                  <p className="text-gray-600">
                    Your X-rays are processed securely and <strong>not stored</strong> on our servers.
                    All processing happens in real-time and data is discarded immediately after analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
