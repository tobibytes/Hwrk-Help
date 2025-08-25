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

  const pdfParse: (data: Buffer | Uint8Array, options?: PDFParseOptions) => Promise<PDFParseResult>
  export default pdfParse
}

declare module 'pdf-parse/lib/pdf-parse' {
  import pdfParse from 'pdf-parse'
  export default pdfParse
}

declare module 'pdf-parse/lib/pdf-parse.js' {
  import pdfParse from 'pdf-parse'
  export default pdfParse
}

