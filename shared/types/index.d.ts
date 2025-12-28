export interface AgentUserSettings {
  forceAgentView?: boolean;
  [key: string]: any;
}

declare module '#app' {
  interface PageMeta {
    description?: string;
  }
}

declare module '#auth-utils' {
  interface User {
    sub: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
    settings: AgentUserSettings
  }
  interface SecureSessionData {
    access_token: string;
    refresh_token: string;
    id_token: string;
  }
}

export {}