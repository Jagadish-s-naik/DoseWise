const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
  tooth_number: number;
  urgency: string;
}

export interface Explanation {
  tooth_number: number;
  condition: string;
  explanation: string;
  recommendation: string;
  urgency: string;
  confidence: number;
}

export interface AnalyzeResponse {
  detections: Detection[];
  source: string;
  image_size: number[];
}

export interface ExplainResponse {
  explanations: Explanation[];
}

export interface HealthResponse {
  status: string;
  version: string;
  services: {
    detector: boolean;
    explainer: boolean;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  async analyzeXray(file: File): Promise<AnalyzeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    return response.json();
  }

  async explainFindings(detections: Detection[]): Promise<ExplainResponse> {
    const response = await fetch(`${this.baseUrl}/api/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ detections }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Explanation failed');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_URL);
