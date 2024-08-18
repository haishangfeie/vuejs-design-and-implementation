import { reactive, effect } from 'reactive';

const p = reactive(new Map([
  ['key1', 'value1'],
  ['key2', 'value2']
]))

effect(() => {
  for (const [key, value] of p.entries()) {
    console.log(key, value)
  }
})
console.log('--')
p.set('key3', 'value3') // 能够触发响应