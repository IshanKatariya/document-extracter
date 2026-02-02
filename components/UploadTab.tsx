'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DocumentUpload } from '@/lib/types';

interface UploadTabProps {
  documents: DocumentUpload[];
  onDocumentsUpdate: React.Dispatch<React.SetStateAction<DocumentUpload[]>>;
}

export default function UploadTab({
  documents,
  onDocumentsUpdate,
}: UploadTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- FILE SELECTION ---------------- */

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const pdfFiles = Array.from(files).filter(
      f =>
        f.type === 'application/pdf' ||
        f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      alert('Please upload PDF files only');
      return;
    }

    const newDocs: DocumentUpload[] = pdfFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0,
    }));

    // Add documents to state
    onDocumentsUpdate(prev => [...prev, ...newDocs]);

    // IMPORTANT: process using the doc object directly
    setTimeout(() => {
      newDocs.forEach(doc => processDocument(doc));
    }, 0);
  }, []);

  /* ---------------- MAIN PROCESSING LOGIC ---------------- */

  const processDocument = async (doc: DocumentUpload) => {
    try {
      console.log('🚀 Processing:', doc.file.name);

      // Step 1: Preprocessing
      updateStatus(doc.id, 'preprocessing', 20);
      await delay(800);

      // Step 2: Classification
      updateStatus(doc.id, 'classifying', 40);
      const classification = Math.random() > 0.5 ? 'typed' : 'handwritten';
      await delay(600);

      // Step 3: Extraction
      updateStatus(doc.id, 'extracting', 60);

      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('type', classification);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        updateFailure(doc.id, json.error ?? 'Extraction failed');
        return;
      }

      // Step 4: Complete
      onDocumentsUpdate(prev =>
        prev.map(d =>
          d.id === doc.id
            ? {
              ...d,
              status: 'completed',
              progress: 100,
              classification: classification as any,
              confidence: json.data?.confidence ?? 85,
              extractedData: {
                ...json.data,
                pdf_file_name: doc.file.name,
                model: json.model,
                cost: json.cost,
                processingTime: json.processingTime,
                confidence: json.data?.confidence ?? 85,
              },
            }
            : d
        )
      );


      console.log('✅ Completed:', doc.file.name);

    } catch (err: any) {
      updateFailure(doc.id, err?.message ?? 'Processing failed');
    }
  };

  /* ---------------- HELPERS ---------------- */

  const delay = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

  const updateStatus = (
    docId: string,
    status: DocumentUpload['status'],
    progress: number
  ) => {
    onDocumentsUpdate(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, status, progress } : doc
      )
    );
  };

  const updateFailure = (docId: string, error: string) => {
    onDocumentsUpdate(prev =>
      prev.map(doc =>
        doc.id === docId
          ? { ...doc, status: 'failed', error, progress: 100 }
          : doc
      )
    );
  };

  const removeDocument = (docId: string) => {
    onDocumentsUpdate(prev => prev.filter(doc => doc.id !== docId));
  };

  const retryDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    onDocumentsUpdate(prev =>
      prev.map(d =>
        d.id === docId
          ? { ...d, status: 'pending', progress: 0, error: undefined }
          : d
      )
    );

    setTimeout(() => processDocument(doc), 0);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-card p-12 text-center cursor-pointer transition-all
          ${isDragging ? 'border-primary-500 scale-[1.02] bg-primary-500/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={e => processFiles(e.target.files)}
        />

        <Upload className="w-10 h-10 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
        <p className="text-sm text-gray-400">
          Drag & drop PDF files or click to browse
        </p>
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No documents uploaded yet</p>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map(doc => (
          <div
            key={doc.id}
            className="glass-card p-4 flex items-center gap-4"
          >
            {/* Status Icon */}
            {doc.status === 'completed' && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {doc.status === 'failed' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {['pending', 'preprocessing', 'classifying', 'extracting'].includes(
              doc.status
            ) && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              )}

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-medium">{doc.file.name}</p>
              <p className="text-xs text-gray-400">{doc.status}</p>

              {doc.progress < 100 && (
                <div className="h-1 mt-2 bg-gray-800 rounded">
                  <div
                    className="h-full bg-blue-500 rounded transition-all"
                    style={{ width: `${doc.progress}%` }}
                  />
                </div>
              )}

              {doc.error && (
                <p className="text-xs text-red-400 mt-1">{doc.error}</p>
              )}
            </div>

            {/* Actions */}
            {doc.status === 'failed' && (
              <button
                onClick={() => retryDocument(doc.id)}
                className="text-xs px-3 py-1 rounded bg-blue-500/10 text-blue-400"
              >
                Retry
              </button>
            )}

            <button
              onClick={() => removeDocument(doc.id)}
              className="p-2 hover:bg-red-500/10 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
