import { z } from 'zod';
import type { H3Event } from 'h3';

export const verifyTurnstileToken = async (token: string, event: H3Event): Promise<TurnstileValidationResponse> => {
  const { turnstile } = useRuntimeConfig(event);
  if (!token) throw createError({ status: 400, message: 'Turnstile token is required.' });
  if (!turnstile.secret_key) throw createError({ status: 500, message: 'Turnstile secret key is not configured.' });
  return await $fetch<TurnstileValidationResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: turnstile.secret_key,
      response: token,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });
};

export const needTurnstileVerification = async (event: H3Event<EventHandlerRequest>) => {
  const { data, error } = await readValidatedBody(event, z.object({ turnstileToken: z.string() }).safeParse);
  if (!data || error) throw createError({ status: 400, message: 'Turnstile token is required.' });
  const tokenResponse = await verifyTurnstileToken(data.turnstileToken, event);
  if (!tokenResponse.success) {
    logger.withTag('turnstile').error('Turnstile verification failed', tokenResponse['error-codes']);
    throw createError({ status: 403, message: 'Invalid Turnstile token.' });
  };
  return true;
};