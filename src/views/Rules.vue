<template>
  <div id="rules-component">
    <a-space class="btn-group">
      <a-button id="rules-add-btn" class="btn" @click="onAddClick">{{ $i18n('rulesHandleAddText') }}</a-button>
      <a-button id="rules-test-btn" class="btn" @click="onTestClick">{{ $i18n('rulesEditTestText') }}</a-button>
    </a-space>
    <rules-table :data="data" @switch="onSwitchClick" @delete="onDeleteClick" @edit="onEditClick"></rules-table>
    <edit-modal
      v-model:visible="ruleFormVisible"
      :is-edit="ruleFormEdit"
      :max="count"
      container="rules-component"
      :form-data="ruleFormData"
      @confirm="onConfirm"
    ></edit-modal>
    <test-modal v-model:visible="testModalVisible" container="rules-component" :data="data"></test-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRaw, computed, onBeforeMount, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import RulesTable from '@/components/RulesTable.vue';
import EditModal from '@/components/EditModal.vue';
import TestModal from '@/components/TestModal.vue';
import { getRules, saveRules } from '@/common/storage';
import { i18n } from '@/common/ui';
import { createEmptyRuleFormDataItem } from '@/common/data';

interface RouteQuery {
  operation?: string;
  test?: string;
}

const data: RuleDataItem[] = reactive([]);
const ruleFormData: RuleFormDataItem = reactive(createEmptyRuleFormDataItem());
const ruleFormVisible = ref(false);
const ruleFormEdit = ref(false);
const testModalVisible = ref(false);

const count = computed(() => data.length);

const route = useRoute();

function save() {
  saveRules(toRaw(data));
}

function onSwitchClick(key: number, checked: boolean) {
  let state = false;
  data.forEach(item => {
    if (item.key === key) {
      item.enable = checked;
      state = true;
    }
  });

  state && save();
}

function onDeleteClick(key: number) {
  let state = false;
  let index = -1;
  for (let i = 0; i < data.length; i++) {
    if (data[i].key === key) {
      index = data[i].index;
      data.splice(i, 1);
      state = true;
      break;
    }
  }

  if (state) {
    //* 处理索引
    if (index > 0) {
      data.forEach(item => {
        if (item.index > index) {
          item.index--;
        }
      });
    }

    save();
  }
}

function changeRuleFormData(value: RuleFormDataItem) {
  Object.assign(ruleFormData, value);
}

function onEditClick(key: number) {
  //* 编辑规则
  for (const item of data) {
    if (item.key === key) {
      changeRuleFormData(
        Object.assign(toRaw(item), {
          test: '',
          testResult: '',
        })
      );
      ruleFormEdit.value = true;
      ruleFormVisible.value = true;
      break;
    }
  }
}

function onAddClick() {
  //* 添加新规则
  createNewRule();
}

function createNewRule(test = '') {
  const index = count.value + 1;
  changeRuleFormData({
    key: Date.now(),
    flags: [],
    index,
    name: i18n('rulesHandleDefaultNameText', index.toString()),
    pattern: '',
    replacement: '',
    test,
    testResult: '',
  });
  ruleFormEdit.value = false;
  ruleFormVisible.value = true;
}

function onTestClick() {
  testModalVisible.value = true;
}

function onConfirm(rule: RuleBasicDataItem) {
  let exist = false;
  const { index: newIndex, key: newKey } = rule;

  for (const item of data) {
    if (item.key === newKey) {
      //* 编辑规则
      exist = true;
      const oldIndex = item.index;
      if (oldIndex !== newIndex) {
        //* 编辑了索引
        data.forEach(el => {
          if (el.index >= newIndex && el.index < oldIndex) {
            el.index++;
          } else if (el.index <= newIndex && el.index > oldIndex) {
            el.index--;
          }
        });
      }
      Object.assign(item, rule);
      break;
    }
  }

  if (!exist) {
    //* 新增规则
    const indexMax = count.value + 1;
    if (newIndex !== indexMax) {
      data.forEach(item => {
        if (item.index >= newIndex) {
          //? 将 >= newIndex 的项的 index 值后移，即相当于将新项插入该位置
          item.index++;
        }
      });
    }
    data.push(
      Object.assign(rule, {
        enable: true,
      })
    );
  }

  save();
}

onBeforeMount(() => {
  getRules().then(async rules => {
    Object.assign(data, rules);
    const { operation, test } = route.query as RouteQuery;
    if (operation === 'add') {
      await nextTick();
      if (test) {
        const testValue = decodeURIComponent(test);
        createNewRule(testValue);
      } else {
        createNewRule();
      }
    }
  });
});
</script>

<style lang="less">
#rules-component {
  .btn-group {
    margin-bottom: 10px;
  }
}
</style>
