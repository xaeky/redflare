<script setup lang="ts">
import { CommissionStatusType } from '~~/shared/enums/Commissions';
import type { TimelineItem } from '@nuxt/ui'

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
console.log(commission)
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch space-y-4 md:space-y-0">
    <div class="md:p-8 flex-1 space-y-8">
      <div class="flex gap-2 flex-col md:flex-row items-start md:items-center md:justify-between">
        <Hx level="1">Commission</Hx>
        <SharedCommissionStatusBadge :status="commission.status" />
      </div>
      <div id="commission_sections" class="space-y-4">
        <section v-if="commissionTimelineAllowedValues.includes(commissionRoutedValue as AllowedTimelineValues)">
          <UTimeline :items="commissionTimeline" v-model="commissionRoutedValueString" />
        </section>
        <section v-if="commission.characters.length" class="space-y-4">
          <Hx level="2">Characters</Hx>
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
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div class="md:p-8 lg:w-md border-t lg:border-l border-neutral-700 lg:border-neutral-800 pt-4 md:border-t-0 space-y-4">
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="bg-neutral-800 p-4 rounded-xl text-sm space-y-2">
          <Hx level="3">Created</Hx>
          <span v-text="new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(commission.created_at))" />
        </div>
        <div class="bg-neutral-800 p-4 rounded-xl text-sm space-y-2">
          <Hx level="3">Modified</Hx>
          <span v-text="new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(commission.updated_at))" />
        </div>
      </div>
      <section class="space-y-4">
        <Hx level="2">Customer</Hx>
        <div class="flex flex-col gap-2 p-4 rounded-xl border border-neutral-700">
          <span class="text-xl" v-text="commission.customer.name" />
          <ULink v-if="commission.customer.vrc_id" :to="`https://vrchat.com/home/user/${commission.customer.vrc_id}`" external target="_blank">
            <UButton
              label="Visit VRChat's profile" color="neutral"
              icon="i-lucide-external-link" variant="soft"
            />
          </ULink>
        </div>
      </section>
      <section class="space-y-4" v-if="commission.public_note && commission.public_note.length">
        <Hx level="2">Notes</Hx>
        <p v-text="commission.public_note" />
      </section>
      <section class="space-y-4">
        <Hx level="2">Payments</Hx>
        <div class="bg-neutral-800 rounded-xl">
          <UAlert
            title="Payments are not implemented yet"
            description="We're going to implement payments soon, we're still migrating to this site!"
            color="primary"
            variant="soft"
            icon="i-lucide-info"
          />
        </div>
      </section>
    </div>
  </div>
</template>