interface DiscordUserAvatarDecorator {
  asset: string;
  sku_id: string;
}

interface DiscordUserCollectable {
  nameplate: {
    sku_id: string;
    asset: string;
    label: string;
    palette: string;
  }
}

interface DiscordUserPrimaryGuild {
  identity_guild_id?: string;
  identity_enabled?: boolean;
  tag?: string;
  badge?: string;
}

interface DiscordOAuthUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string | null;
  global_name?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: DiscordUserAvatarDecorator | null;
  collectables?: DiscordUserCollectable | null;
  primary_guild?: DiscordUserPrimaryGuild | null;
}