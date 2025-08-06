declare module '#app' {
  interface PageMeta {
    description?: string;
    actions?: {
      label: string;
      icon?: string;
      color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
      variant?: "link" | "solid" | "outline" | "soft" | "subtle" | "ghost";
      action: () => void;
    }[]
  }
}

export {}