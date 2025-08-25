export type BlobPointer = {
  container: string
  blobPath: string
}

export interface StorageProvider {
  put(path: string, content: Buffer | string, contentType?: string): Promise<BlobPointer>
  get(path: string): Promise<{ body: Buffer; contentType?: string }>
  exists(path: string): Promise<boolean>
  url(path: string): Promise<string | null>
}

