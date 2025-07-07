declare module "pdf-parse" {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  function pdf(
    buffer: Buffer,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;

  export = pdf;
}
