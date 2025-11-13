
export interface PdfFile {
  id: string;
  file: File;
  numPages: number;
}

export interface ConversionSettings {
  dpi: number;
  format: 'JPEG' | 'PNG';
}

export enum ProcessStatus {
  IDLE = 'idle',
  CONVERTING = 'converting',
  ZIPPING = 'zipping',
  DONE = 'done',
  ERROR = 'error',
}
