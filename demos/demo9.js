import { effect, reactive } from 'reactive';
console.log('--demo: 支持lazy--');
// 支持lazy
const obj = reactive({
  foo: 1,
});

const effectFn = effect(
  () => {
    console.log(obj.foo);
  },
  {
    lazy: true,
  }
);

setTimeout(() => {
  console.log('1秒后执行effectFn才会执行副作用函数');

  effectFn();
}, 1000);
