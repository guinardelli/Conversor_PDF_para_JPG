import React from 'react';
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
          <span className="material-icons text-green-500 text-2xl">check_circle</span>
        ) : (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        )}
        <p className="text-lg font-medium text-slate-700">{getStatusText()}</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-slate-500 mt-2">{Math.round(progress)}%</p>
    </div>
  );
};