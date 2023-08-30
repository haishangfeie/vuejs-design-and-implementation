import { effect, reactive } from 'reactive';
console.log('--demo: 访问代理数组没有被修改元素时，每次访问到同一个代理对象');

const obj = {};
const arr = reactive([obj]);
console.log(arr.includes(arr[0]));
