'use client';

import { useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { ProcessingMetrics, DocumentUpload } from '@/lib/types';

interface MetricsTabProps {
  metrics: ProcessingMetrics;
  documents: DocumentUpload[];
}

export default function MetricsTab({ metrics, documents }: MetricsTabProps) {
  const stats = useMemo(() => {
    const successRate =
      metrics.totalDocuments > 0 ? (metrics.successCount / metrics.totalDocuments) * 100 : 0;

    const estimatedBatchSavings =
      metrics.totalDocuments > 100 ? metrics.totalCost * 0.5 : 0;

    const recentDocuments = documents.slice(-10);
    const avgRecentConfidence =
      recentDocuments.length > 0
        ? recentDocuments.reduce((sum, d) => sum + (d.confidence || 0), 0) /
          recentDocuments.length
        : 0;

    return {
      successRate,
      estimatedBatchSavings,
      avgRecentConfidence,
    };
  }, [metrics, documents]);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <div className="glass-card p-6 hover:bg-[rgba(var(--card-hover),0.6)] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Documents"
          value={metrics.totalDocuments}
          color="bg-primary-500/10 text-primary-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Successfully Processed"
          value={metrics.successCount}
          subtitle={`${stats.successRate.toFixed(1)}% success rate`}
          color="bg-success-500/10 text-success-400"
        />
        <StatCard
          icon={XCircle}
          label="Failed"
          value={metrics.failureCount}
          color="bg-error-500/10 text-error-400"
        />
        <StatCard
          icon={Clock}
          label="Processing"
          value={metrics.processingCount}
          color="bg-warning-500/10 text-warning-400"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Average Confidence"
          value={`${metrics.averageConfidence.toFixed(1)}%`}
          subtitle={`Recent: ${stats.avgRecentConfidence.toFixed(1)}%`}
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          icon={Activity}
          label="Avg Processing Time"
          value={`${metrics.averageProcessingTime.toFixed(2)}s`}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${metrics.totalCost.toFixed(4)}`}
          subtitle={
            stats.estimatedBatchSavings > 0
              ? `Batch savings: $${stats.estimatedBatchSavings.toFixed(4)}`
              : undefined
          }
          color="bg-green-500/10 text-green-400"
        />
      </div>

      {/* Model Usage */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold font-mono">Model Usage Distribution</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Gemini 2.5 Pro</span>
                <span className="text-xs text-gray-500">(Handwritten/Mixed)</span>
              </div>
              <span className="text-sm font-mono font-semibold">
                {metrics.modelUsage.pro} docs
              </span>
            </div>
            <div className="confidence-bar h-2">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${
                    metrics.successCount > 0
                      ? (metrics.modelUsage.pro / metrics.successCount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Gemini 2.5 Flash</span>
                <span className="text-xs text-gray-500">(Typed/Printed)</span>
              </div>
              <span className="text-sm font-mono font-semibold">
                {metrics.modelUsage.flash} docs
              </span>
            </div>
            <div className="confidence-bar h-2">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${
                    metrics.successCount > 0
                      ? (metrics.modelUsage.flash / metrics.successCount) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cost Optimization Insights */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold font-mono">Cost Optimization</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--card),0.4)]">
            <span className="text-sm text-gray-400">Standard API Cost</span>
            <span className="font-mono font-semibold">${metrics.totalCost.toFixed(4)}</span>
          </div>

          {metrics.totalDocuments > 100 && (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--card),0.4)]">
                <span className="text-sm text-gray-400">Batch API Cost (Estimated)</span>
                <span className="font-mono font-semibold text-success-400">
                  ${(metrics.totalCost * 0.5).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success-500/10 border border-success-500/20">
                <span className="text-sm font-medium text-success-400">Potential Savings</span>
                <span className="font-mono font-bold text-success-400">
                  ${stats.estimatedBatchSavings.toFixed(4)} (50%)
                </span>
              </div>
            </>
          )}

          <div className="mt-4 p-4 rounded-lg bg-primary-500/5 border border-primary-500/10">
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 <strong className="text-primary-400">Tip:</strong> Process{' '}
              {metrics.totalDocuments >= 100 ? 'more' : '100+'} documents to unlock Batch API
              pricing and save ~50% on processing costs.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold font-mono mb-4">Recent Processing Activity</h3>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.slice(-5).reverse().map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--card),0.4)] hover:bg-[rgba(var(--card-hover),0.4)] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm truncate">{doc.file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'completed' && (
                    <span className="text-xs font-mono text-success-400">
                      {doc.confidence?.toFixed(0)}%
                    </span>
                  )}
                  <span
                    className={`status-pill ${
                      doc.status === 'completed'
                        ? 'bg-success-500/10 text-success-500'
                        : doc.status === 'failed'
                        ? 'bg-error-500/10 text-error-500'
                        : 'bg-primary-500/10 text-primary-500'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No processing activity yet</p>
        )}
      </div>
    </div>
  );
}
