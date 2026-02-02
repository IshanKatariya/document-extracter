export interface ExtractedData {
  id: string;
  name: string;
  address: string;
  postalcode: string;
  city: string;
  birthday: string;
  date: string;
  time: string;
  handwritten: boolean;
  signed: boolean;
  stamp: string;
  pdf_file_name: string;
  status: 'success' | 'processing' | 'failed' | 'pending';
  confidence?: number;
  processingTime?: number;
  model?: 'gemini-2.5-pro' | 'gemini-2.5-flash';
  cost?: number;
  createdAt?: Date;
}

export interface DocumentUpload {
  id: string;
  file: File;
  status: 'pending' | 'preprocessing' | 'uploaded'  | 'classifying' | 'extracting' | 'completed' | 'failed' | 'rate-limited';
  progress: number;
  error?: string;
  classification?: 'handwritten' | 'typed' | 'mixed';
  extractedData?: ExtractedData;
  confidence?: number;
  retryCount?: number;
}

export interface ProcessingMetrics {
  totalDocuments: number;
  successCount: number;
  failureCount: number;
  processingCount: number;
  totalCost: number;
  averageConfidence: number;
  modelUsage: {
    pro: number;
    flash: number;
  };
  averageProcessingTime: number;
}

export interface CostTracking {
  documentId: string;
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash';
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}

export interface ClassificationResult {
  type: 'handwritten' | 'typed' | 'mixed';
  confidence: number;
  recommendedModel: 'gemini-2.5-pro' | 'gemini-2.5-flash';
}

export interface BatchJob {
  id: string;
  documentIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  estimatedCostSavings: number;
}

export interface RateLimitStatus {
  isLimited: boolean;
  resetAt?: Date;
  remainingRequests?: number;
  pausedUntil?: Date;
}
