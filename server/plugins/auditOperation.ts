import { AuditCategory, AuditAction } from '~~/shared/enums/Audit';
import { H3Event } from 'h3';

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event: H3Event) => {
    const route = event.path;
    const method = event.method;
    const trackPerRoute = [
      // Avatar bases
      {
        pathRegex: /^\/api\/commissions\/bases$/,
        method: 'POST',
        category: AuditCategory.AvatarBase,
        action: AuditAction.Create
      },
      {
        pathRegex: /^\/api\/commissions\/bases\/[^/]+$/,
        method: 'PUT',
        category: AuditCategory.AvatarBase,
        action: AuditAction.Update
      },
      {
        pathRegex: /^\/api\/commissions\/bases\/[^/]+$/,
        method: 'DELETE',
        category: AuditCategory.AvatarBase,
        action: AuditAction.Delete
      },
      // Commissions
      {
        pathRegex: /^\/api\/commissions$/,
        method: 'POST',
        category: AuditCategory.Commission,
        action: AuditAction.Create
      },
      {
        pathRegex: /^\/api\/commissions\/[^/]+$/,
        method: 'PUT',
        category: AuditCategory.Commission,
        action: AuditAction.Update
      },
      {
        pathRegex: /^\/api\/commissions\/[^/]+$/,
        method: 'DELETE',
        category: AuditCategory.Commission,
        action: AuditAction.Delete
      },
      // Customer
      {
        pathRegex: /^\/api\/customers$/,
        method: 'POST',
        category: AuditCategory.Customer,
        action: AuditAction.Create
      },
      {
        pathRegex: /^\/api\/customers\/[^/]+$/,
        method: 'PUT',
        category: AuditCategory.Customer,
        action: AuditAction.Update
      },
      {
        pathRegex: /^\/api\/customers\/[^/]+$/,
        method: 'DELETE',
        category: AuditCategory.Customer,
        action: AuditAction.Delete
      },
      // Billing transactions
      {
        pathRegex: /^\/api\/commissions\/(.*)\/billing$/,
        method: 'POST',
        category: AuditCategory.BillingTransaction,
        action: AuditAction.Create
      },
      {
        pathRegex: /^\/api\/commissions\/(.*)\/billing\/[^/]+$/,
        method: 'PATCH',
        category: AuditCategory.BillingTransaction,
        action: AuditAction.Update
      },
      {
        pathRegex: /^\/api\/commissions\/(.*)\/billing\/[^/]+$/,
        method: 'DELETE',
        category: AuditCategory.BillingTransaction,
        action: AuditAction.Delete
      }
    ];
    // Handle audit logging when conditions are met (route and method)
    const requestMatch = trackPerRoute.find((routeConfig) => {
      return routeConfig.pathRegex.test(route) && routeConfig.method === method;
    });

    if (!requestMatch) return; // No matching route for auditing

    logger.withTag('auditOperation').info(`Auditing operation for: ${method} ${route}`);
    await auditOperation(event, {
      category: requestMatch.category,
      action: requestMatch.action,
      details: event.context.audit,
    });
  });
});