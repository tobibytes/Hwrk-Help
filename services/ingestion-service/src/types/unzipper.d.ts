declare module 'unzipper' {
  export interface FileEntry {
    path: string
    buffer(): Promise<Buffer>
  }
  export interface OpenResult {
    files: FileEntry[]
  }
  export const Open: {
    buffer(buf: Buffer): Promise<OpenResult>
  }
  const unzipper: { Open: typeof Open }
  export default unzipper
}

