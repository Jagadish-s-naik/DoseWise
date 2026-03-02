import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Eye, FileText, Sparkles } from 'lucide-react';
import { UploadDropzone } from '../components/UploadDropzone';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { apiClient } from '../lib/api';

export function LandingPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analyzeResult = await apiClient.analyzeXray(selectedFile);
      const explainResult = await apiClient.explainFindings(analyzeResult.detections);

      // Navigate to analysis page with results
      navigate('/analysis', {
        state: {
          imageUrl: preview,
          detections: analyzeResult.detections,
          explanations: explainResult.explanations,
          imageSize: analyzeResult.image_size,
          source: analyzeResult.source,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-bold text-gray-900">
              <span className="text-primary">Dental</span>Vision
            </h1>
          </div>
          <p className="text-2xl text-gray-600 mb-2">
            Understand Your Dental X-Rays in Seconds
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            AI-powered patient education tool that analyzes dental X-rays with color-coded annotations
            and provides plain-language explanations
          </p>
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="glass-card p-6 text-center slide-up">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Detection</h3>
            <p className="text-sm text-gray-600">
              Advanced YOLOv8 model detects teeth, cavities, fillings, and more
            </p>
          </div>

          <div className="glass-card p-6 text-center slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Color-Coded Overlays</h3>
            <p className="text-sm text-gray-600">
              Visual overlays highlight issues with red, yellow, and green indicators
            </p>
          </div>

          <div className="glass-card p-6 text-center slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Plain Language Reports</h3>
            <p className="text-sm text-gray-600">
              Get easy-to-understand explanations and downloadable PDF reports
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          {!preview ? (
            <div className="fade-in">
              <UploadDropzone onFileSelected={handleFileSelected} disabled={isAnalyzing} />
            </div>
          ) : (
            <div className="space-y-6 fade-in">
              {/* Preview */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <img
                  src={preview}
                  alt="X-ray preview"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Actions */}
              {isAnalyzing ? (
                <LoadingSpinner message="Analyzing your X-ray..." />
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Choose Different Image
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="flex-1 btn-primary"
                  >
                    Analyze X-Ray
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg p-4">
                  <p className="text-danger font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How it Works</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Upload your dental X-ray (panoramic, periapical, or bitewing)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Our AI analyzes the image and detects dental conditions</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Review color-coded overlays and plain-language explanations</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Download a PDF report to discuss with your dentist</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
