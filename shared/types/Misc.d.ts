export type Deserialized<T> = Omit<T, '_id'> & { _id: string };

export interface PageAction {
  label: string;
  icon?: string;
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
  variant?: "link" | "solid" | "outline" | "soft" | "subtle" | "ghost";
  action: () => void;
}