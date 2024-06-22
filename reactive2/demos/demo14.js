// 数组触发响应式
import { reactive, effect } from 'reactive';

const arr = [1, 2, 3, 4];

const arrProxy = reactive(arr);

// // 0. 直接修改值（这个不修改代码就已经实现了）
// effect(() => {
//   console.log(arrProxy[2]);
// });

// setTimeout(() => {
//   arrProxy[2] = 30;
// }, 500);

// // 1. 设置元素时变化,导致length变大
// effect(() => {
//   console.log(arrProxy.length);
// });
// setTimeout(() => {
//   arrProxy[10] = 30;
// }, 500);

// // 2. 改变长度导致元素值改变触发响应式
// effect(() => {
//   console.log(arrProxy[2]);
// });

// setTimeout(() => {
//   arrProxy.length = 2;
// }, 500);

// 3. for...in遍历数组，for...in 关联length
effect(() => {
  for (key in arr) {
    console.log(key);
  }
});

setTimeout(() => {
  arrProxy.length = 2;
}, 500);
