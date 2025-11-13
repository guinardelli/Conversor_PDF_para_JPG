
import React, { useCallback, useState } from 'react';
import { FileUp } from 'lucide-react';

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

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${isDragging ? 'border-primary bg-dark-700' : 'border-dark-600 hover:border-primary'}`}
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
      <label htmlFor="file-upload" className="cursor-pointer">
        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold text-white">Drag & drop your PDF files here</p>
        <p className="mt-1 text-sm text-gray-500">or <span className="text-primary font-medium">click to browse</span></p>
      </label>
    </div>
  );
};
