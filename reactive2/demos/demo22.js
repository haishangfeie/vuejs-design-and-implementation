// 处理map 的forEach
import { reactive, effect } from 'reactive';

// const objKey = { key: 1 };
// const m = new Map([
//   [objKey, { value: 1 }],
//   [{ key: 2 }, { value: 2 }],
// ]);
// const map = reactive(m);
// effect(() => {
//   map.forEach(function (value, key, m) {
//     console.log(value); // { value: 1 }
//     console.log(key); // { key: 1 }
//   });
// });
// console.log('delete');
// map.delete(objKey);

// console.log('set');
// map.set({ key: 3 }, { value: 3 });

const objValue = { value: 1 };
const s = new Set([objValue, { value: 2 }]);
const set = reactive(s);
effect(() => {
  set.forEach(function (value) {
    console.log(value);
  });
});
console.log('delete');
set.delete(objValue);

console.log('add');
set.add({ value: 3 });
