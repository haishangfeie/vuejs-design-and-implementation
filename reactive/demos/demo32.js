import { shallowReadonly } from 'reactive';
console.log('--demo: 浅只读对象修改修改浅层时不能修改，但是可以修改深层的数据');

const obj = shallowReadonly({
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
