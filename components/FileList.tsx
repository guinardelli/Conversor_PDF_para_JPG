import React from 'react';
import { X, FileText } from 'lucide-react';
import { PdfFile } from '../types';

interface FileListProps {
  files: PdfFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemoveFile, onClearAll }) => {
  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-dark-900">Arquivos Selecionados ({files.length})</h2>
            <button
            onClick={onClearAll}
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
            Limpar Tudo
            </button>
      </div>
      <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
        {files.map(pdfFile => (
          <div key={pdfFile.id} className="flex items-center bg-gray-50 p-3 rounded-md">
            <FileText className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{pdfFile.file.name}</p>
              <p className="text-xs text-gray-500">{pdfFile.numPages} página{pdfFile.numPages > 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => onRemoveFile(pdfFile.id)}
              className="ml-4 p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-dark-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};