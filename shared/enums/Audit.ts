export enum AuditAction {
  Create = 1 << 0,
  Update = 1 << 1,
  Delete = 1 << 2,
  Access = 1 << 3,
}

export enum AuditCategory {
  Customer = 1 << 0,
  Commission = 1 << 1,
  AvatarBase = 1 << 2,
  DownloadAttachment = 1 << 3
}