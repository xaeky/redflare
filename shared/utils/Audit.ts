import { AuditCategory, AuditAction } from '~~/shared/enums/Audit';
import type { SelectItem } from '@nuxt/ui';

export function humanizeAuditCategory(category: AuditCategory): string {
  const categoryMap: Record<AuditCategory, string> = {
    [AuditCategory.Commission]: 'Commission',
    [AuditCategory.Customer]: 'Customer',
    [AuditCategory.AvatarBase]: 'Avatar Base',
    [AuditCategory.DownloadAttachment]: 'Download Attachment'
  };
  return categoryMap[category] || 'Unknown';
}

export function getAllAuditCategoriesValues(as: 'number[]' | 'SelectItem[]' = 'number[]'): number[] | SelectItem[] {
  const categories = Object.values(AuditCategory)
    .filter(value => typeof value === 'number')
    .map(value => value as AuditCategory);
  if (as === 'SelectItem[]') return categories.map(value => ({ label: humanizeAuditCategory(value), value })) as SelectItem[];
  return categories;
}

export function iconizeAuditCategory(category: AuditCategory): string {
  const categoryMap: Record<AuditCategory, string> = {
    [AuditCategory.Commission]: 'i-heroicons-document-text-20-solid',
    [AuditCategory.Customer]: 'i-heroicons-user-circle-solid',
    [AuditCategory.AvatarBase]: 'i-heroicons-photo-16-solid',
    [AuditCategory.DownloadAttachment]: 'i-heroicons-arrow-down-on-square-solid'
  };
  return categoryMap[category] || 'i-heroicons-question-mark-circle-solid';
}

export function humanizeAuditAction(action: AuditAction): string {
  const actionMap: Record<AuditAction, string> = {
    [AuditAction.Create]: 'Created',
    [AuditAction.Update]: 'Updated',
    [AuditAction.Delete]: 'Deleted',
    [AuditAction.Access]: 'Accessed'
  };
  return actionMap[action] || 'Performed Action';
}

export function getAllAuditActionsValues(as: 'number[]' | 'SelectItem[]' = 'number[]'): number[] | SelectItem[] {
  const actions = Object.values(AuditAction)
    .filter(value => typeof value === 'number')
    .map(value => value as AuditAction);
  if (as === 'SelectItem[]') return actions.map(value => ({ label: humanizeAuditAction(value), value })) as SelectItem[];
  return actions;
}

export function iconizeAuditAction(action: AuditAction): string {
  const actionMap: Record<AuditAction, string> = {
    [AuditAction.Create]: 'i-heroicons-plus',
    [AuditAction.Update]: 'i-heroicons-pencil-square-solid',
    [AuditAction.Delete]: 'i-heroicons-trash',
    [AuditAction.Access]: 'i-heroicons-eye-solid'
  };
  return actionMap[action] || 'i-heroicons-question-mark-circle-solid';
}