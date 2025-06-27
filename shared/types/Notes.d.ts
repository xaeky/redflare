export interface Note {
  id: string;
  author: string;
  content: string;
  created_at: string | number | Date;
  updated_at: string | number | Date;
}

export type NoteOptions = Omit<Note, 'id' | 'author' | 'created_at' | 'updated_at'>;
