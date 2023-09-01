import { effect, reactive } from 'reactive';
console.log('--demo: 能从Set的响应式对象删除元素--');

const s = new Set([1, 2, 3]);
const p = reactive(s);
console.log('p.delete(1)', p.delete(1));
console.log('p.size', p.size);
console.log('p.has(1)', p.has(1));
console.log('p.has(2)', p.has(2));
