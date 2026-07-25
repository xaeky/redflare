import { z } from 'zod';

export const redflareConfigGeneralSchema = z.object({
  maintenanceMode: z.boolean().default(false),
});

export const redflareConfigKnowledgeBaseSchema = z.object({
  helpLinks: z.object({
    howToUploadAvatarUrl: z.union([z.literal(''), z.string().url()]).optional().nullable().default(''),
  }).default({
    howToUploadAvatarUrl: ''
  })
});

export const redflareConfigLegalSchema = z.object({
  privacyPolicyUrl: z.union([z.literal(''), z.string().url()]).optional().nullable().default(''),
  termsOfServiceUrl: z.union([z.literal(''), z.string().url()]).optional().nullable().default(''),
});

export const redflareConfigEmailSchema = z.object({
  contact: z.object({
    support: z.union([z.literal(''), z.string().email()]).optional().nullable().default(''),
    copyright: z.union([z.literal(''), z.string().email()]).optional().nullable().default(''),
    legal: z.union([z.literal(''), z.string().email()]).optional().nullable().default(''),
  }).default({
    support: '',
    copyright: '',
    legal: ''
  })
});