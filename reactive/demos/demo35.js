import { effect, reactive } from 'reactive';
console.log(
  '--demo: 数组 for in遍历数组，发生影响遍历结果的操作时副作用函数要重新执行'
);
/* 
  会影响的操作有两个：
  1. 添加新元素：arr[100] = 'bar'
  2. 修改数组长度
  归根结底，都是数组的长度发生变化，也就是数组长度变化时需要触发响应式
*/

const arr = reactive(['foo']);
effect(() => {
  for (const key in arr) {
    console.log('key', key);
  }
});

console.log('添加新元素')
arr[2] = 'bar'
console.log('修改数组长度');
arr.length = 10

