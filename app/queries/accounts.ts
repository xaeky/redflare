export const agentAccountsQuery = defineQueryOptions(() => ({
  key: ['agent-accounts'],
  query: () => useAPI<AgentAccountPublic[]>('/api/admin/accounts'),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined',
}));

export const agentAccountProfileQuery = defineQueryOptions(() => ({
  key: ['agent-account-profile'],
  query: () => useAPI<AgentAccountProfile>('/api/me'),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined',
}));

export const agentAccountPasskeyCredentialsListQuery = defineQueryOptions(
  () => ({
    key: ['agent-account-passkey-credentials'],
    query: () => useAPI<AgentAccountPasskeyCredential[]>('/api/auth/passkey'),
    refetchOnWindowFocus: false,
    enabled: typeof document !== 'undefined',
  }),
);
