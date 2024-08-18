import { reactive, effect } from 'reactive';

const p = reactive(new Map([
  ['key1', 'value1'],
  ['key2', 'value2']
]))

effect(() => {
  for (const key of p.keys()) {
    console.log(key)
  }
})
console.log('--不能够触发响应')
p.set('key2', 'value22') // 不能够触发响应

console.log('--能够触发响应')
p.set('key3', 'value3') // 不能够触发响应