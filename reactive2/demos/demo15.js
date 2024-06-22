// Array.prototype.includes
import { reactive } from 'reactive';

// 1 正确处理 arr.includes(arr[0])
// const obj = {};
// const arr = reactive([obj]);

// console.log('arr.includes(arr[0])', arr.includes(arr[0]));

// 2 正确处理 arr.includes(obj)
const obj = {};
const arr = reactive([obj]);

console.log('arr.includes(obj)', arr.includes(obj));
