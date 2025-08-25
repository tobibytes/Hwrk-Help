import fs from 'node:fs/promises'
import path from 'node:path'
import type { StorageProvider, BlobPointer } from './provider'

export class LocalFsProvider implements StorageProvider {
  constructor(private rootDir: string, private container = 'local') {}

  private abs(p: string) {
    return path.isAbsolute(p) ? p : path.join(this.rootDir, p)
  }

  async put(p: string, content: Buffer | string, _contentType?: string): Promise<BlobPointer> {
    const file = this.abs(p)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, content)
    return { container: this.container, blobPath: p }
  }

  async get(p: string): Promise<{ body: Buffer; contentType?: string }> {
    const file = this.abs(p)
    const body = await fs.readFile(file)
    return { body }
  }

  async exists(p: string): Promise<boolean> {
    const file = this.abs(p)
    try {
      await fs.access(file)
      return true
    } catch {
      return false
    }
  }

  async url(p: string): Promise<string | null> {
    // For local, we don't expose direct URLs; the API will proxy
    return null
  }
}

