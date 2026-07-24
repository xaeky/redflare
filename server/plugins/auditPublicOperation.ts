import { AuditCategory, AuditAction } from '~~/shared/enums/Audit';
import { H3Event } from 'h3';

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event: H3Event) => {
    const route = event.path;
    const method = event.method;
    // Only track public routes (/api/public/*)
    if (!route.startsWith('/api/public/')) return;
    const trackPerRoute = [
      // Attachments
      {
        pathRegex: /^\/api\/public\/commissions\/(.*)\/retrieve_attachment/,
        method: 'GET',
        category: AuditCategory.DownloadAttachment,
        action: AuditAction.Access
      }
    ];

    const requestMatch = trackPerRoute.find((routeConfig) => {
      const regex = new RegExp(routeConfig.pathRegex);
      return regex.test(route) && method === routeConfig.method;
    });

    if (!requestMatch) return;

    logger.withTag('auditPublicOperation').info(`Auditing public operation for: ${method} ${route}`);
    await auditPublicOperation(event, {
      category: requestMatch.category,
      action: requestMatch.action,
      details: event.context.audit
    });
  });
});