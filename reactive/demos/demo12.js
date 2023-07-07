import { effect, reactive, computed } from 'reactive';
console.log('--demo: 计算属性-缓存值--');
const obj = reactive({
  a: 1,
  b: 3,
});
const c = computed(() => {
  console.log('getter被触发了');
  return obj.a + obj.b;
});
console.log('读取c.value', c.value);
console.log('读取c.value', c.value);
console.log('读取c.value', c.value);