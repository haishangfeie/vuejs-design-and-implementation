import { effect, reactive } from 'reactive';
console.log(
  '--demo: 数组 for of 遍历可迭代对象时，需要副作用函数与数组长度和索引之间建立响应式联系'
);

const arr = reactive([1, 2, 3, 4, 5]);
effect(() => {
  for (const val of arr) {
    console.log('val', val);
  }
});
console.log('修改元素值');
arr[1] = 'bar';
console.log('修改数组长度');
arr.length = 10;
