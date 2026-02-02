/**
 * PDF Processing Utilities
 * Handles PDF to image conversion, preprocessing, and optimization
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Polyfill Promise.withResolvers if missing (safe fallback)
// Polyfill Promise.withResolvers (Type-safe)
if (typeof (Promise as any).withResolvers !== 'function') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}


// Set worker path for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ProcessedPage {
  pageNumber: number;
  imageDataUrl: string;
  width: number;
  height: number;
}

/**
 * Convert PDF to images at 300 DPI
 */
export async function pdfToImages(file: File): Promise<ProcessedPage[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: ProcessedPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // Set scale for 300 DPI (roughly 4x default)
      const scale = 4;
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error('Could not get canvas context');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Convert to data URL
      const imageDataUrl = canvas.toDataURL('image/png');

      pages.push({
        pageNumber: i,
        imageDataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return pages;
  } catch (error) {
    console.error('PDF to image conversion failed:', error);
    throw new Error('Failed to convert PDF to images');
  }
}

/**
 * Preprocess image for better OCR accuracy
 */
export async function preprocessImage(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply preprocessing
      // 1. Contrast enhancement
      const contrast = 1.2;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = ((data[i] - 128) * contrast + 128); // R
        data[i + 1] = ((data[i + 1] - 128) * contrast + 128); // G
        data[i + 2] = ((data[i + 2] - 128) * contrast + 128); // B
      }

      // Put processed image back
      ctx.putImageData(imageData, 0, 0);

      // Return as data URL
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

/**
 * Validate PDF file
 */
export function validatePDF(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  return { valid: true };
}

/**
 * Estimate processing time based on file size
 */
export function estimateProcessingTime(file: File): number {
  // Rough estimate: 1 second per MB + base time
  const sizeInMB = file.size / (1024 * 1024);
  return Math.max(2, sizeInMB * 1 + 1);
}

/**
 * Classify document type (simple heuristic version)
 * In production, this would call a lightweight ML model
 */
export async function classifyDocument(imageDataUrl: string): Promise<'handwritten' | 'typed' | 'mixed'> {
  // This is a placeholder - in production you'd:
  // 1. Use a lightweight CNN model
  // 2. Or call Gemini Flash with a classification-only prompt
  // 3. Or use edge detection heuristics
  
  // For demo purposes, random classification
  const rand = Math.random();
  if (rand > 0.7) return 'handwritten';
  if (rand > 0.3) return 'typed';
  return 'mixed';
}
