export const notesQuery = defineQueryOptions({
  key: ['notes'],
  query: () => useAPI<Note[]>('/api/notes').then((res) => res),
  refetchOnWindowFocus: false,
  enabled: typeof document !== 'undefined'
})