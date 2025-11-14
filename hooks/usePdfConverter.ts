import { useState, useCallback, useMemo, useEffect } from 'react';
import { PdfFile, ConversionSettings, ProcessStatus } from '../types';

const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
  const pages = new Set<number>();
  if (!rangeStr) return [];

  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart.includes('-')) {
      const [start, end] = trimmedPart.split('-').map(p => parseInt(p, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i > 0 && i <= maxPages) pages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(trimmedPart, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum <= maxPages) {
        pages.add(pageNum);
      }
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
};

// Self-contained Web Worker code as a string
const workerScript = `
  // Pre-load the pdf.js library
  self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');

  // Pre-configure the worker source for pdf.js to avoid re-setting it on every message.
  // This reduces the initialization overhead for each task.
  self.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  self.onmessage = async (event) => {
    const { pdfData, pageNum, settings, baseFilename } = event.data;

    try {
      const pdfDoc = await self.pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdfDoc.getPage(pageNum);
      
      const scale = settings.dpi / 96;
      const viewport = page.getViewport({ scale });

      // Use OffscreenCanvas for rendering in a worker environment
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get OffscreenCanvas context.');
      }
      
      await page.render({ canvasContext: context, viewport: viewport }).promise;

      const format = settings.format === 'TIFF' ? 'PNG' : settings.format;
      const mimeType = \`image/\${format.toLowerCase()}\`;
      const quality = settings.quality / 100;
      
      const imageBlob = await canvas.convertToBlob({ type: mimeType, quality: quality });
      
      if (!imageBlob) {
        throw new Error('Failed to create image blob.');
      }

      const imageName = \`\${baseFilename}_pagina_\${pageNum}.\${format.toLowerCase()}\`;
      self.postMessage({ status: 'success', imageName, imageBlob });

    } catch (error) {
      self.postMessage({ status: 'error', error: error.message, pageNum: pageNum });
    }
  };
`;

export const usePdfConverter = () => {
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [convertedFileCount, setConvertedFileCount] = useState(0);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const workerUrl = useMemo(() => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  }, []);

  useEffect(() => {
    // Clean up the object URL when the component unmounts to prevent memory leaks
    return () => {
      URL.revokeObjectURL(workerUrl);
    };
  }, [workerUrl]);

  const convertPdfs = useCallback(async (files: PdfFile[], settings: ConversionSettings) => {
    setStatus(ProcessStatus.CONVERTING);
    setProgress(0);
    setConvertedFileCount(0);
    setTotalFileCount(files.length);

    const tasks: {
        pdfData: ArrayBuffer;
        pageNum: number;
        settings: ConversionSettings;
        baseFilename: string;
        fileId: string;
    }[] = [];
    
    const fileProgressTracker = new Map<string, { processed: number, total: number }>();
    let totalPagesToProcess = 0;

    for (const pdfFile of files) {
      const pagesToConvert = settings.allPages
        ? Array.from({ length: pdfFile.numPages }, (_, i) => i + 1)
        : parsePageRange(settings.pageRange, pdfFile.numPages);

      if (pagesToConvert.length > 0) {
        fileProgressTracker.set(pdfFile.id, { processed: 0, total: pagesToConvert.length });
        const pdfData = await pdfFile.file.arrayBuffer();
        const baseFilename = pdfFile.file.name.replace(/\.pdf$/i, '');
        for (const pageNum of pagesToConvert) {
          tasks.push({ pdfData, pageNum, settings, baseFilename, fileId: pdfFile.id });
        }
      }
      totalPagesToProcess += pagesToConvert.length;
    }

    if (totalPagesToProcess === 0) {
      console.error("Nenhuma página válida para converter.");
      setStatus(ProcessStatus.ERROR);
      return;
    }
    
    const allImages: { name: string; data: Blob }[] = [];
    let pagesProcessed = 0;
    
    try {
      await new Promise<void>((resolve, reject) => {
        const numWorkers = Math.min(navigator.hardwareConcurrency || 4, tasks.length);
        const workers = new Array(numWorkers).fill(null).map(() => new Worker(workerUrl));
        let taskIndex = 0;
        let completedTasks = 0;

        const processTask = (worker: Worker) => {
          if (taskIndex >= tasks.length) return;
          
          const currentTask = tasks[taskIndex++];
          const { pdfData, ...restOfTask } = currentTask;
          
          worker.postMessage({ ...restOfTask, pdfData: pdfData.slice(0) });
          
          worker.onmessage = (event) => {
            const { status, imageName, imageBlob, error } = event.data;

            if (status === 'success') {
              allImages.push({ name: imageName, data: imageBlob });
              
              pagesProcessed++;
              setProgress((pagesProcessed / totalPagesToProcess) * 100);

              const tracker = fileProgressTracker.get(currentTask.fileId)!;
              tracker.processed++;
              if (tracker.processed === tracker.total) {
                setConvertedFileCount(prev => prev + 1);
              }
            } else {
              console.error(`Worker error for page ${currentTask.pageNum}:`, error);
            }
            
            completedTasks++;
            if (completedTasks === tasks.length) {
              workers.forEach(w => w.terminate());
              resolve();
            } else {
              processTask(worker);
            }
          };

          worker.onerror = (err) => {
            console.error("Worker failed:", err);
            workers.forEach(w => w.terminate());
            reject(new Error("A worker encountered a fatal error."));
          };
        };
        
        workers.forEach(processTask);
      });

      setStatus(ProcessStatus.ZIPPING);
      const zip = new window.JSZip();
      allImages.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      allImages.forEach(image => {
        zip.file(image.name, image.data);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
      setStatus(ProcessStatus.DONE);

    } catch (error) {
      console.error("Falha na conversão:", error);
      setStatus(ProcessStatus.ERROR);
    }
  }, [workerUrl]);

  const reset = useCallback(() => {
    if (zipUrl) {
      URL.revokeObjectURL(zipUrl);
    }
    setStatus(ProcessStatus.IDLE);
    setProgress(0);
    setConvertedFileCount(0);
    setTotalFileCount(0);
    setZipUrl(null);
  }, [zipUrl]);

  return { status, progress, convertedFileCount, totalFileCount, convertPdfs, zipUrl, reset };
};