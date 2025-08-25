declare module 'pdf-parse' {
  export interface PDFParseOptions {
    max?: number
    version?: string
    pagerender?: (pageData: any) => string | Promise<string>
    [key: string]: any
  }

  export interface PDFParseResult {
    numpages: number
    numrender: number
    info: any
    metadata: any
    text: string
    version: string
  }

  export default function pdfParse(
    data: Buffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>
}

