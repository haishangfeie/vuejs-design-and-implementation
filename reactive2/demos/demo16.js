import { reactive, effect } from 'reactive';
const arr = reactive([]);
// 第一个副作用函数
effect(() => {
  arr.push(1);
  console.log('副作用1', arr);
});

// 第二个副作用函数
effect(() => {
  arr.push(2);
  console.log('副作用2', arr);
});

// 第3个副作用函数
effect(() => {
  arr.unshift(3);
  console.log('副作用3', arr);
});

// 第4个副作用函数
effect(() => {
  arr.pop();
  console.log('副作用4', arr);
});
// 第5个副作用函数
effect(() => {
  arr.shift();
  console.log('副作用5', arr);
});

// 第6个副作用函数
effect(() => {
  arr.splice(0, 1);
  console.log('副作用6', arr);
});
