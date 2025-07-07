// src/types/pdfjs-dist.d.ts
declare module "pdfjs-dist/build/pdf.mjs" {
  import * as pdfjsLib from "pdfjs-dist";
  export = pdfjsLib;
}

declare module "pdfjs-dist/build/pdf.js" {
  import * as pdfjsLib from "pdfjs-dist";
  export = pdfjsLib;
}

declare module "pdfjs-dist/build/pdf.worker.mjs" {
  const content: string;
  export default content;
}

declare module "pdfjs-dist/build/pdf.worker.js" {
  const content: string;
  export default content;
}
