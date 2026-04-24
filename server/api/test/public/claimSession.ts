export default defineEventHandler(async (event) => {
  const customer = await useCustomerModel().findOneWithCommission();
  await setPublicUserSession(event, {
    user: {
      username: customer.name,
      id: customer.discord_id!,
      discriminator: '0',
      global_name: customer.name
    } as DiscordOAuthUser,
    secure: {
      access_token: 'test',
      customer: customer._id.toString()
    }
  });
  await initCurrentUserSettings(event);
  logger.info(`Test public session claimed for customer ${customer._id}`);
  return sendRedirect(event, '/me');
});