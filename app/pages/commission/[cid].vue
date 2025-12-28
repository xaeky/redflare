<script setup lang="ts">
import type { OptionalId } from 'mongodb';
import { CommissionStatusType } from '~~/shared/enums/Commissions';
import { SharedCommissionReadonlyCharacterChangelog } from '#components';
import type { TimelineItem } from '@nuxt/ui';

const thisRoute = useRoute();
const commissionId = thisRoute.params.cid;
const commission = await useAPI<Omit<WithCharacters<WithCustomer<DeserializedCommission>>, 'secure_note'>>(`/api/public/commissions/${commissionId}`);
type AllowedTimelineValues = CommissionStatusType.InSetup | CommissionStatusType.NextUp | CommissionStatusType.InDevelopment | CommissionStatusType.Showtime;
const commissionTimelineAllowedValues:AllowedTimelineValues[] = [CommissionStatusType.InSetup, CommissionStatusType.NextUp, CommissionStatusType.InDevelopment, CommissionStatusType.Showtime]
const commissionTimeline = ref<TimelineItem[]>([
  {
    title: 'In project setup',
    description: 'We\'ve received your order and it was approved. We are making the project workspace (folders).',
    icon: 'i-lucide-folder-open',
    value: CommissionStatusType.InSetup.toString()
  },
  {
    title: 'Next up',
    description: 'Your commission is next up! Will be under development soon.',
    icon: 'i-lucide-flag',
    value: CommissionStatusType.NextUp.toString()
  },
  {
    title: 'In development',
    description: 'Your commission is under development by the artist.',
    icon: 'i-lucide-brush',
    value: CommissionStatusType.InDevelopment.toString()
  },
  {
    title: 'Showtime',
    description: 'Your commission was delivered by the artist and it\'s ready to use!',
    icon: 'i-lucide-package-check',
    value: CommissionStatusType.Showtime.toString()
  }
]);
const commissionRoutedValues:Record<AllowedTimelineValues, CommissionStatusType[]> = {
  [CommissionStatusType.InSetup]: [CommissionStatusType.InSetup],
  [CommissionStatusType.NextUp]: [CommissionStatusType.NextUp],
  [CommissionStatusType.InDevelopment]: [CommissionStatusType.InDevelopment, CommissionStatusType.InCooldown, CommissionStatusType.Maintenance],
  [CommissionStatusType.Showtime]: [CommissionStatusType.Showtime, CommissionStatusType.Settled]
}

// Overlays
const overlay = useOverlay();
const characterChangelogOverlay = overlay.create(SharedCommissionReadonlyCharacterChangelog);

function routeCommissionStatus(status: CommissionStatusType): CommissionStatusType {
  for (const [key, values] of Object.entries(commissionRoutedValues)) {
    if (values.includes(status)) {
      return Number(key) as CommissionStatusType;
    }
  }
  return status; // fallback if not found
}
const commissionRoutedValue = routeCommissionStatus(commission.status as CommissionStatusType);
const commissionRoutedValueString = computed(() => commissionRoutedValue.toString());

function handleCharacterChangelogOpen(changelog: CommissionCharacterChangelog[]) {
  characterChangelogOverlay.open({ changelog, commission: commission._id });
}

const { isLoggedIn, login } = await usePublicUserSession();
const { user:agentUser } = await useUserSession();
const handleAccountBackClick = () => {
  navigateTo('/me');
};

useSeoMeta({
  title: 'Commission Details'
});
</script>

<template>
  <div class="space-y-4">
    <div class="hidden md:block md:px-8">
      <div v-if="isLoggedIn" class="flex items-center justify-between">
        <UButton
          label="Back to My Account" icon="i-heroicons-arrow-left-16-solid" variant="soft" @click="handleAccountBackClick"
        />
        <PublicSessionCard size="sm" />
      </div>
      <div v-else class="flex justify-end">
        <UButton label="Log in with Discord" icon="i-ic-baseline-discord" @click="() => { login() }" />
      </div>
    </div>
    <div v-if="agentUser && agentUser.settings.forceAgentView" class="md:p-8">
      <UAlert
        variant="outline" color="warning" title="Viewing as Commission Owner"
        icon="i-heroicons-eye-16-solid"
      >
        <template #description>
          You are currently viewing this commission as the owner. To see the public view, please disable the "Force view as owner in commission detail pages" setting in your account settings.
        </template>
      </UAlert>
    </div>
    <div class="flex flex-col lg:flex-row items-stretch space-y-4 md:space-y-0">
      <div class="md:p-8 flex-1 space-y-8">
        <div class="flex gap-2 flex-col md:flex-row items-start md:items-center md:justify-between">
          <h1>Commission</h1>
          <SharedCommissionStatusBadge :status="commission.status" />
        </div>
        <div id="commission_sections" class="space-y-4">
          <section v-if="commissionTimelineAllowedValues.includes(commissionRoutedValue as AllowedTimelineValues)">
            <UTimeline :items="commissionTimeline" v-model="commissionRoutedValueString" />
          </section>
          <section v-if="commission.characters && commission.characters.length" class="space-y-4">
            <h2>Characters</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 select-none">
              <div
                v-for="(char, charIndex) in commission.characters" :key="char.id"
                class="bg-linear-125 from-neutral-800/50 to-primary-500/20 border border-neutral-700/25 p-4 md:p-6 rounded-xl hover:shadow-xl hover:shadow-neutral-950/50 duration-300"
              >
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl font-bold" v-text="char.name"/>
                    <UTooltip text="Character's Order ID">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-hash" class="opacity-50 text-primary-300" />
                        <span class="text-sm font-bold font-mono uppercase select-all">
                          {{ commission._id.substring(commission._id.length - 6) }}-{{ charIndex }}
                        </span>
                      </div>
                    </UTooltip>
                  </div>
                  <span class="font-bold text-primary" v-text="(char.base as AvatarBase).name"/>
                  <span v-if="char.note && char.note.length" class="text-xs" v-text="char.note" />
                  <div v-if="char.changelog && char.changelog.length" class="flex items-center gap-2">
                    <UButton
                      label="View releases" icon="i-lucide-list" variant="soft"
                      @click="handleCharacterChangelogOpen(char.changelog)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section v-if="commission.locked_fields">
            <div class="bg-muted p-4 space-y-4 rounded-lg">
              <div class="flex items-center gap-2 font-bold">
                <UIcon name="i-heroicons-lock-closed-16-solid" class="text-primary"  />
                <p>Log in to view more details about this commission</p>
              </div>
              <div class="space-y-2">
                <div v-if="commission.locked_fields.characters_count !== undefined" class="flex items-center gap-2">
                  <UIcon name="i-heroicons-plus-16-solid" class="text-primary" />
                  <span>Total Characters: {{ commission.locked_fields.characters_count }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div class="md:p-8 lg:w-md border-t lg:border-l border-neutral-700 lg:border-neutral-800 pt-4 md:border-t-0 space-y-4">
        <section class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-clock-16-solid" class="text-primary" />
            <span v-text="new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(commission.created_at))" />
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-user-16-solid" class="text-primary" />
            <span v-text="commission.customer.name" />
            <ULink v-if="commission.customer.vrc_id" :to="`https://vrchat.com/home/user/${commission.customer.vrc_id}`" external target="_blank">
              <UButton size="sm" icon="i-lucide-external-link" variant="soft" color="neutral" />
            </ULink>
          </div>
        </section>
        <section class="space-y-4" v-if="commission.payments && (commission.payments as OptionalId<PaymentTransaction>[]).length">
          <h2>Payments</h2>
          <SharedCommissionReadonlyPayments :payments="(commission.payments as OptionalId<PaymentTransaction>[])" />
        </section>
        <section class="space-y-4" v-if="commission.public_note && commission.public_note.length">
          <h2>Notes</h2>
          <p v-text="commission.public_note" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';

h1 {
  @apply text-3xl font-bold;
}
h2 {
  @apply text-2xl font-bold;
}
h3 {
  @apply text-xl font-bold;
}
</style>