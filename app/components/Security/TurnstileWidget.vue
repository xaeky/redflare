<script setup lang="ts">
type ActiveHeadEntry = ReturnType<typeof useHead>;

const emit = defineEmits<{
  verified: [token: string];
  expired: [];
  error: [];
}>();

const { public: config } = useRuntimeConfig();
const turnstileConfig = config.turnstile as { site_key: string };

const el = ref<HTMLDivElement | null>(null);
let turnstileWidgetScript: ActiveHeadEntry | null = null;
let widgetId: string | undefined;
// Unique per-instance global callback name, since Turnstile's `onload` param calls a single global function
const onloadCallbackName = `onloadTurnstile_${Math.random().toString(36).slice(2)}`;

function renderWidget() {
  const turnstile = (window as any).turnstile;
  if (!el.value || !turnstile) return;
  widgetId = turnstile.render(el.value, {
    sitekey: turnstileConfig.site_key,
    callback: (token: string) => emit('verified', token),
    'expired-callback': () => emit('expired'),
    'error-callback': () => emit('error')
  });
}

function resetWidget() {
  if (!widgetId) return;
  (window as any).turnstile?.reset(widgetId);
}

onMounted(() => {
  // If another widget instance already loaded the API, it's ready immediately — no need to wait for `onload`.
  if ((window as any).turnstile) {
    renderWidget();
    return;
  }

  (window as any)[onloadCallbackName] = renderWidget;
  turnstileWidgetScript = useHead({
    script: [
      {
        src: `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${onloadCallbackName}&render=explicit`,
        defer: true
      }
    ]
  });
});

onBeforeUnmount(() => {
  if (widgetId) (window as any).turnstile?.remove(widgetId);
  delete (window as any)[onloadCallbackName];
  if (!turnstileWidgetScript) return;
  turnstileWidgetScript.dispose();
});

defineExpose({
  resetWidget
});
</script>

<template>
  <div ref="el"></div>
</template>