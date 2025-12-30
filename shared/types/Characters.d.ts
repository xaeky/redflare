// Shared
export type CommissionCharacter = Omit<CommissionCharacterRaw, 'base'> & {
  id: string;
  changelog: CommissionCharacterChangelog[];
  flags: CommissionCharacterFlags | number;
  base: string | ObjectId;
}
export type WithCharacters<T> = T & { characters: CommissionCharacter[]; };
// Server
export enum CommissionCharacterFlags {
  None            = 0,
  NotSafeForWork  = 1 << 0,
  HasRetexture    = 1 << 1,
  HasSetup        = 1 << 2,
  HasVtuber       = 1 << 3,
  HasCustomAssets = 1 << 4,
}
export interface CommissionCharacterAttachmentRaw {
  id: string;
  filename: string;
  filetype: string;
  size: number; // in bytes
}
export interface CommissionCharacterChangelogRaw {
  date: string;
  version: string;
  items: string[];
  attachments?: CommissionCharacterAttachmentRaw[];
}
export type CommissionCharacterChangelog = Omit<CommissionCharacterChangelogRaw, 'attachments'> & {
  attachments?: string[]; // Array of file IDs
}
export interface CommissionCharacterRaw {
  id: ObjectId;
  name: string;
  note: string | null;
  changelog: CommissionCharacterChangelogRaw[];
  flags: CommissionCharacterFlags;
  base: AvatarBase;
  created_at: string;
  updated_at: string;
}
export type WithCharactersRaw<T> = T & { characters: CommissionCharacterRaw[]; };
export type CommissionCharacterOptions = Pick<CommissionCharacter, 'name' | 'base' | 'note' | 'changelog'>;
export type CommissionCharacterUpdate = Partial<CommissionCharacterOptions>;
