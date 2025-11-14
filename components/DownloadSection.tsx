import React from 'react';

interface DownloadSectionProps {
  zipUrl: string;
  onStartNew: () => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ zipUrl, onStartNew }) => {
  const handleDownload = () => {
    window.saveAs(zipUrl, `imagens_convertidas_${Date.now()}.zip`);
  };
    
  return (
    <div className="bg-white dark:bg-card-dark p-8 rounded-lg shadow-lg text-center border border-green-400">
        <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-icons text-green-500 text-4xl">task_alt</span>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Conversão bem-sucedida!</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Suas imagens estão prontas para download.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-black font-semibold rounded-md shadow-md hover:bg-amber-500 transition-all duration-300"
            >
            <span className="material-icons">download</span>
            Baixar ZIP
            </button>
            <button
            onClick={onStartNew}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-md shadow-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300"
            >
            <span className="material-icons">refresh</span>
            Iniciar Nova Conversão
            </button>
        </div>
    </div>
  );
};
