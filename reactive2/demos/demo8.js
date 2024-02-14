import { reactive, watch } from 'reactive';

const obj = reactive({
  a: 1,
});

watch(
  () => obj.a,
  (val, oldVal) => {
    console.log(`val:`, val, `oldVal`, oldVal);
  },
  {
    immediate: true,
    flush: 'post',
  }
);
console.log('----');

setTimeout(() => {
  console.log('1秒后');
  obj.a++;
  obj.a++;
  console.log('1秒后---end');
}, 1000);
