import { reactive, effect } from 'reactive';
const arr = reactive([]);
// 第一个副作用函数
effect(() => {
  arr.push(1);
  console.log('副作用1', arr);
});

// 第二个副作用函数
effect(() => {
  arr.push(1);
  console.log('副作用2', arr);
});
