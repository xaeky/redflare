import { WithId } from "mongodb";

export async function getAllConfig() {
  const configModel = useConfigModel();
  const allConfig = await configModel.getAll();
  // Convert the config array to an object with category as the key
  const configObject: Record<RedflareConfigCategory | string, RedflareConfig> = {};
  allConfig.forEach((config: Partial<WithId<RedflareConfig>>) => {
    const category = config.category as RedflareConfigCategory;
    configObject[category] = config as RedflareConfig;
    delete config.category;
    delete config._id;
  });
  return configObject;
};

export async function getConfigByCategory(category: RedflareConfigCategory) {
  return useConfigModel().getByCategory(category);
};
