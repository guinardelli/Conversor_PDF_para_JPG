import React from 'react';
import { Loader, CheckCircle } from 'lucide-react';
import { ProcessStatus } from '../types';

interface ProgressBarProps {
  status: ProcessStatus;
  progress: number;
  convertedFileCount: number;
  totalFileCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ status, progress, convertedFileCount, totalFileCount }) => {
  
  const getStatusText = () => {
    switch(status) {
      case ProcessStatus.CONVERTING:
        return `Convertendo arquivo ${convertedFileCount + 1} de ${totalFileCount}...`;
      case ProcessStatus.ZIPPING:
        return 'Comprimindo imagens em um arquivo ZIP...';
      case ProcessStatus.DONE:
        return 'Conversão concluída!';
      default:
        return 'Iniciando...';
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center items-center gap-3 mb-3">
        {status === ProcessStatus.DONE ? (
          <CheckCircle className="h-6 w-6 text-green-400" />
        ) : (
          <Loader className="h-6 w-6 text-primary animate-spin" />
        )}
        <p className="text-lg font-medium text-gray-300">{getStatusText()}</p>
      </div>
      <div className="w-full bg-dark-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-primary h-4 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}%</p>
    </div>
  );
};