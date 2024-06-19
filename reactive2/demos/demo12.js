import { reactive, effect } from 'reactive';
const obj = {};
const proto = { bar: 1 };
const child = reactive(obj);
const parent = reactive(proto);
// 使用 parent 作为 child 的原型
Object.setPrototypeOf(child, parent);

effect(() => {
  console.log(child.bar); // 1
});
// 修改 child.bar 的值
child.bar = 2; // 修改后副作用函数重新执行1次
