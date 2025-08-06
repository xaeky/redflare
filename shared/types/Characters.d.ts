// Characters

export enum CommissionCharacterFlags {
  None           = 0,
  NotSafeForWork = 1 << 0,
  HasRetexture   = 1 << 1,
  HasSetup       = 1 << 2,
  HasVtuber      = 1 << 3,
}

export interface CommissionCharacter {
  id: string;
  name: string;
  note: string | undefined;
  changelog: Record<string, string> | undefined;
  flags: CommissionCharacterFlags | number;
  base: string;
  created_at: string;
  updated_at: string;
}

export type CommissionCharacterOptions = Pick<CommissionCharacter, 'name'> & { note?: string; changelog?: Record<string, string>; commission: string; base: string; };
export type CommissionCharacterUpdate = Partial<CommissionCharacterOptions>;

export type WithCharacters<T> = T & { characters: CommissionCharacter[]; };