import { effect, reactive, computed } from 'reactive';
console.log('--demo: 计算属性-缓存值-值改变时会重新触发getter--');
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
console.log('修改obj.a');
obj.a++;
console.log('1秒后，重新获取c.value，getter会重新触发');
setTimeout(() => {
  console.log('1秒后');
  console.log('c.value',c.value);
}, 1000);
