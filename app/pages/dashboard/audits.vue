<script setup lang="ts">
import { auditsQuery } from '~/queries/audits';
import { AuditCategory, AuditAction } from '~~/shared/enums/Audit';
import { humanizeAuditAction, humanizeAuditCategory,
  getAllAuditCategoriesValues, getAllAuditActionsValues,
  iconizeAuditAction, iconizeAuditCategory } from '~~/shared/utils/Audit';

const page = ref(1);
const filtersCategoryValue = ref<AuditCategory | undefined>(undefined);
const filtersCategoryOptions = getAllAuditCategoriesValues('SelectItem[]');
const filtersActionValue = ref<AuditAction | undefined>(undefined);
const filtersActionOptions = getAllAuditActionsValues('SelectItem[]');
const openedDetails = ref<number>(-1);

const { data: audits, refetch: auditsRefetch } = useQuery(auditsQuery, () => ({
  filters: {
    category: filtersCategoryValue.value,
    action: filtersActionValue.value,
  } as Partial<Audit>,
  page: page.value,
  sorting: { by: 'created_at', order: -1 as -1 }
}));

const actions:PageAction[] = [
  {
    label: 'Refresh',
    icon: 'i-heroicons-arrow-path-16-solid',
    color: 'neutral',
    variant: 'subtle',
    action: () => { auditsRefetch(); }
  }
];

definePageMeta({
  title: 'Audits',
  description: 'View the audit logs of the system.',
  middleware: 'auth',
  layout: 'backoffice',
  keepalive: true
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <BackofficeHeaderActions :actions />
    <div class="rf_auditfilters">
      <USelectMenu
        v-model="filtersCategoryValue"
        :items="filtersCategoryOptions"
        clear
        value-key="value"
        placeholder="Filter by category"
      />
      <USelectMenu
        v-model="filtersActionValue"
        :items="filtersActionOptions"
        clear
        value-key="value"
        placeholder="Filter by action"
      />
    </div>
    <ul v-if="audits?.data" class="rf_auditslist">
      <li v-for="(audit, auditIndex) in audits.data" :key="auditIndex" class="rf_audititem" @click="openedDetails = openedDetails === auditIndex ? -1 : auditIndex">
        <div class="rf_auditheader">
          <div
            class="rf_auditheader-item rf_auditaction_label"
            :class="{
              'text-primary': audit.action !== AuditAction.Delete,
              'text-error': audit.action === AuditAction.Delete
            }"
          >
            <UIcon :name="iconizeAuditAction(audit.action)" />
            <span v-text="humanizeAuditAction(audit.action)" />
          </div>
          <div class="rf_auditheader-item rf_auditcategory_label">
            <UIcon :name="iconizeAuditCategory(audit.category)" />
            <span v-text="humanizeAuditCategory(audit.category)" />
          </div>
        </div>
        <div class="rf_auditcontents" v-show="openedDetails === auditIndex" @click.stop>
          <Shiki lang="json" :code="JSON.stringify(audit.details, null, 2)" as="span" />
        </div>
        <div class="rf_auditfooter">
          <span v-text="audit.author_nickname" />
          <UTooltip :text="useDateFormat(audit.created_at, 'YYYY-MM-DD HH:mm:ss').value">
            <span v-text="useTimeAgo(audit.created_at)" />
          </UTooltip>
        </div>
      </li>
    </ul>
    <div v-if="audits?.data" class="rf_auditpaginator">
      <UPagination
        v-model:page="page"
        :items-per-page="50"
        :total="audits.total"
      />
    </div>
  </div>
</template>

<style scoped>
@reference '~/assets/global.css';
.rf_auditfilters {
  @apply flex gap-2;
}

.rf_auditslist {
  @apply space-y-2;
  .rf_audititem {
    @apply bg-elevated/25 p-3 rounded-md border border-muted/50 duration-100 cursor-pointer space-y-2 select-none;
    &:hover {
      @apply bg-elevated/50;
    }
    .rf_auditcontents {
      @apply cursor-auto select-text;
    }
    .rf_auditheader {
      @apply flex items-center gap-2;
      .rf_auditheader-item {
        @apply flex items-center gap-2;
      }
      .rf_auditaction_label {
        @apply font-bold;
      }
    }
    .rf_auditfooter {
      @apply flex justify-between text-sm text-muted;
    }
  }
}

.rf_auditpaginator {
  @apply flex justify-center;
}
</style>