// Characters

export enum CommissionCharacterFlags {
  None           = 0,
  NotSafeForWork = 1 << 0,
  HasRetexture   = 1 << 1,
  HasSetup       = 1 << 2,
  HasVtuber      = 1 << 3,
}

export interface CommissionCharacterChangelog {
  date: string;
  items: string[];
}

export interface CommissionCharacter {
  id: string;
  name: string;
  note: string | null;
  changelog: CommissionCharacterChangelog[];
  flags: CommissionCharacterFlags | number;
  base: string;
  created_at: string;
  updated_at: string;
}

export type CommissionCharacterOptions = Pick<CommissionCharacter, 'name' | 'base' | 'note' | 'changelog'>;
export type CommissionCharacterUpdate = Partial<CommissionCharacterOptions>;

export type WithCharacters<T> = T & { characters: CommissionCharacter[]; };