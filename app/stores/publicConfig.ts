import _ from 'lodash';

export const usePublicConfigStore = defineStore('publicConfig', () => {
  const configState = reactive<Record<string, any>>({});
  const isReady = ref(false);

  async function fetch() {
    const res = await useAPI('/api/public/config');
    _.assign(configState, res);
    isReady.value = true;
  }

  return {
    configState,
    isReady,
    fetch
  }
});