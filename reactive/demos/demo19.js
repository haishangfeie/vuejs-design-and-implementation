import { reactive, watch } from 'reactive';
console.log('--demo: watch 执行时机-异步执行--');
const obj = reactive({
  text: 'hello world',
});
watch(
  () => obj.text,
  (newVal, oldVal) => {
    console.log('数据变了');
    console.log('newVal', newVal);
    console.log('oldVal', oldVal);
  },
  {
    flush: 'post',
  }
);

obj.text = 'hello vue';
console.log('会先输出我，然后在执行回调');
