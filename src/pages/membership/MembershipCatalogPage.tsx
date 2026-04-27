import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  RegistrationNav,
  RegistrationFooter,
} from '../../components/membership/registration/RegistrationLayout';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const catalogPdfUrl =
  'https://res.cloudinary.com/dc6iwekzx/image/upload/v1776866529/Rwanda_ICT_Chamber_-_Membership_Catalog_j0cukh.pdf';

type PdfDocument = pdfjsLib.PDFDocumentProxy;

const PdfPage: React.FC<{ doc: PdfDocument; pageNumber: number }> = ({ doc, pageNumber }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;

    const renderPage = async () => {
      const page = await doc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const targetWidth = 560;
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      if (!currentCanvas) return;

      const context = currentCanvas.getContext('2d');
      if (!context) return;

      // StrictMode can re-run this effect before the previous render settles.
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }

      currentCanvas.width = viewport.width;
      currentCanvas.height = viewport.height;
      context.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

      const renderTask = page.render({
        canvasContext: context,
        canvas: currentCanvas,
        viewport,
      });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (error) {
        if (!(error instanceof Error) || error.name !== 'RenderingCancelledException') {
          throw error;
        }
      } finally {
        if (renderTaskRef.current === renderTask) {
          renderTaskRef.current = null;
        }
      }
    };

    void renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      const context = currentCanvas?.getContext('2d');
      if (currentCanvas && context) {
        context.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
      }
    };
  }, [doc, pageNumber]);

  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <canvas ref={canvasRef} className="block h-auto w-full" />
    </div>
  );
};

export const MembershipCatalogPage: React.FC = () => {
  const [doc, setDoc] = useState<PdfDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: catalogPdfUrl,
        });

        const loadedDoc = await loadingTask.promise;

        if (cancelled) {
          loadedDoc.destroy();
          return;
        }

        setDoc(loadedDoc);
        setPageCount(loadedDoc.numPages);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <RegistrationNav />

      <main className="flex-1 px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-[660px] flex-col gap-4">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-[760px] animate-pulse border border-slate-200 bg-white"
              />
            ))}

          {!loading &&
            doc &&
            Array.from({ length: pageCount }, (_, index) => (
              <PdfPage key={`page-${index + 1}`} doc={doc} pageNumber={index + 1} />
            ))}
        </div>
      </main>

      <RegistrationFooter />
    </div>
  );
};
