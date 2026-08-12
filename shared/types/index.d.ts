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
  interface SecureSessionData {
    webauthnChallenges?: Record<string, string>;
  }
  interface User {
    id: string;
    username: string;
    displayName?: string | null;
    permissions: Permission[];
    settings: AgentUserSettings;
  }
}
