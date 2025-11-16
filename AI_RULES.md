# AI Development Rules

This document outlines the technical stack and conventions for developing this application. Following these rules ensures consistency and maintainability.

## Tech Stack

This is a client-side, in-browser PDF to image conversion tool. All processing happens locally on the user's machine.

-   **Framework:** React with TypeScript for building the user interface.
-   **Build Tool:** Vite for fast development and optimized builds.
-   **Styling:** Tailwind CSS (via CDN) for all styling. Utility-first classes are the standard.
-   **PDF Parsing & Rendering:** [PDF.js](https://mozilla.github.io/pdf.js/) is used to read, parse, and render pages from PDF files onto a canvas.
-   **File Archiving:** [JSZip](https://stuk.github.io/jszip/) is used to package the converted images into a single downloadable ZIP file.
-   **File Saving:** [FileSaver.js](https://github.com/eligrey/FileSaver.js/) provides the `saveAs` functionality to trigger the download of the generated ZIP file.
-   **Concurrency:** Web Workers are used for the heavy lifting of rendering PDF pages to avoid blocking the main UI thread, ensuring the application remains responsive during conversion.
-   **Icons:** Material Icons are used for all iconography.

## Library Usage Rules

-   **Styling:** Only use Tailwind CSS classes for styling. Do not introduce CSS-in-JS libraries, component libraries (other than what can be built with Tailwind), or plain CSS files.
-   **State Management:** Stick to React's built-in hooks (`useState`, `useCallback`, `useMemo`, `useEffect`, `useReducer`). Do not add external state management libraries like Redux, MobX, or Zustand.
-   **PDF Operations:** All interactions with PDF files (reading page count, rendering pages) must be done through the `pdf.js` library, which is available globally as `window.pdfjsLib`.
-   **ZIP Creation:** Use `window.JSZip` for creating archives.
-   **File Downloads:** Use `window.saveAs` for triggering file downloads.
-   **Asynchronous Tasks:** For computationally intensive tasks like image conversion, continue using the Web Worker pattern established in the `usePdfConverter.ts` hook. This is critical for UI performance.
-   **Dependencies:** Do not add new npm packages or CDN scripts without a strong justification. The goal is to keep the application lightweight and dependency-free where possible.