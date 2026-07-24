import 'h3'

declare module 'h3' {
  interface H3EventContext {
    audit?: record<string, any>
  }
}

export {}