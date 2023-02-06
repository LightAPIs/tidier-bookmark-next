function createEmptyRuleFormDataItem(key?: number, index?: number): RuleFormDataItem {
  return {
    key: 0,
    flags: [],
    index: 1,
    name: '',
    pattern: '',
    replacement: '',
    test: '',
    testResult: '',
  };
}

export { createEmptyRuleFormDataItem };
