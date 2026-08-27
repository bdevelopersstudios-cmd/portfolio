"use client";

import dynamic from "next/dynamic";
import type { ToolSlug } from "@/lib/tools";

/**
 * Each tool is code-split behind its own dynamic import, so opening the image
 * converter never downloads pdf.js or the OCR engine. ssr:false because every
 * one of them touches Canvas, File or Worker on mount.
 */
const loading = () => <div className="h-40 animate-pulse rounded-2xl border border-line bg-bg-raised" />;

const ImageConvert = dynamic(() => import("./image-tools").then((m) => m.ImageConvert), { ssr: false, loading });
const ImageCompress = dynamic(() => import("./image-tools").then((m) => m.ImageCompress), { ssr: false, loading });
const ImagesToPdf = dynamic(() => import("./pdf-tools").then((m) => m.ImagesToPdf), { ssr: false, loading });
const PdfToImages = dynamic(() => import("./pdf-tools").then((m) => m.PdfToImages), { ssr: false, loading });
const PdfToText = dynamic(() => import("./pdf-tools").then((m) => m.PdfToText), { ssr: false, loading });
const MergePdf = dynamic(() => import("./pdf-tools").then((m) => m.MergePdf), { ssr: false, loading });
const SplitPdf = dynamic(() => import("./pdf-tools").then((m) => m.SplitPdf), { ssr: false, loading });
const OcrTool = dynamic(() => import("./ocr-tool").then((m) => m.OcrTool), { ssr: false, loading });

export function ToolRunner({ slug }: { slug: ToolSlug }) {
  switch (slug) {
    case "image-convert":
      return <ImageConvert />;
    case "image-compress":
      return <ImageCompress />;
    case "images-to-pdf":
      return <ImagesToPdf />;
    case "pdf-to-images":
      return <PdfToImages />;
    case "pdf-to-text":
      return <PdfToText />;
    case "merge-pdf":
      return <MergePdf />;
    case "split-pdf":
      return <SplitPdf />;
    case "ocr":
      return <OcrTool />;
  }
}
