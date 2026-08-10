import type { WithId } from 'mongodb';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';

export type AgentAccountRaw = WithId<{
  username: string;
  passwordHash: string;
  displayName: string | null;
  permissions: Permission[];
  settings: AgentUserSettings;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AgentAccount = AgentAccountRaw;

export type AgentAccountPublic = Omit<AgentAccount, 'passwordHash'>;

export type AgentAccountInsertOptions = {
  username: string;
  password: string;
  displayName?: string | null;
  permissions?: Permission[];
};

export type AgentAccountUpdateOptions = Partial<Pick<AgentAccount, 'displayName' | 'permissions' | 'settings'>>;

export type AgentAccountPasskeyCredentialResponse = {
  id: string;
  publicKey: string;
  counter: number;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
}

export type AgentAccountPasskeyCredential = AgentAccountPasskeyCredentialResponse & {
  belongsTo: string; // User ID of the account this credential belongs to
  alias: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentAccountProfile = {
  displayName: string | null;
}