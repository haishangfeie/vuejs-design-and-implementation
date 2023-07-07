import { effect, reactive, computed } from 'reactive';
console.log('--demo: 计算属性-懒计算（只有读取时才会触发getter）--');
const obj = reactive({
  a: 1,
  b: 3,
});
const sumRes = computed(() => {
  console.log('getter被触发了');
  return obj.a + obj.b;
});

setTimeout(() => {
  console.log('1秒后，获取计算属性的值');
  console.log('sumRes.value:', sumRes.value);
}, 1000);
