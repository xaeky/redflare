import { z } from 'zod';

export const redflareConfigGeneralSchema = z.object({
  maintenanceMode: z.boolean(),
});

export const redflareConfigKnowledgeBaseSchema = z.object({
  helpLinks: z.object({
    howToUploadAvatarUrl: z.string().url().optional(),
  })
});

export const redflareConfigLegalSchema = z.object({
  privacyPolicyUrl: z.string().url().optional(),
  termsOfServiceUrl: z.string().url().optional(),
});

export const redflareConfigEmailSchema = z.object({
  contact: z.object({
    support: z.string().email().optional(),
    copyright: z.string().email().optional(),
    legal: z.string().email().optional(),
  })
});