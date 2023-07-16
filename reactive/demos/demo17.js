import { reactive, watch } from 'reactive';
console.log('--demo: watch 回调函数中拿到新值、旧值--');
const obj = reactive({
  text: 'hello world',
  text2: 'hhh',
});
watch(
  () => obj.text,
  (newVal, oldVal) => {
    console.log('数据变了');
    console.log('newVal',newVal);
    console.log('oldVal',oldVal);
  }
);

obj.text = 'hello vue';
