import type { SelectItem } from '@nuxt/ui';

export function enumToSelectItems<T extends Record<string, string | number>>(enumObj: T): SelectItem[] {
  return Object.entries(enumObj)
    .filter(([key, value]) => typeof value === 'number') // Filter out string values
    .map(([key, value]) => ({
      label: key,
      value: value as number
    }));
}