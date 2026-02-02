import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocuExtract - Intelligent PDF Data Extraction',
  description: 'Production-grade document extraction pipeline with AI-powered OCR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
