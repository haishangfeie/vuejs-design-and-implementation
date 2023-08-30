import { effect, reactive } from 'reactive';
console.log(
  '--demo: 数组使用includes方法寻找代理数组元素对应的原始对象时，应该要返回true'
);

const obj = {};
const arr = reactive([obj]);
console.log(arr.includes(obj));
