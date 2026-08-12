import { z } from 'zod';

export default defineEventHandler(async (event) => {
  const { setSecret } = await useInfisical();
  const { secretName } = getRouterParams(event);
  if (!secretName)
    throw createError({ statusCode: 400, message: 'Missing secret name' });
  const { data, error } = await readValidatedBody(
    event,
    z.object({
      secretValue: z.string().max(4096),
      environment: z.string().optional(),
    }).safeParse,
  );
  if (!data || error)
    throw createError({ statusCode: 400, message: 'Invalid request body' });
  const { secretValue, environment } = data;
  await setSecret(
    secretName,
    secretValue,
    environment?.toString() || undefined,
  );
});
