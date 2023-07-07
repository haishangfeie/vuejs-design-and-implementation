import { effect, reactive } from 'reactive';
console.log('--demo: 手动执行副作用函数时可以拿到副作用函数返回值--');
const obj = reactive({
  a: 1,
  b: 3,
});

const effectFn = effect(
  () => {
    return obj.a + obj.b;
  },
  { lazy: true }
);
console.log('副作用函数的返回值', effectFn());
