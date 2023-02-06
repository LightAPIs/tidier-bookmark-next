<template>
  <a-table :columns="columns" :data-source="data" :locale="locale" class="rules-table">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'enable'">
        <a-switch :checked="record.enable" @change="onSwitchChange(record.key, $event)" />
      </template>
      <template v-else-if="column.key === 'reg'">
        <b class="reg-separator">/</b>{{ record.pattern }}<b class="reg-separator">/</b><em class="reg-flags">{{ record.flags.join('') }}</em>
      </template>
      <template v-else-if="column.key === 'replacement'">
        <replacement-string :text="record.replacement"></replacement-string>
      </template>
      <template v-else-if="column.key === 'operation'">
        <a-space>
          <a-button type="primary" @click="handleEdit(record.key)">{{ $i18n('rulesOperationEditText') }}</a-button>
          <a-popconfirm
            :title="$i18n('rulesDeleteTip')"
            :ok-text="$i18n('bookmarkOkText')"
            :cancel-text="$i18n('bookmarkCancelText')"
            @confirm="onDelete(record.key)"
          >
            <a-button type="danger">{{ $i18n('rulesOperationDeleteText') }}</a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
    <template #customFilterDropdown="{ selectedKeys, setSelectedKeys, confirm, clearFilters, column }">
      <div class="filter-dropdown">
        <a-input
          ref="searchInput"
          :value="selectedKeys[0]"
          :placeholder="filterPlaceholders[column.key]"
          class="filter-input"
          @change="(e: InputChangeEvent) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => confirm()"
        />
        <a-button type="primary" size="small" class="filter-btn search-btn" @click="() => confirm()">
          <template #icon>
            <search-outlined></search-outlined>
          </template>
          {{ $i18n('rulesFilterSearchText') }}
        </a-button>
        <a-button size="small" class="filter-btn" @click="() => clearFilters({ confirm: true })">
          {{ $i18n('rulesFilterResetText') }}
        </a-button>
      </div>
    </template>
    <template #customFilterIcon="{ filtered }">
      <search-outlined :class="{ filtered: filtered }"></search-outlined>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TableColumnProps } from 'ant-design-vue';
import type { TableLocale } from 'ant-design-vue/es/table/interface';
import { SearchOutlined } from '@ant-design/icons-vue';
import ReplacementString from '@/components/ReplacementString.vue';
import { i18n } from '@/common/ui';

interface InputChangeEvent {
  target: {
    value: string;
  };
}

defineProps<{
  data: RuleDataItem[];
}>();

const emit = defineEmits<{
  (e: 'switch', key: number, checked: boolean): void;
  (e: 'edit', key: number): void;
  (e: 'delete', key: number): void;
}>();

const searchInput = ref<HTMLInputElement | null>(null);

const columns: TableColumnProps<RuleDataItem>[] = [
  {
    title: i18n('rulesTableEnableText'),
    key: 'enable',
    width: 100,
    align: 'center',
  },
  {
    title: i18n('rulesTableIndexText'),
    dataIndex: 'index',
    key: 'index',
    width: 100,
    align: 'center',
    sorter: (a, b) => a.index - b.index,
  },
  {
    title: i18n('rulesTableNameText'),
    dataIndex: 'name',
    key: 'name',
    customFilterDropdown: true,
    onFilter: (value, record) => filter(record.name, value as string),
    onFilterDropdownVisibleChange: filterVisible,
  },
  {
    title: i18n('rulesTableRegText'),
    key: 'reg',
    customFilterDropdown: true,
    onFilter: (value, record) => filter(record.pattern, value as string),
    onFilterDropdownVisibleChange: filterVisible,
  },
  {
    title: i18n('rulesTableReplacementText'),
    dataIndex: 'replacement',
    key: 'replacement',
    customFilterDropdown: true,
    onFilter: (value, record) => filter(record.replacement, value as string),
    onFilterDropdownVisibleChange: filterVisible,
  },
  {
    title: i18n('rulesTableOperationText'),
    dataIndex: 'operation',
    key: 'operation',
    width: '200px',
  },
];

const locale: TableLocale = {
  triggerAsc: i18n('triggerAsc'),
  triggerDesc: i18n('triggerDesc'),
  cancelSort: i18n('cancelSort'),
};

const filterPlaceholders: {
  [key: string]: string;
} = {
  name: i18n('rulesFilterSearchPlaceholder', i18n('rulesTableNameText')),
  reg: i18n('rulesFilterSearchPlaceholder', i18n('rulesEditPatternLabel')),
  replacement: i18n('rulesFilterSearchPlaceholder', i18n('rulesTableReplacementText')),
};

function filterVisible(v: boolean) {
  if (v) {
    setTimeout(() => {
      searchInput.value?.focus();
    }, 100);
  }
}

function filter(keyword: string, value: string): boolean {
  return keyword.toLowerCase().includes(value.toLowerCase());
}

function onSwitchChange(key: number, checked: boolean) {
  emit('switch', key, checked);
}

function handleEdit(key: number) {
  emit('edit', key);
}

function onDelete(key: number) {
  emit('delete', key);
}
</script>

<style lang="less">
.rules-table {
  .reg-separator {
    color: red;
  }
  .reg-flags {
    color: #59c463;
  }
}
.filter-dropdown {
  padding: 8px;
  .filter-input {
    width: 240px;
    margin-bottom: 8px;
    display: block;
  }
  .filter-btn {
    width: 90px;
  }
  .search-btn {
    margin-right: 8px;
  }
  .filtered {
    color: @filtered-color;
  }
}
</style>
