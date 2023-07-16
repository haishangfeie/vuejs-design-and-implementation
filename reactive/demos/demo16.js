import { reactive, watch } from 'reactive';
console.log('--demo: watch 接收getter函数--');
const obj = reactive({
  text: 'hello world',
  text2: 'hhh',
});
watch(
  () => obj.text,
  () => {
    console.log('数据变了');
  }
);

obj.text = 'hello vue';
