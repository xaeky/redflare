<script setup lang="ts">
import * as z from 'zod';

const apiBusy = ref(false);
const apiResult = ref();
const apiError = ref<string | null>(null);
// Form
const schema = z.object({
  endpoint: z.string().min(1, 'Endpoint is required').startsWith('/api/', 'Endpoint must start with "/api/"'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  body: z.string().optional().refine(value => {
    if (value === undefined || value.trim() === '') return true; // Allow empty body
    try {
      JSON.parse(value);
      return true; // Valid JSON
    } catch {
      return false; // Invalid JSON
    }
  }, 'Body must be valid JSON')
});
type Schema = z.output<typeof schema>;
const state = reactive<Schema>({
  endpoint: '',
  method: 'GET',
  body: '{}'
})


async function handleRequest() {
  apiBusy.value = true;
  apiError.value = null;
  apiResult.value = null;
  try {
    const result = await useAPI(state.endpoint, {
      method: state.method,
      body: state.method !== 'GET' ? JSON.parse(state.body as string) : undefined
    });
    apiBusy.value = false;
    apiResult.value = result;
  } catch (error) {
    apiBusy.value = false;
    apiError.value = error instanceof Error ? error.message : 'An unknown error occurred';
    return;
  }
}

definePageMeta({
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div id="dev_endpoint_test" class="space-y-8">
    <Hx level="1">Endpoint test</Hx>
    <UForm :schema :state @submit="handleRequest" class="space-y-4">
      <div class="flex gap-4">
        <UFormField name="method" label="Method" class="w-32">
          <USelect v-model="state.method" :items="['GET', 'POST', 'PUT', 'DELETE']" class="w-full" />
        </UFormField>
        <UFormField name="endpoint" label="Endpoint" class="flex-grow">
          <UInput label="Endpoint" v-model="state.endpoint" class="w-full" />
        </UFormField>
      </div>
      <UFormField name="body" label="Body (JSON)" v-if="state.method !== 'GET'">
        <UTextarea label="Body" v-model="state.body" class="w-full" />
      </UFormField>
      <div>
        <UButton label="Send request" type="submit" />
      </div>
    </UForm>
    <div>
      <div v-if="apiResult && !apiBusy" class="mt-8">
        <Hx level="2">Response</Hx>
        <pre v-text="JSON.stringify(apiResult, null, 2)" class="bg-neutral-800 p-4 rounded-lg"></pre>
      </div>
      <div v-if="apiError && !apiBusy" class="mt-8">
        <Hx level="2">Error</Hx>
        <UAlert
          title="API Error"
          :description="apiError"
          color="error"
          variant="subtle"
        />
      </div>
      <div v-else-if="apiBusy">
        <Hx level="2">Fetching...</Hx>
      </div>
    </div>
  </div>
</template>