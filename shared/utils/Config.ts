import { z } from 'zod';

export const redflareConfigGeneralSchema = z.object({
  maintenanceMode: z.boolean().default(false),
});

export const redflareConfigKnowledgeBaseSchema = z.object({
  helpLinks: z.object({
    howToUploadAvatarUrl: z.string().url().optional().default(''),
  })
});

export const redflareConfigLegalSchema = z.object({
  privacyPolicyUrl: z.string().url().optional().default(''),
  termsOfServiceUrl: z.string().url().optional().default(''),
});

export const redflareConfigEmailSchema = z.object({
  contact: z.object({
    support: z.string().email().optional().default(''),
    copyright: z.string().email().optional().default(''),
    legal: z.string().email().optional().default(''),
  })
});