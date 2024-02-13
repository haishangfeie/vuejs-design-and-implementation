import { computed, reactive, effect } from 'reactive';

const obj = reactive({
  a: 1,
});
const b = computed(() => {
  console.log('--computed--');
  return obj.a + 1;
});

effect(() => {
  console.log('副作用函数执行');
  console.log('b.value', b.value);
});
setTimeout(() => {
  console.log('1秒后');
  obj.a++;
}, 1000);
