import sharp from 'sharp';

export interface PreprocessedPage {
  page: number;
  image: Buffer;
  width: number;
  height: number;
  dpi: number;
  rotation: number;
  deskewAngle?: number;
}

const TARGET_DPI = 300;

export async function preprocessPDF(pdfBuffer: Buffer): Promise<PreprocessedPage[]> {
  // For now, just return the PDF as-is
  // This bypasses preprocessing but keeps your app working
  
  return [{
    page: 1,
    image: pdfBuffer,
    width: 2480,
    height: 3508,
    dpi: TARGET_DPI,
    rotation: 0,
  }];
}