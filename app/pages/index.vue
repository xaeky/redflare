<script setup lang="ts">
definePageMeta({
  title: 'Welcome back',
});

// Get agreement URLs from Redflare config
const { config } = useRedflarePublicConfig();
const legalConfig = config.value?.legal as RedflareConfigLegal;

// Check if app has legal pages configured
const appHasConfiguredAgreements = computed(() => {
  if (!legalConfig) return false;
  return !!(
    legalConfig.termsOfServiceUrl?.length &&
    legalConfig.privacyPolicyUrl?.length
  );
});

const legalAgreements = [
  { name: 'Terms of Service', to: legalConfig?.termsOfServiceUrl },
  { name: 'Privacy Policy', to: legalConfig?.privacyPolicyUrl },
];

const isMobile = useMediaQuery('(max-width: 768px)');
</script>

<template>
  <div class="h-full flex items-center justify-center">
    <div class="fixed -z-1 inset-0 opacity-25 pointer-events-none">
      <BackgroundBeams
        :beam-width="1.5"
        :beam-height="25"
        :beam-number="20"
        light-color="#ffffff"
        :speed="3"
        :noise-intensity="1.75"
        :scale="0.2"
        :rotation="45"
      />
    </div>
    <div
      class="sm:hidden fixed -z-1 inset-0 bg-linear-to-t from-neutral-950 via-neutral-950"
    ></div>
    <div class="text-center space-y-4 w-full sm:w-auto relative z-10">
      <div class="py-2 mx-auto">
        <HeaderLogo :size="isMobile ? 'lg' : 'xl'" />
      </div>
      <FrontierViewRealmDiscovery />
      <USeparator v-if="appHasConfiguredAgreements" />
      <div v-if="appHasConfiguredAgreements">
        By signing in, you agree to our
        <span v-for="(page, index) in legalAgreements" :key="index">
          <ULink
            external
            :to="page.to"
            target="_blank"
            class="text-primary-400 hover:underline"
            >{{ page.name }}</ULink
          >
          <span v-if="index < legalAgreements.length - 1"> and </span>
        </span>.
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/global.css";

.rf-login-card {
  @apply flex items-center gap-6 bg-muted/25 w-full rounded-xl p-6;
  .frontier-content {
    @apply flex flex-col gap-4 items-start;
  }
  .welcome-content {
    @apply text-center flex flex-col items-center gap-4;
    .welcome-header {
      @apply flex items-center gap-2;
    }
  }
  .card-content {
    @apply flex flex-col gap-4 items-start;
  }
  .card-icon {
    @apply inline-flex text-primary-400 bg-neutral-950/50 p-4 rounded-full;
  }
}

h1 {
  @apply text-3xl font-bold;
}
h2 {
  @apply text-2xl font-bold;
}
</style>
