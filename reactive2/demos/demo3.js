import { effect, reactive } from 'reactive';

const obj = {
  a: 'a',
  b: 'b',
};
const proxy = reactive(obj);
effect(() => {
  console.log('外层effect执行');
  effect(() => {
    console.log('内层effect执行');
    proxy.b;
  });
  proxy.a;
});

setTimeout(() => {
  console.log('1秒后修改proxy.a，预期外层effect执行，内层effect一起执行');
  proxy.a = 'aa';
}, 1000);
