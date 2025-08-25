// Local augmentation to ensure Fastify sees cookie helpers in this service's TS build
import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    cookies?: Record<string, string>
    unsignCookie?: (value: string) => { valid: boolean; value: string | null; renewed?: boolean }
  }
  interface FastifyReply {
    setCookie: (name: string, value: string, options?: any) => this
    clearCookie: (name: string, options?: any) => this
  }
}

