import { shallowReactive, effect } from 'reactive';
console.log('--demo: 浅响应，深层对象变化不会触发响应式');

const obj = shallowReactive({
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
