import { reactive, effect } from 'reactive';
console.log('--demo: 避免实例原型的代理对象的set拦截函数被执行')
const obj = {};
const proto = { bar: 1 };
const child = reactive(obj);
const parent = reactive(proto);

// 使用parent作为child的原型
Object.setPrototypeOf(child, parent);

effect(() => {
  console.log('child.bar', child.bar);
});
console.log('---');
child.bar = 2;
console.log('parent.bar', parent.bar);
