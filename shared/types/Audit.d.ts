import { AuditAction, AuditCategory } from '~~/shared/enums/Audit';

export interface AuditBase {
  author_id: string;
  author_nickname: string;
  action: AuditAction;
  category: AuditCategory;
  details: Record<string, any>;
  created_at: string;
}

export type WithoutAuthor<T extends AuditBase | AuditInsertOptions> = Omit<T, 'author_id' | 'author_nickname'>;

export interface AuditCustomer extends AuditBase {
  action: AuditAction.Create | AuditAction.Update | AuditAction.Delete;
  category: AuditCategory.Customer;
  details: {
    customer_id: string;
  }
}

export interface AuditCommission extends AuditBase {
  action: AuditAction.Create | AuditAction.Update | AuditAction.Delete;
  category: AuditCategory.Commission;
  details: {
    commission_id: string;
  }
}

export interface AuditAvatarBase extends AuditBase {
  action: AuditAction.Create | AuditAction.Update | AuditAction.Delete;
  category: AuditCategory.AvatarBase;
  details: {
    avatar_base_id: string;
  }
}

export interface AuditDownloadAttachment extends AuditBase {
  action: AuditAction.Access;
  category: AuditCategory.DownloadAttachment;
  details: {
    file_id: string;
  }
}

export type Audit = AuditCustomer
  | AuditCommission
  | AuditAvatarBase
  | AuditDownloadAttachment;

export type AuditInsertOptions = Omit<Audit, 'created_at'>;