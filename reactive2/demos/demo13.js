// 深响应&浅响应
import { reactive, shallowReactive, effect } from 'reactive';

// 深响应
// const obj = {
//   a: {
//     b: {
//       c: 1,
//     },
//   },
// };

// const proxy = reactive(obj);

// effect(() => {
//   console.log(proxy.a.b.c);
// });

// setTimeout(() => {
//   proxy.a.b.c = 2;
// }, 500);

// 浅响应;
const obj = {
  a: {
    b: {
      c: 1,
    },
  },
};

const proxy = shallowReactive(obj);

effect(() => {
  console.log(proxy.a.b.c);
});

setTimeout(() => {
  console.log('----500ms');
  proxy.a.b.c = 2;
}, 500);

setTimeout(() => {
  console.log('----1000ms');
  proxy.a = {
    b: {
      c: 3,
    },
  };
}, 1000);
