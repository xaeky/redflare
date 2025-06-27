declare module '#auth-utils' {
  interface User {
    sub: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
  }
  interface SecureSessionData {
    access_token: string;
    refresh_token: string;
    id_token: string;
  }
}

export {}