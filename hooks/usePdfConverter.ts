import { useState, useCallback } from 'react';
import { PdfFile, ConversionSettings, ProcessStatus } from '../types';

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
    const totalPages = files.reduce((acc, file) => acc + file.numPages, 0);
    let pagesProcessed = 0;

    try {
      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const baseFilename = pdfFile.file.name.replace(/\.pdf$/i, '');
        
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const scale = settings.dpi / 96;
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

            const imageBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, `image/${settings.format.toLowerCase()}`, 0.92)
            );
            
            if (imageBlob) {
                const imageName = `${baseFilename}_pagina_${pageNum}.${settings.format.toLowerCase()}`;
                allImages.push({ name: imageName, data: imageBlob });
            }
          }
          
          pagesProcessed++;
          setProgress((pagesProcessed / totalPages) * 100);
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