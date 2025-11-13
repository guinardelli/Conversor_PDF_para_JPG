import React from 'react';
import { Download, FileCheck2, RotateCcw } from 'lucide-react';

interface DownloadSectionProps {
  zipUrl: string;
  onStartNew: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ zipUrl, onStartNew }) => {
  const handleDownload = () => {
    window.saveAs(zipUrl, `imagens_convertidas_${Date.now()}.zip`);
  };
    
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center border border-green-400">
        <div className="flex items-center justify-center gap-3 mb-4">
            <FileCheck2 className="h-8 w-8 text-green-400" />
            <h2 className="text-2xl font-semibold text-dark-900">Conversão bem-sucedida!</h2>
        </div>
        <p className="text-gray-600 mb-6">Suas imagens estão prontas para download.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-text font-semibold rounded-md shadow-md hover:bg-primary-hover transition-all duration-300"
            >
            <Download className="h-5 w-5" />
            Baixar ZIP
            </button>
            <button
            onClick={onStartNew}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-all duration-300"
            >
            <RotateCcw className="h-5 w-5" />
            Iniciar Nova Conversão
            </button>
        </div>
    </div>
  );
};