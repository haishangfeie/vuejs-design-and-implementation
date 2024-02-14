import { reactive, watch } from 'reactive';

const obj = reactive({
  a: 1,
});

watch(
  () => obj.a,
  (val, oldVal) => {
    console.log(`val:`, val, `oldVal`, oldVal);
  }
);

setTimeout(() => {
  console.log('1秒后');
  obj.a++;
  obj.a++;
}, 1000);
