import { useState, useCallback } from 'react';
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


export const usePdfConverter = () => {
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [convertedFileCount, setConvertedFileCount] = useState(0);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const convertPdfs = useCallback(async (files: PdfFile[], settings: ConversionSettings) => {
    setStatus(ProcessStatus.CONVERTING);
    setProgress(0);
    setConvertedFileCount(0);
    setTotalFileCount(files.length);

    const allImages: { name: string; data: Blob }[] = [];
    
    // Calculate total pages to process
    let totalPagesToProcess = 0;
    if (settings.allPages) {
      totalPagesToProcess = files.reduce((acc, file) => acc + file.numPages, 0);
    } else {
      for (const pdfFile of files) {
        const pagesToConvert = parsePageRange(settings.pageRange, pdfFile.numPages);
        totalPagesToProcess += pagesToConvert.length;
      }
    }
    
    if (totalPagesToProcess === 0 && !settings.allPages) {
        console.error("Nenhuma página válida para converter.");
        setStatus(ProcessStatus.ERROR);
        return;
    }

    let pagesProcessed = 0;

    try {
      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const baseFilename = pdfFile.file.name.replace(/\.pdf$/i, '');

        const pagesToConvert = settings.allPages
          ? Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1)
          : parsePageRange(settings.pageRange, pdfDoc.numPages);
        
        for (const pageNum of pagesToConvert) {
          const page = await pdfDoc.getPage(pageNum);
          const scale = 300 / 96; // Hardcode to 300 DPI for high quality
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext).promise;
            
            const format = settings.format === 'TIFF' ? 'PNG' : settings.format; // Fallback TIFF to PNG
            const mimeType = `image/${format.toLowerCase()}`;
            const quality = settings.quality / 100;

            const imageBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, mimeType, quality)
            );
            
            if (imageBlob) {
                const imageName = `${baseFilename}_pagina_${pageNum}.${format.toLowerCase()}`;
                allImages.push({ name: imageName, data: imageBlob });
            }
          }
          
          pagesProcessed++;
          setProgress((pagesProcessed / totalPagesToProcess) * 100);
        }
        setConvertedFileCount(prev => prev + 1);
      }

      setStatus(ProcessStatus.ZIPPING);
      const zip = new window.JSZip();
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
  }, []);

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
