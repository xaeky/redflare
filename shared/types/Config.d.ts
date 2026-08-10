import { RedflareConfigCategory } from '~~/shared/enums/Config';

export type { RedflareConfigCategory };

export type WithoutCategory<T extends RedflareConfig> = Omit<T, 'category'>;

export type RedflareConfigBase = {
  category: RedflareConfigCategory;
}

export type RedflareConfigGeneral = RedflareConfigBase & {
  category: RedflareConfigCategory.General;
  maintenanceMode: boolean;
}

export type RedflareConfigKnowledgeBase = RedflareConfigBase & {
  category: RedflareConfigCategory.KnowledgeBase;
  helpLinks: {
    howToUploadAvatarUrl: string;
  }
}

export type RedflareConfigLegal = RedflareConfigBase & {
  category: RedflareConfigCategory.Legal;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export type RedflareConfigEmail = RedflareConfigBase & {
  category: RedflareConfigCategory.Email;
  contact: {
    support: string;
    copyright: string;
    legal: string;
  }
}

export type RedflareConfigAuthSetup = RedflareConfigBase & {
  category: RedflareConfigCategory.AuthSetup;
  locked: boolean;
  lockedAt?: string;
  lockedByUsername?: string;
}

export type RedflareConfig = RedflareConfigGeneral
  | RedflareConfigKnowledgeBase
  | RedflareConfigLegal
  | RedflareConfigEmail
  | RedflareConfigAuthSetup;

export type RedflareConfigUpsertOptions = WithoutCategory<Partial<RedflareConfig>>;