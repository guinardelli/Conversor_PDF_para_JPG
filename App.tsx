import React, { useState, useCallback, useMemo } from 'react';
import { FileUp, X, Image as ImageIcon, Download, Loader, FileCheck2, AlertTriangle } from 'lucide-react';
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
    dpi: 300,
    format: 'JPEG',
  });
  
  const { status, progress, convertedFileCount, totalFileCount, convertPdfs, zipUrl, reset } = usePdfConverter();

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
          // Optionally add to a list of failed files to show the user
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
    <div className="min-h-screen bg-dark-800 font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
             <ImageIcon className="h-10 w-10 text-primary" />
             <h1 className="text-4xl font-bold text-white tracking-tight">PDF para imagem</h1>
          </div>
          <p className="text-lg text-gray-400">Converta seus arquivos PDF em imagens de alta qualidade, diretamente no seu navegador.</p>
        </header>
        
        <div className="space-y-6">
          {status === ProcessStatus.IDLE && (
            <>
              <FileDropzone onFilesAdded={handleFilesAdded} />
              {files.length > 0 && (
                <div className="bg-dark-900 p-6 rounded-lg shadow-lg">
                  <FileList files={files} onRemoveFile={handleRemoveFile} onClearAll={handleClearAll} />
                  <ConversionOptions settings={settings} onSettingsChange={setSettings} totalPages={totalPages} />
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleStartConversion}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-md shadow-md hover:bg-primary-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={files.length === 0}
                    >
                      <FileUp className="h-5 w-5" />
                      Converter {files.length} PDF{files.length > 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {status !== ProcessStatus.IDLE && (
            <div className="bg-dark-900 p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Conversão em Andamento</h2>
              <ProgressBar 
                status={status} 
                progress={progress} 
                convertedFileCount={convertedFileCount} 
                totalFileCount={totalFileCount} 
              />
            </div>
          )}

          {status === ProcessStatus.DONE && zipUrl && (
            <DownloadSection zipUrl={zipUrl} onStartNew={handleClearAll} />
          )}

          {status === ProcessStatus.ERROR && (
             <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center gap-4" role="alert">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <div>
                  <strong className="font-bold">Falha na Conversão! </strong>
                  <span className="block sm:inline">Ocorreu um erro inesperado. Por favor, tente novamente.</span>
                </div>
                <button
                  onClick={handleClearAll}
                  className="ml-auto bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Começar de Novo
                </button>
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PDF para imagem. Todos os arquivos são processados localmente no seu navegador.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;