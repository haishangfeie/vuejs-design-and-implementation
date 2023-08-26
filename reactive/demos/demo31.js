import { readonly } from 'reactive';
console.log('--demo: 只读对象修改时不会生效');

const obj = readonly({
  foo: {
    bar: 1,
  },
});

obj.foo = 1;
console.log(obj.foo);
obj.foo.bar = 2;
obj.foo.name = 'name';
console.log(obj.foo.bar);
console.log(obj.foo.name);
