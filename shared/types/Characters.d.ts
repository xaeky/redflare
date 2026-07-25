import type { WithId } from "mongodb";

export type CommissionCharacter = Omit<CommissionCharacterRaw, 'base'> & WithId<{
  changelog: CommissionCharacterChangelog[];
  flags: CommissionCharacterFlags | number;
  tasks: CommissionCharacterTask[];
  base: string | ObjectId;
}>
export type WithCharacters<T> = T & { characters: CommissionCharacter[]; };

export enum CommissionCharacterFlags {
  None            = 0,
  NotSafeForWork  = 1 << 0,
  HasRetexture    = 1 << 1,
  HasSetup        = 1 << 2,
  HasVtuber       = 1 << 3,
  HasCustomAssets = 1 << 4,
}

export type CommissionCharacterAttachmentRaw = WithId<{
  filename: string;
  filetype: string;
  size: number; // in bytes
  // This value is true if the attachment doesn't come from the permanent storage bucket yet, and is still in the temp bucket.
  unconfirmed?: boolean;
}>

export interface CommissionCharacterChangelogRaw {
  date: string;
  version: string;
  items: string[];
  attachments?: string[] | CommissionCharacterAttachmentRaw[];
}

export type CommissionCharacterChangelog = Omit<CommissionCharacterChangelogRaw, 'attachments'> & {
  attachments?: string[]; // Array of file IDs
}

export interface CommissionCharacterRaw extends WithId {
  name: string;
  note: string | null;
  changelog: CommissionCharacterChangelogRaw[];
  flags: CommissionCharacterFlags;
  tasks: CommissionCharacterTask[];
  base: AvatarBase;
  created_at: string;
  updated_at: string;
}

export type CommissionCharacterTask = {
  description: string;
  completed: boolean;
}

export type WithCharactersRaw<T> = T & { characters: CommissionCharacterRaw[]; };
export type CommissionCharacterOptions = Pick<CommissionCharacter, 'name' | 'base' | 'note' | 'changelog'>;
export type CommissionCharacterUpdate = Partial<CommissionCharacterOptions>;
