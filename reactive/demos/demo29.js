import { reactive, effect } from 'reactive';
console.log('--demo: 深层属性变化触发副作用函数');

const obj = reactive({
  foo: {
    bar: 1,
  },
});

effect(() => {
  console.log('obj.foo.bar', obj.foo.bar);
});
setTimeout(() => {
  console.log('---');
  obj.foo.bar = 2;
}, 1000);
