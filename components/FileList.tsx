import React from 'react';
import { PdfFile } from '../types';

interface FileListProps {
  files: PdfFile[];
  onRemoveFile: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      {files.map(pdfFile => (
        <div key={pdfFile.id} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="material-icons text-slate-500">description</span>
            <div className="flex-grow overflow-hidden">
                <span className="font-medium text-slate-700 truncate block">{pdfFile.file.name}</span>
                <span className="text-xs text-slate-500">{pdfFile.numPages} página{pdfFile.numPages !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            onClick={() => onRemoveFile(pdfFile.id)}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 hover:bg-red-100 group"
            aria-label={`Remover ${pdfFile.file.name}`}
          >
            <span className="material-icons text-sm text-slate-600 group-hover:text-red-600">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};