import { BlobServiceClient } from '@azure/storage-blob'
import type { StorageProvider, BlobPointer } from './provider.js'

export class AzureBlobProvider implements StorageProvider {
  private containerName: string
  private client: BlobServiceClient

  constructor(connectionString: string, containerName: string) {
    this.client = BlobServiceClient.fromConnectionString(connectionString)
    this.containerName = containerName
  }

  private async getContainer() {
    const container = this.client.getContainerClient(this.containerName)
    await container.createIfNotExists()
    return container
  }

  async put(p: string, content: Buffer | string, contentType?: string): Promise<BlobPointer> {
    const container = await this.getContainer()
    const block = container.getBlockBlobClient(p)
    const data = typeof content === 'string' ? Buffer.from(content) : content
    await block.uploadData(data, { blobHTTPHeaders: { blobContentType: contentType } })
    return { container: this.containerName, blobPath: p }
  }

  async get(p: string): Promise<{ body: Buffer; contentType?: string }> {
    const container = await this.getContainer()
    const block = container.getBlockBlobClient(p)
    const resp = await block.download()
    const chunks: Buffer[] = []
    const reader = resp.readableStreamBody
    if (!reader) throw new Error('No body stream')
    for await (const chunk of reader) chunks.push(Buffer.from(chunk))
    const body = Buffer.concat(chunks)
    const contentType = resp.contentType
    return { body, contentType: contentType || undefined }
  }

  async exists(p: string): Promise<boolean> {
    const container = await this.getContainer()
    const block = container.getBlockBlobClient(p)
    return await block.exists()
  }

  async url(p: string): Promise<string | null> {
    // Return a path the API can rewrite or a direct URL; for now return null to prefer proxying
    return null
  }
}

