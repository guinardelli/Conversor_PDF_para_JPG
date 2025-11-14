export interface PdfFile {
  id: string;
  file: File;
  numPages: number;
}

export interface ConversionSettings {
  format: 'JPG' | 'PNG' | 'TIFF';
  quality: number; // 0-100
  allPages: boolean;
  pageRange: string;
  dpi: number;
}

export enum ProcessStatus {
  IDLE = 'idle',
  CONVERTING = 'converting',
  ZIPPING = 'zipping',
  DONE = 'done',
  ERROR = 'error',
}