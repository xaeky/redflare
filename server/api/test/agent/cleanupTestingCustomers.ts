export default defineEventHandler(async (event) => {
  // Cleanup E2E testing customers
  const { deleteOne, filterManyByName } = useCustomerModel();
  const testCustomers = await filterManyByName('E2E');
  for (const customer of testCustomers) {
    logger.info(`Deleting test customer ${customer._id} - ${customer.name}`);
    await deleteOne(customer._id.toString(), true);
  }
  return { message: 'Test customers cleaned up' };
});