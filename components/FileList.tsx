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
        <div key={pdfFile.id} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="material-icons text-slate-500">description</span>
            <div className="flex-grow overflow-hidden">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">{pdfFile.file.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{pdfFile.numPages} página{pdfFile.numPages !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <button
            onClick={() => onRemoveFile(pdfFile.id)}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/50 group"
            aria-label={`Remover ${pdfFile.file.name}`}
          >
            <span className="material-icons text-sm text-slate-600 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
