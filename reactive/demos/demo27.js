import { reactive, effect } from 'reactive';

console.log('--demo: 值没有发生变化不会触发响应-');
// 我感觉这个更像是遗留的问题，而不是功能，所以这个没有用例
const obj = reactive({
  text: 'Tom',
});
effect(() => {
  console.log('obj.text', obj.text);
});

setTimeout(() => {
  console.log('---值没有变化--')
  obj.text = 'Tom'
  console.log('-----')
}, 100);

setTimeout(() => {
  console.log('---值变为NaN--')
  obj.text = NaN
  console.log('-----')
}, 200);

setTimeout(() => {
  console.log('---值重新复制为NaN--')
  obj.text = NaN
  console.log('-----')
}, 200);