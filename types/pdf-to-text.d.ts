// src/types/pdf-to-text.d.ts
declare module "pdf-to-text" {
  export function pdfToText(
    filePath: string,
    options: {
      from?: number;
      to?: number;
      ownerPassword?: string;
      userPassword?: string;
    },
    callback: (err: Error | null, data: string) => void
  ): void;
  export function pdfToText(
    filePath: string,
    callback: (err: Error | null, data: string) => void
  ): void;
}
