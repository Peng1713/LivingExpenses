import localforage from 'localforage'

export const kv = localforage.createInstance({
  name: 'ledger-app',
  storeName: 'kv',
  description: '账本本地数据（IndexedDB）',
})

