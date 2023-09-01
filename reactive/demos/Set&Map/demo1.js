import { effect, reactive } from 'reactive';
console.log('--demo: 能从Set的响应式对象中读取到size的值--');

const s = new Set([1, 2, 3]);
const p = reactive(s);
console.log('p.size', p.size);
