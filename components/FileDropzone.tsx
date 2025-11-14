import React, { useCallback, useState } from 'react';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Fix: The parent component already handles filtering for PDF files.
      // Removing the filter here fixes the TypeScript error and avoids redundant logic.
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    }
  };

  const borderClass = isDragging ? 'border-primary' : 'border-slate-300';

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed ${borderClass} rounded-xl p-8 text-center bg-white/50 transition-colors duration-200`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        accept=".pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
        <span className="material-icons text-5xl text-slate-400 mb-4">upload_file</span>
        <p className="text-xl font-semibold text-slate-800 mb-1">Arraste e solte seus arquivos PDF aqui</p>
        <p className="text-slate-500">ou <span className="text-primary font-semibold hover:underline">clique para procurar</span></p>
      </label>
    </div>
  );
};