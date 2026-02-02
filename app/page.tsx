'use client';

import { useState, useEffect } from 'react';
import { Upload, Database, BarChart3, Settings } from 'lucide-react';
import UploadTab from '@/components/UploadTab';
import DataTab from '@/components/DataTab';
import MetricsTab from '@/components/MetricsTab';
import { DocumentUpload, ExtractedData, ProcessingMetrics } from '@/lib/types';

type TabType = 'upload' | 'data' | 'metrics' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalDocuments: 0,
    successCount: 0,
    failureCount: 0,
    processingCount: 0,
    totalCost: 0,
    averageConfidence: 0,
    modelUsage: { pro: 0, flash: 0 },
    averageProcessingTime: 0,
  });

  /* ---------------- RESTORE DOCUMENTS ---------------- */

  useEffect(() => {
    try {
      const raw = localStorage.getItem('docuextract:documents');
      if (raw) {
        const parsed = JSON.parse(raw) as DocumentUpload[];
        const restored = parsed.map(d => ({
          ...d,
          extractedData: d.extractedData
            ? {
                ...d.extractedData,
                createdAt: d.extractedData.createdAt
                  ? new Date(d.extractedData.createdAt)
                  : undefined,
              }
            : undefined,
        }));
        setDocuments(restored);
      }
    } catch (err) {
      console.warn('Failed to restore documents', err);
    }
  }, []);

  /* ---------------- PERSIST DOCUMENTS ---------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        'docuextract:documents',
        JSON.stringify(documents)
      );
    } catch (err) {
      console.warn('Failed to persist documents', err);
    }
  }, [documents]);

  /* ---------------- DERIVE DATA + METRICS ---------------- */

  useEffect(() => {
    const completed = documents
      .filter(d => d.status === 'completed' && d.extractedData)
      .map(d => d.extractedData!);

    setExtractedData(completed);

    const successful = documents.filter(d => d.status === 'completed').length;
    const failed = documents.filter(d => d.status === 'failed').length;
    const processing = documents.filter(d =>
      ['preprocessing', 'classifying', 'extracting'].includes(d.status)
    ).length;

    const totalCost = completed.reduce(
      (sum, d) => sum + (d.cost || 0),
      0
    );

    const avgConfidence =
      completed.length > 0
        ? completed.reduce((s, d) => s + (d.confidence || 0), 0) /
          completed.length
        : 0;

    const proUsage = completed.filter(d => d.model === 'gemini-2.5-pro').length;
    const flashUsage = completed.filter(d => d.model === 'gemini-2.5-flash').length;

    setMetrics({
      totalDocuments: documents.length,
      successCount: successful,
      failureCount: failed,
      processingCount: processing,
      totalCost,
      averageConfidence: avgConfidence,
      modelUsage: { pro: proUsage, flash: flashUsage },
      averageProcessingTime:
        completed.length > 0
          ? completed.reduce(
              (sum, d) => sum + (d.processingTime || 0),
              0
            ) / completed.length
          : 0,
    });
  }, [documents]);

  /* ---------------- UI ---------------- */

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'data', label: 'Data', icon: Database, badge: extractedData.length },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      {/* Header */}
      <header className="border-b border-[rgba(var(--border),0.3)] bg-[rgba(var(--card),0.4)] backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-mono">DocuExtract</h1>
              <p className="text-xs text-gray-400">
                Intelligent PDF Data Pipeline
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[rgba(var(--border),0.3)] bg-[rgba(var(--card),0.2)]">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 flex items-center gap-2 text-sm ${
                  activeTab === tab.id
                    ? 'text-primary-400 border-b-2 border-primary-500'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-500/20 text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'upload' && (
          <UploadTab
            documents={documents}
            onDocumentsUpdate={setDocuments} // ✅ FIX
          />
        )}
        {activeTab === 'data' && <DataTab data={extractedData} />}
        {activeTab === 'metrics' && (
          <MetricsTab metrics={metrics} documents={documents} />
        )}
        {activeTab === 'settings' && (
          <div className="glass-card p-8 text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            Settings coming soon
          </div>
        )}
      </main>
    </div>
  );
}
