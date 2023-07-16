import { reactive, watch } from 'reactive';
console.log('--demo: watch 支持立即执行--');
const obj = reactive({
  text: 'hello world',
  text2: 'hhh',
});
watch(
  () => obj.text,
  (newVal, oldVal) => {
    console.log('数据变了');
    console.log('newVal', newVal);
    console.log('oldVal', oldVal);
  },
  {
    immediate: true,
  }
);

obj.text = 'hello vue';
