<script setup lang="ts">
const thisRoute = useRoute();
const commissionId = thisRoute.params.cid;
const commission = await useAPI<PublicSerializedCommission>(`/api/public/commissions/${commissionId}`)
</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch space-y-4 md:space-y-0">
    <div class="md:bg-neutral-800 md:p-8 flex-1 space-y-8">
      <div class="flex gap-2 flex-col md:flex-row items-start md:items-center md:justify-between">
        <Hx level="1" class="font-mono md:hidden">#{{ commission.id.slice(0, 4) }}</Hx>
        <Hx level="1" class="font-mono hidden md:block">#{{ commission.id }}</Hx>
        <SharedCommissionStatusBadge :status="commission.status" />
      </div>
      <div id="commission_sections" class="space-y-4">
        <section class="space-y-4">
          <Hx level="2">Characters</Hx>
          <div class="bg-neutral-800/50 border border-neutral-700 p-4 rounded-xl" v-for="char in commission.characters" :key="char.id">
            <div class="flex flex-col gap-2">
              <span class="text-2xl font-bold" v-text="char.name"/>
              <span v-text="char.base.name"/>
            </div>
          </div>
        </section>
        <section class="space-y-4">
          <Hx level="2">Payments</Hx>
          <div class="bg-neutral-800 rounded-xl">
            <UAlert
              title="Payments not implemented yet"
              description="We're going to implement payments soon, we're still migrating to this site!"
              color="primary"
              variant="soft"
              icon="i-lucide-info"
            />
          </div>
        </section>
      </div>
    </div>
    <div class="md:bg-neutral-800/50 md:p-8 lg:w-md border-t border-neutral-700 pt-4 md:border-t-0 space-y-4">
      <div class="bg-neutral-800 p-4 rounded-xl text-sm space-y-2">
        <Hx level="4">Created</Hx>
        <span v-text="new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(commission.created_at))" />
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
      <section class="space-y-4" v-if="commission.note && commission.note.length">
        <Hx level="2">Notes</Hx>
        <p v-text="commission.note" />
      </section>
    </div>
  </div>
</template>