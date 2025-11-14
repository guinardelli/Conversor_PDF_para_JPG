import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FileDropzone } from './components/FileDropzone';
import { FileList } from './components/FileList';
import { ConversionOptions } from './components/ConversionOptions';
import { ProgressBar } from './components/ProgressBar';
import { DownloadSection } from './components/DownloadSection';
import { PdfFile, ConversionSettings, ProcessStatus } from './types';
import { usePdfConverter } from './hooks/usePdfConverter';

declare global {
  interface Window {
    pdfjsLib: any;
    JSZip: any;
    saveAs: any;
  }
}

const App: React.FC = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'PNG',
    quality: 92,
    allPages: true,
    pageRange: '',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const { status, progress, convertedFileCount, totalFileCount, convertPdfs, zipUrl, reset } = usePdfConverter();

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFilesAdded = useCallback(async (addedFiles: File[]) => {
    const newPdfFiles: PdfFile[] = [];
    for (const file of addedFiles) {
      if (file.type === 'application/pdf' && !files.some(f => f.file.name === file.name)) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          newPdfFiles.push({ file, id: `${file.name}-${Date.now()}`, numPages: pdfDoc.numPages });
        } catch (error) {
          console.error("Error reading PDF metadata:", error);
        }
      }
    }
    setFiles(prevFiles => [...prevFiles, ...newPdfFiles]);
  }, [files]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
  }, []);

  const handleClearAll = useCallback(() => {
    setFiles([]);
    reset();
  }, [reset]);

  const handleStartConversion = useCallback(() => {
    if (files.length > 0) {
      convertPdfs(files, settings);
    }
  }, [files, settings, convertPdfs]);
  
  const totalPages = useMemo(() => files.reduce((acc, file) => acc + file.numPages, 0), [files]);

  return (
    <div className="min-h-screen flex flex-col">
      <button 
        className="dark-mode-toggle absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label="Toggle dark mode"
      >
        <span className="material-icons dark:hidden">dark_mode</span>
        <span className="material-icons hidden dark:inline">light_mode</span>
      </button>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl w-full mx-auto">
          <header className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-primary p-3 rounded-xl">
                <svg className="h-8 w-8 text-black" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16l4 4-.01-18zM17 11l-2.5-3.15L11.5 12l-1.75-2.2L6 14h12l-1-1z"></path>
                </svg>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">PDF para imagem</h1>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Converta seus arquivos PDF em imagens de alta qualidade, diretamente no seu navegador.</p>
          </header>

          {status === ProcessStatus.IDLE && files.length === 0 && (
             <FileDropzone onFilesAdded={handleFilesAdded} />
          )}

          {status === ProcessStatus.IDLE && files.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <FileDropzone onFilesAdded={handleFilesAdded} />
                <FileList files={files} onRemoveFile={handleRemoveFile} />
              </div>
              <ConversionOptions 
                settings={settings} 
                onSettingsChange={setSettings} 
                onConvert={handleStartConversion}
                onCancel={handleClearAll}
                totalPages={totalPages}
              />
            </div>
          )}
          
          {(status === ProcessStatus.CONVERTING || status === ProcessStatus.ZIPPING) && (
             <div className="bg-white dark:bg-card-dark p-6 rounded-lg shadow-lg text-center w-full max-w-3xl">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Conversão em Andamento</h2>
              <ProgressBar 
                status={status} 
                progress={progress} 
                convertedFileCount={convertedFileCount} 
                totalFileCount={totalFileCount} 
              />
            </div>
          )}

          {status === ProcessStatus.DONE && zipUrl && (
             <div className="w-full max-w-3xl">
                <DownloadSection zipUrl={zipUrl} onStartNew={handleClearAll} />
             </div>
          )}

          {status === ProcessStatus.ERROR && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center gap-4 w-full max-w-3xl" role="alert">
                <span className="material-icons text-red-500">error</span>
                <div>
                  <strong className="font-bold">Falha na Conversão! </strong>
                  <span className="block sm:inline">Ocorreu um erro inesperado. Por favor, tente novamente.</span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Começar de Novo
                </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center p-6 text-slate-500 dark:text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} PDF para imagem. Todos os arquivos são processados localmente no seu navegador.</p>
      </footer>
    </div>
  );
};

export default App;
