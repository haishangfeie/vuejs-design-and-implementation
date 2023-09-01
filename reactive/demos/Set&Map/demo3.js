import { effect, reactive } from 'reactive';
console.log('--demo: 新增、删除操作可以触发副作用函数内访问了size属性的响应--');

const s = reactive(new Set([1, 2, 3]));

effect(() => {
  console.log('s.size', s.size);
});
console.log('添加新元素');
s.add(4);
console.log('添加已有元素');
s.add(1);
console.log('删除已有元素');
s.delete(1)
console.log('删除不存在的元素');
s.delete(100)

